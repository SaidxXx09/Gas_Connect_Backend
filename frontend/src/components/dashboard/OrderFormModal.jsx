import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiMapPin, FiNavigation, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const createRequestId = () => (
  globalThis.crypto?.randomUUID?.()
  || `order-${Date.now()}-${Math.random().toString(36).slice(2)}`
);

const OrderFormModal = ({ onClose, onCreated }) => {
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const requestIdRef = useRef(createRequestId());
  const submittingRef = useRef(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm({
    defaultValues: { cantidadCilindros: 1 },
  });

  const quantity = Number(watch('cantidadCilindros') || 1);
  const unitPrice = 3.5;

  const locate = () => {
    if (!navigator.geolocation) {
      toast.error('Tu navegador no permite obtener la ubicación');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ latitud: position.coords.latitude, longitud: position.coords.longitude });
        setLocating(false);
        toast.success('Ubicación capturada');
      },
      () => {
        setLocating(false);
        toast.error('No se pudo obtener la ubicación. Revisa los permisos.');
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  const submit = async (data) => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    try {
      const response = await api.post('/orders', {
        ...data,
        cantidadCilindros: Number(data.cantidadCilindros),
        clientRequestId: requestIdRef.current,
        ...coords,
      });
      toast.success(response.data.mensaje);
      onCreated(response.data.order);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.mensaje || 'No se pudo crear el pedido');
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="gc-modal" role="dialog" aria-modal="true" aria-labelledby="new-order-title">
        <header className="gc-modal__header">
          <div><p className="form-help">Pedido a domicilio</p><h3 id="new-order-title">Solicita tus cilindros</h3></div>
          <button className="gc-modal__close" type="button" onClick={onClose}><FiX /></button>
        </header>

        <div className="gc-modal__body">
          <form className="gc-form" onSubmit={handleSubmit(submit)}>
            <div className="form-row">
              <div className="form-field">
                <label>Cantidad de cilindros</label>
                <input type="number" min="1" max="20" {...register('cantidadCilindros', {
                  required: 'La cantidad es obligatoria',
                  min: { value: 1, message: 'Mínimo 1' },
                  max: { value: 20, message: 'Máximo 20' },
                })} />
                {errors.cantidadCilindros && <span className="form-error">{errors.cantidadCilindros.message}</span>}
              </div>
              <div className="form-field">
                <label>Total aproximado</label>
                <input value={`$${(quantity * unitPrice).toFixed(2)}`} readOnly />
                <span className="form-help">El servidor recalcula el valor oficial.</span>
              </div>
            </div>

            <div className="form-field">
              <label>Dirección de entrega</label>
              <textarea placeholder="Calle principal, numeración y sector" {...register('direccionEntrega', {
                required: 'La dirección es obligatoria',
                minLength: { value: 8, message: 'Describe mejor la dirección' },
              })} />
              {errors.direccionEntrega && <span className="form-error">{errors.direccionEntrega.message}</span>}
            </div>

            <div className="form-field">
              <label>Referencia</label>
              <input placeholder="Ej. Casa azul junto a la farmacia" {...register('referenciaEntrega')} />
            </div>

            <div className="location-box">
              <div>
                <strong><FiMapPin /> Ubicación para el mapa</strong>
                <p className="form-help">{coords ? `${coords.latitud.toFixed(5)}, ${coords.longitud.toFixed(5)}` : 'Opcional, pero recomendada para el repartidor.'}</p>
              </div>
              <button type="button" className="gc-button gc-button--secondary gc-button--small" onClick={locate} disabled={locating}>
                <FiNavigation /> {locating ? 'Buscando...' : 'Usar mi ubicación'}
              </button>
            </div>

            <button type="submit" className="gc-button gc-button--primary" disabled={isSubmitting || submittingRef.current}>
              {isSubmitting ? 'Creando pedido...' : 'Confirmar pedido'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderFormModal;
