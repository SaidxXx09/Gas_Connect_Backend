import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  FiCreditCard,
  FiMessageCircle,
  FiPackage,
  FiPlus,
  FiTruck,
  FiUsers,
} from 'react-icons/fi';

import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import api from '../../api/axios';
import useAuthStore from '../../context/storeAuth';

import camion from '../../assets/camion-grande-Photoroom.webp';

import OrderCard from '../../components/dashboard/OrderCard';
import OrderFormModal from '../../components/dashboard/OrderFormModal';

import { getSocket } from '../../services/socket';

/*
 * Inserta un pedido nuevo o actualiza uno existente.
 * Evita que el mismo pedido aparezca repetido.
 */
const upsertOrder = (currentOrders, updatedOrder) => {
  if (!updatedOrder?._id) {
    return currentOrders;
  }

  const exists = currentOrders.some(
    (order) => order._id === updatedOrder._id
  );

  if (exists) {
    return currentOrders.map((order) =>
      order._id === updatedOrder._id
        ? updatedOrder
        : order
    );
  }

  return [
    updatedOrder,
    ...currentOrders,
  ];
};

const Overview = () => {
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);

  const [orders, setOrders] = useState([]);
  const [showCreate, setShowCreate] =
    useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const { data } = await api.get('/orders');

      setOrders(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        'Error al cargar pedidos del dashboard:',
        error
      );

      setOrders([]);

      toast.error(
        error.response?.data?.mensaje ||
          'No se pudieron cargar los pedidos'
      );
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  /*
   * Mantiene actualizado el dashboard cuando
   * cambia un pedido mediante Socket.IO.
   */
  useEffect(() => {
    const socket = getSocket();

    const handleOrderUpdate = (updatedOrder) => {
      setOrders((currentOrders) =>
        upsertOrder(
          currentOrders,
          updatedOrder
        )
      );
    };

    socket.on(
      'order:updated',
      handleOrderUpdate
    );

    return () => {
      socket.off(
        'order:updated',
        handleOrderUpdate
      );
    };
  }, []);

  /*
   * Permite aceptar el pedido directamente
   * desde el dashboard del repartidor.
   */
  const acceptOrder = async (orderId) => {
    try {
      const { data } = await api.post(
        `/orders/${orderId}/accept`
      );

      if (data.order) {
        setOrders((currentOrders) =>
          upsertOrder(
            currentOrders,
            data.order
          )
        );
      }

      toast.success(
        data.mensaje ||
          'Pedido aceptado correctamente'
      );
    } catch (error) {
      console.error(
        'Error al aceptar pedido:',
        error
      );

      toast.error(
        error.response?.data?.mensaje ||
          'No se pudo aceptar el pedido'
      );
    }
  };

  /*
   * Permite cancelar el pedido directamente
   * desde el dashboard del cliente.
   */
  const cancelOrder = async (orderId) => {
    const confirmed = window.confirm(
      '¿Estás seguro de cancelar este pedido?'
    );

    if (!confirmed) {
      return;
    }

    try {
      const { data } = await api.patch(
        `/orders/${orderId}/cancel`,
        {
          motivo: 'Cancelado por el usuario',
        }
      );

      if (data.order) {
        setOrders((currentOrders) =>
          upsertOrder(
            currentOrders,
            data.order
          )
        );
      }

      toast.success(
        data.mensaje ||
          'Pedido cancelado correctamente'
      );
    } catch (error) {
      console.error(
        'Error al cancelar pedido:',
        error
      );

      toast.error(
        error.response?.data?.mensaje ||
          'No se pudo cancelar el pedido'
      );
    }
  };

  const counts = useMemo(
    () => ({
      total: orders.length,

      pending: orders.filter(
        (order) =>
          order.estado === 'pendiente'
      ).length,

      transit: orders.filter((order) =>
        [
          'aceptado',
          'en camino',
        ].includes(order.estado)
      ).length,

      delivered: orders.filter(
        (order) =>
          order.estado === 'entregado'
      ).length,
    }),
    [orders]
  );

  return (
    <>
      <section className="hero-dashboard">
        <div>
          <span className="hero-dashboard__badge">
            🔥 Operación GasConnect
          </span>

          <h2>
            {role === 'cliente'
              ? 'Tu gas, más cerca y sin complicaciones.'
              : role === 'repartidor'
                ? 'Entregas claras, rutas rápidas.'
                : 'Controla toda la operación desde un solo panel.'}
          </h2>

          <p>
            Gestiona pedidos, pagos, ubicación,
            mensajes y soporte inteligente con una
            experiencia adaptada a cada rol.
          </p>

          <div className="hero-actions">
            {role === 'cliente' && (
              <button
                type="button"
                className="
                  gc-button
                  gc-button--primary
                "
                onClick={() =>
                  setShowCreate(true)
                }
              >
                <FiPlus />

                Nuevo pedido
              </button>
            )}

            <Link
              className="
                gc-button
                gc-button--ghost
              "
              to="/dashboard/orders"
            >
              Ver pedidos
            </Link>
          </div>
        </div>

        <img
          src={camion}
          alt="Camión de entregas GasConnect"
        />
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-card__icon">
            <FiPackage />
          </div>

          <div>
            <strong>
              {counts.total}
            </strong>

            <span>
              Pedidos visibles
            </span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-card__icon">
            <FiTruck />
          </div>

          <div>
            <strong>
              {counts.transit}
            </strong>

            <span>
              En operación
            </span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-card__icon">
            <FiCreditCard />
          </div>

          <div>
            <strong>
              {
                orders.filter(
                  (order) =>
                    order.estadoPago ===
                    'pagado'
                ).length
              }
            </strong>

            <span>
              Pagos aprobados
            </span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-card__icon">
            <FiUsers />
          </div>

          <div>
            <strong>
              {counts.delivered}
            </strong>

            <span>
              Entregas finalizadas
            </span>
          </div>
        </article>
      </section>

      <section className="dashboard-grid">
        <div className="gc-card">
          <div className="gc-card__header">
            <h3>
              Actividad reciente
            </h3>

            <Link to="/dashboard/orders">
              Ver todo
            </Link>
          </div>

          {orders.length ? (
            <div className="orders-grid">
              {orders
                .slice(0, 3)
                .map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    role={role}
                    onAccept={acceptOrder}
                    onCancel={cancelOrder}
                  />
                ))}
            </div>
          ) : (
            <div className="empty-state">
              <FiPackage />

              <p>
                Todavía no hay pedidos
                para mostrar.
              </p>
            </div>
          )}
        </div>

        <aside className="gc-card">
          <div className="gc-card__header">
            <h3>
              Accesos rápidos
            </h3>
          </div>

          <div className="quick-actions">
            <Link
              className="quick-action"
              to="/dashboard/orders"
            >
              <FiPackage />

              <span>
                Gestionar pedidos
              </span>
            </Link>

            <Link
              className="quick-action"
              to="/dashboard/messages"
            >
              <FiMessageCircle />

              <span>
                Chat en tiempo real
              </span>
            </Link>

            <Link
              className="quick-action"
              to="/dashboard/assistant"
            >
              <span>
                🦉
              </span>

              <span>
                Preguntar a Sparky
              </span>
            </Link>

            <Link
              className="quick-action"
              to="/dashboard/profile"
            >
              <span>
                👤
              </span>

              <span>
                Actualizar mi perfil
              </span>
            </Link>
          </div>

          <p
            className="form-help"
            style={{
              marginTop: 18,
            }}
          >
            Sesión iniciada como{' '}

            <strong>
              {user?.email}
            </strong>.
          </p>
        </aside>
      </section>

      {showCreate && (
        <OrderFormModal
          onClose={() =>
            setShowCreate(false)
          }
          onCreated={(order) => {
            setOrders((currentOrders) =>
              upsertOrder(
                currentOrders,
                order
              )
            );
          }}
        />
      )}
    </>
  );
};

export default Overview;