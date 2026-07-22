import {
  FiArrowRight,
  FiCheck,
  FiMapPin,
  FiPackage,
  FiTruck,
  FiX,
} from 'react-icons/fi';

import { useNavigate } from 'react-router-dom';
import StatusPill from './StatusPill';

const OrderCard = ({
  order,
  role,
  onAccept,
  onCancel,
}) => {
  const navigate = useNavigate();

  /*
   * Solo se muestra el botón Aceptar cuando:
   * 1. El usuario es repartidor.
   * 2. El pedido está pendiente.
   * 3. El componente padre envió una función onAccept.
   */
  const canAccept =
    role === 'repartidor' &&
    order.estado === 'pendiente' &&
    typeof onAccept === 'function';

  /*
   * Solo se muestra el botón Cancelar cuando:
   * 1. El usuario es cliente.
   * 2. El pedido está pendiente.
   * 3. El componente padre envió una función onCancel.
   */
  const canCancel =
    role === 'cliente' &&
    order.estado === 'pendiente' &&
    typeof onCancel === 'function';

  const openDetail = () => {
    navigate(`/dashboard/orders/${order._id}`);
  };

  const acceptOrder = () => {
    if (typeof onAccept === 'function') {
      onAccept(order._id);
    }
  };

  const cancelOrder = () => {
    if (typeof onCancel === 'function') {
      onCancel(order._id);
    }
  };

  return (
    <article className="order-card">
      <div className="order-card__top">
        <span className="order-card__code">
          {order.codigo}
        </span>

        <StatusPill value={order.estado} />
      </div>

      <div>
        <h3>
          <FiPackage />

          {' '}
          {order.cantidadCilindros}

          {' '}
          cilindro
          {order.cantidadCilindros !== 1 ? 's' : ''}
        </h3>

        <p>
          <FiMapPin />

          {' '}
          {order.direccionEntrega}
        </p>
      </div>

      <div className="order-card__meta">
        <span>
          {order.repartidor?.nombre
            ? `🚚 ${order.repartidor.nombre}`
            : 'Sin repartidor'}
        </span>

        <StatusPill value={order.estadoPago} />
      </div>

      <div className="order-card__top">
        <span className="order-card__price">
          ${Number(order.total || 0).toFixed(2)}
        </span>

        <small>
          {order.createdAt
            ? new Date(order.createdAt).toLocaleDateString(
                'es-EC'
              )
            : 'Sin fecha'}
        </small>
      </div>

      <div className="order-actions">
        <button
          type="button"
          className="
            gc-button
            gc-button--secondary
            gc-button--small
          "
          onClick={openDetail}
        >
          Ver detalle

          <FiArrowRight />
        </button>

        {canAccept && (
          <button
            type="button"
            className="
              gc-button
              gc-button--success
              gc-button--small
            "
            onClick={acceptOrder}
          >
            <FiTruck />

            Aceptar
          </button>
        )}

        {canCancel && (
          <button
            type="button"
            className="
              gc-button
              gc-button--danger
              gc-button--small
            "
            onClick={cancelOrder}
          >
            <FiX />

            Cancelar
          </button>
        )}

        {order.estado === 'entregado' && (
          <span title="Entrega completada">
            <FiCheck color="var(--gc-success)" />
          </span>
        )}
      </div>
    </article>
  );
};

export default OrderCard;