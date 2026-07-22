import { useCallback, useEffect, useRef, useState } from 'react';
import { FiAlertCircle, FiMessageCircle, FiRefreshCw, FiSend } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import useAuthStore from '../../context/storeAuth';
import { getSocket } from '../../services/socket';

const RealtimeChat = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(orderId || '');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState('');
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');
  const [socketStatus, setSocketStatus] = useState('conectando');
  const endRef = useRef(null);
  const typingTimer = useRef(null);

  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    setError('');

    try {
      const { data } = await api.get('/orders');
      const list = Array.isArray(data) ? data : [];
      const chatOrders = list.filter((order) => order.repartidor || order.estado !== 'pendiente');
      setOrders(chatOrders);
      setSelected((current) => {
        if (current && chatOrders.some((order) => order._id === current)) return current;
        return chatOrders[0]?._id || '';
      });
    } catch (requestError) {
      setOrders([]);
      setError(requestError.response?.data?.mensaje || 'No se pudieron cargar las conversaciones');
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (orderId) setSelected(orderId);
  }, [orderId]);

  const loadMessages = useCallback(async () => {
    if (!selected) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);

    try {
      const { data } = await api.get(`/realtime-chat/orders/${selected}/messages`);
      setMessages(Array.isArray(data) ? data : []);
      await api.patch(`/realtime-chat/orders/${selected}/read`).catch(() => {});
    } catch (requestError) {
      setMessages([]);
      toast.error(requestError.response?.data?.mensaje || 'No se pudo abrir el chat');
    } finally {
      setLoadingMessages(false);
    }
  }, [selected]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setSocketStatus('conectado');
    const onDisconnect = () => setSocketStatus('desconectado');
    const onConnectError = (socketError) => {
      setSocketStatus('error');
      console.error('Socket.IO:', socketError.message);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    if (socket.connected) setSocketStatus('conectado');

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
    };
  }, []);

  useEffect(() => {
    if (!selected) return undefined;

    const socket = getSocket();

    socket.emit('order:join', { orderId: selected }, (reply) => {
      if (reply && !reply.ok) toast.error(reply.message || 'No se pudo entrar a la conversación');
    });

    const onMessage = (message) => {
      const messageOrderId = String(message.order?._id || message.order || '');
      if (messageOrderId !== String(selected)) return;

      setMessages((current) => (
        current.some((item) => item._id === message._id)
          ? current
          : [...current, message]
      ));
    };

    const onTyping = (payload) => {
      if (payload.orderId === selected && payload.userId !== String(user?._id)) {
        setTyping(payload.isTyping ? `${payload.nombre} está escribiendo...` : '');
      }
    };

    socket.on('chat:message', onMessage);
    socket.on('chat:typing', onTyping);

    return () => {
      clearTimeout(typingTimer.current);
      socket.emit('chat:typing', { orderId: selected, isTyping: false });
      socket.emit('order:leave', { orderId: selected });
      socket.off('chat:message', onMessage);
      socket.off('chat:typing', onTyping);
    };
  }, [selected, user?._id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const choose = (id) => {
    setSelected(id);
    navigate(`/dashboard/messages/${id}`, { replace: true });
  };

  const changeText = (event) => {
    setText(event.target.value);
    if (!selected) return;

    const socket = getSocket();
    socket.emit('chat:typing', { orderId: selected, isTyping: true });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('chat:typing', { orderId: selected, isTyping: false });
    }, 900);
  };

  const send = (event) => {
    event.preventDefault();
    const clean = text.trim();
    if (!clean || !selected) return;

    setText('');
    clearTimeout(typingTimer.current);
    const socket = getSocket();
    socket.emit('chat:typing', { orderId: selected, isTyping: false });
    socket.emit('chat:send', { orderId: selected, text: clean }, (reply) => {
      if (!reply?.ok) {
        toast.error(reply?.message || 'No se pudo enviar el mensaje');
        setText(clean);
      }
    });
  };

  const selectedOrder = orders.find((order) => order._id === selected);

  return (
    <>
      <header className="page-heading">
        <div>
          <h2>Chat en tiempo real</h2>
          <p>Comunicación directa vinculada a cada pedido.</p>
        </div>
        <span className={`socket-status socket-status--${socketStatus}`}>Tiempo real: {socketStatus}</span>
      </header>

      {error && (
        <div className="config-notice">
          <FiAlertCircle /> {error}
          <button type="button" className="gc-button gc-button--ghost gc-button--small" onClick={loadOrders}>
            <FiRefreshCw /> Reintentar
          </button>
        </div>
      )}

      <div className="chat-layout">
        <aside className="chat-orders">
          <div className="gc-card__header"><h3>Conversaciones</h3></div>
          {loadingOrders ? (
            <div className="empty-state"><p>Cargando pedidos...</p></div>
          ) : orders.length ? (
            orders.map((order) => (
              <button type="button" key={order._id} className={`chat-order-button ${selected === order._id ? 'active' : ''}`} onClick={() => choose(order._id)}>
                <strong>{order.codigo}</strong>
                <span>{order.cliente?.nombre || 'Cliente'} · {order.repartidor?.nombre || 'Sin repartidor'}</span>
                <span>{order.direccionEntrega}</span>
              </button>
            ))
          ) : (
            <div className="empty-state"><FiMessageCircle /><p>No hay pedidos con chat disponible.</p></div>
          )}
        </aside>

        <section className="chat-panel">
          <header className="chat-header">
            <h3>{selectedOrder ? `Pedido ${selectedOrder.codigo}` : 'Selecciona una conversación'}</h3>
            <span className="typing-indicator">{typing}</span>
          </header>

          <div className="chat-messages">
            {loadingMessages ? (
              <div className="empty-state"><p>Cargando mensajes...</p></div>
            ) : selected ? (
              messages.length ? messages.map((message) => {
                const mine = String(message.sender?._id || message.sender) === String(user?._id);
                return (
                  <article className={`chat-bubble ${mine ? 'mine' : ''}`} key={message._id}>
                    <strong>{mine ? 'Tú' : message.sender?.nombre || 'Usuario'}</strong>
                    <p>{message.text}</p>
                    <time>{new Date(message.createdAt).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}</time>
                  </article>
                );
              }) : <div className="empty-state"><p>Envía el primer mensaje de esta entrega.</p></div>
            ) : <div className="empty-state"><p>Selecciona un pedido para comenzar.</p></div>}
            <div ref={endRef} />
          </div>

          <form className="chat-form" onSubmit={send}>
            <input value={text} onChange={changeText} maxLength="1500" disabled={!selected} placeholder={selected ? 'Escribe un mensaje...' : 'Selecciona un pedido'} />
            <button type="submit" className="gc-button gc-button--primary" disabled={!selected || !text.trim()}><FiSend /></button>
          </form>
        </section>
      </div>
    </>
  );
};

export default RealtimeChat;
