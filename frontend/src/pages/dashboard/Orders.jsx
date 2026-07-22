import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiFilter, FiPlus, FiRefreshCw, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import useAuthStore from '../../context/storeAuth';
import OrderCard from '../../components/dashboard/OrderCard';
import OrderFormModal from '../../components/dashboard/OrderFormModal';
import { getSocket } from '../../services/socket';

const upsertOrder = (current, updated) => {
  if (!updated?._id) return current;
  const exists = current.some((order) => order._id === updated._id);
  return exists
    ? current.map((order) => order._id === updated._id ? updated : order)
    : [updated, ...current];
};

const Orders = () => {
  const role = useAuthStore((state) => state.role);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/orders', { params: status ? { estado: status } : {} }); setOrders(data); }
    catch (error) { toast.error(error.response?.data?.mensaje || 'No se pudieron cargar los pedidos'); }
    finally { setLoading(false); }
  }, [status]);

  useEffect(() => { loadOrders(); }, [loadOrders]);
  useEffect(() => {
    const socket = getSocket();
    const onUpdate = (updated) => setOrders((current) => upsertOrder(current, updated));
    socket.on('order:updated', onUpdate);
    return () => socket.off('order:updated', onUpdate);
  }, []);

  const accept = async (id) => {
    try { const { data } = await api.post(`/orders/${id}/accept`); toast.success(data.mensaje); }
    catch (error) { toast.error(error.response?.data?.mensaje || 'No se pudo aceptar'); }
  };
  const cancel = async (id) => {
    if (!window.confirm('¿Cancelar este pedido?')) return;
    try { const { data } = await api.patch(`/orders/${id}/cancel`, { motivo: 'Cancelado por el usuario' }); toast.success(data.mensaje); }
    catch (error) { toast.error(error.response?.data?.mensaje || 'No se pudo cancelar'); }
  };

  const filtered = useMemo(() => orders.filter((order) => {
    const term = search.toLowerCase();
    return !term || [order.codigo, order.direccionEntrega, order.cliente?.nombre, order.repartidor?.nombre].some((value) => String(value || '').toLowerCase().includes(term));
  }), [orders, search]);

  return (
    <>
      <header className="page-heading"><div><h2>{role === 'cliente' ? 'Mis pedidos' : role === 'repartidor' ? 'Centro de entregas' : 'Gestión de pedidos'}</h2><p>Consulta estados, asignaciones, pagos, evidencia, mapas y comunicación de cada entrega.</p></div>{role === 'cliente' && <button className="gc-button gc-button--primary" onClick={() => setShowCreate(true)}><FiPlus /> Nuevo pedido</button>}</header>
      <div className="filter-bar"><div style={{ position: 'relative' }}><FiSearch style={{ position: 'absolute', left: 12, top: 13 }} /><input style={{ paddingLeft: 38 }} placeholder="Buscar por código, dirección o usuario" value={search} onChange={(event) => setSearch(event.target.value)} /></div><FiFilter /><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Todos los estados</option><option value="pendiente">Pendiente</option><option value="aceptado">Aceptado</option><option value="en camino">En camino</option><option value="entregado">Entregado</option><option value="cancelado">Cancelado</option></select><button className="gc-button gc-button--ghost gc-button--small" onClick={loadOrders}><FiRefreshCw /> Actualizar</button></div>
      {loading ? <div className="empty-state">Cargando pedidos...</div> : filtered.length ? <div className="orders-grid">{filtered.map((order) => <OrderCard key={order._id} order={order} role={role} onAccept={accept} onCancel={cancel} />)}</div> : <div className="gc-card empty-state"><p>No se encontraron pedidos con esos filtros.</p></div>}
      {showCreate && <OrderFormModal onClose={() => setShowCreate(false)} onCreated={(order) => setOrders((current) => upsertOrder(current, order))} />}
    </>
  );
};
export default Orders;
