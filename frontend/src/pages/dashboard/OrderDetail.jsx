import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiArrowLeft, FiCamera, FiCreditCard, FiMapPin, FiMessageCircle, FiNavigation, FiRefreshCw, FiTruck } from 'react-icons/fi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import useAuthStore from '../../context/storeAuth';
import StatusPill from '../../components/dashboard/StatusPill';
import OrderMap from '../../components/dashboard/OrderMap';
import KushkiPaymentModal from '../../components/dashboard/KushkiPaymentModal';
import { getSocket } from '../../services/socket';

const timeline = ['pendiente', 'aceptado', 'en camino', 'entregado'];

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);
  const [order, setOrder] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [tracking, setTracking] = useState(false);
  const watchRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get(`/orders/${id}`); setOrder(data); }
    catch (error) { toast.error(error.response?.data?.mensaje || 'No se pudo cargar el pedido'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (role !== 'administrador') return;
    api.get('/auth/users', { params: { role: 'repartidor' } }).then(({ data }) => setDrivers(data.filter((user) => user.activo))).catch(() => {});
  }, [role]);
  useEffect(() => {
    const socket = getSocket();
    socket.emit('order:join', { orderId: id });
    const onOrder = (updated) => updated._id === id && setOrder(updated);
    const onLocation = ({ orderId, lat, lng, updatedAt }) => {
      if (orderId !== id) return;
      setOrder((current) => current ? { ...current, ubicacionRepartidor: { type: 'Point', coordinates: [lng, lat] }, ubicacionActualizadaAt: updatedAt } : current);
    };
    socket.on('order:updated', onOrder); socket.on('location:updated', onLocation);
    return () => { socket.emit('order:leave', { orderId: id }); socket.off('order:updated', onOrder); socket.off('location:updated', onLocation); };
  }, [id]);
  useEffect(() => () => { if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current); }, []);

  const updateStatus = async (estado) => {
    try { const { data } = await api.patch(`/orders/${id}/status`, { estado }); setOrder(data.order); toast.success(data.mensaje); }
    catch (error) { toast.error(error.response?.data?.mensaje || 'No se pudo cambiar el estado'); }
  };
  const assign = async (event) => {
    if (!event.target.value) return;
    try { const { data } = await api.patch(`/orders/${id}/assign`, { repartidorId: event.target.value }); setOrder(data.order); toast.success(data.mensaje); }
    catch (error) { toast.error(error.response?.data?.mensaje || 'No se pudo asignar'); }
  };
  const uploadProof = async (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    const form = new FormData(); form.append('proof', file);
    try { const { data } = await api.put(`/orders/${id}/proof`, form); setOrder(data.order); toast.success(data.mensaje); }
    catch (error) { toast.error(error.response?.data?.mensaje || 'No se pudo subir la evidencia'); }
  };
  const toggleTracking = () => {
    if (!navigator.geolocation) return toast.error('El navegador no permite geolocalización');
    if (tracking) { navigator.geolocation.clearWatch(watchRef.current); watchRef.current = null; setTracking(false); return; }
    const socket = getSocket();
    watchRef.current = navigator.geolocation.watchPosition(
      (position) => socket.emit('location:update', { orderId: id, lat: position.coords.latitude, lng: position.coords.longitude }, (reply) => { if (!reply?.ok) toast.error(reply?.message || 'Error al compartir ubicación'); }),
      () => toast.error('No se pudo acceder a tu ubicación'),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
    setTracking(true); toast.success('Ubicación en tiempo real activada');
  };

  const currentIndex = useMemo(() => order ? timeline.indexOf(order.estado) : -1, [order]);
  if (loading) return <div className="gc-card empty-state">Cargando detalle...</div>;
  if (!order) return <div className="gc-card empty-state">Pedido no disponible.</div>;
  const canDeliver = ['repartidor', 'administrador'].includes(role);

  return (
    <>
      <header className="page-heading"><div><button className="gc-button gc-button--ghost gc-button--small" onClick={() => navigate(-1)}><FiArrowLeft /> Volver</button><h2 style={{ marginTop: 13 }}>{order.codigo}</h2><p>{order.direccionEntrega}</p></div><div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}><StatusPill value={order.estado} /><StatusPill value={order.estadoPago} /><button className="gc-button gc-button--ghost gc-button--small" onClick={load}><FiRefreshCw /></button></div></header>
      <div className="detail-grid">
        <div className="detail-stack">
          <section className="gc-card"><div className="gc-card__header"><h3>Información del pedido</h3><span className="order-card__price">${Number(order.total).toFixed(2)}</span></div><div className="detail-list"><div className="detail-item"><span>Cliente</span><strong>{order.cliente?.nombre}</strong></div><div className="detail-item"><span>Teléfono</span><strong>{order.cliente?.telefono || 'No registrado'}</strong></div><div className="detail-item"><span>Cantidad</span><strong>{order.cantidadCilindros} cilindro(s)</strong></div><div className="detail-item"><span>Precio unitario</span><strong>${Number(order.precioUnitario).toFixed(2)}</strong></div><div className="detail-item"><span>Repartidor</span><strong>{order.repartidor?.nombre || 'Pendiente de asignación'}</strong></div><div className="detail-item"><span>Referencia</span><strong>{order.referenciaEntrega || 'Sin referencia'}</strong></div></div></section>
          <section className="gc-card"><div className="gc-card__header"><h3><FiMapPin /> Seguimiento</h3>{role === 'repartidor' && order.repartidor?._id && <button className={`gc-button ${tracking ? 'gc-button--danger' : 'gc-button--success'} gc-button--small`} onClick={toggleTracking}><FiNavigation /> {tracking ? 'Detener ubicación' : 'Compartir ubicación'}</button>}</div><OrderMap delivery={order.ubicacionEntrega} driver={order.ubicacionRepartidor} route={order.rutaOptima} /><p className="form-help">{order.ubicacionActualizadaAt ? `Última actualización: ${new Date(order.ubicacionActualizadaAt).toLocaleString('es-EC')}` : 'El repartidor todavía no ha compartido su ubicación.'}</p></section>
          {order.evidenciaEntrega?.url && <section className="gc-card"><div className="gc-card__header"><h3>Evidencia de entrega</h3></div><img className="proof-image" src={order.evidenciaEntrega.url} alt="Evidencia fotográfica de la entrega" /></section>}
        </div>
        <aside className="detail-stack">
          <section className="gc-card"><div className="gc-card__header"><h3>Progreso</h3></div><div className="order-timeline">{timeline.map((step, index) => <div key={step} className={`timeline-step ${currentIndex >= index ? 'is-done' : ''}`}><div className="timeline-step__dot" /><div><strong style={{ textTransform: 'capitalize' }}>{step}</strong><p className="form-help">{index === 0 ? 'Pedido registrado' : index === 1 ? 'Repartidor asignado' : index === 2 ? 'Entrega en recorrido' : 'Entrega finalizada'}</p></div></div>)}</div>{order.estado === 'cancelado' && <div className="config-notice" style={{ background: '#ffe8e8', borderColor: '#ffc4c4', color: '#a52e2e' }}>Este pedido fue cancelado.</div>}</section>
          <section className="gc-card"><div className="gc-card__header"><h3>Acciones</h3></div><div className="quick-actions">
            <Link className="quick-action" to={`/dashboard/messages/${order._id}`}><FiMessageCircle /><span>Abrir chat de la entrega</span></Link>
            {role === 'cliente' && order.estadoPago !== 'pagado' && !['cancelado'].includes(order.estado) && <button className="quick-action" onClick={() => setPaying(true)}><FiCreditCard /><span>Pagar con Kushki</span></button>}
            {role === 'administrador' && <div className="form-field"><label>Asignar repartidor</label><select value={order.repartidor?._id || ''} onChange={assign}><option value="">Seleccionar...</option>{drivers.map((driver) => <option key={driver._id} value={driver._id}>{driver.nombre}</option>)}</select></div>}
            {canDeliver && ['aceptado'].includes(order.estado) && <button className="gc-button gc-button--primary" onClick={() => updateStatus('en camino')}><FiTruck /> Marcar en camino</button>}
            {canDeliver && order.estado === 'en camino' && <label className="gc-button gc-button--secondary"><FiCamera /> Subir foto<input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={uploadProof} /></label>}
            {canDeliver && order.estado === 'en camino' && <button className="gc-button gc-button--success" disabled={!order.evidenciaEntrega?.url} onClick={() => updateStatus('entregado')}>Confirmar entrega</button>}
          </div></section>
        </aside>
      </div>
      {paying && <KushkiPaymentModal order={order} onClose={() => setPaying(false)} onPaid={setOrder} />}
    </>
  );
};
export default OrderDetail;
