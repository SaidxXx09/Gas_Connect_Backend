const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Order = require('../models/Order');
const Message = require('../models/Message');
const { setIO } = require('../config/socket');
const { canAccessOrder } = require('../controllers/orderController');
const { serializeMessage } = require('../controllers/realtimeChatController');

const configureSockets = (io) => {
  setIO(io);
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || String(socket.handshake.headers.authorization || '').replace('Bearer ', '');
      if (!token) return next(new Error('Token requerido'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user || !user.activo) return next(new Error('Usuario no autorizado'));
      if (!user.emailConfirmed) return next(new Error('Debes confirmar tu correo'));
      socket.user = user;
      next();
    } catch (error) { next(new Error('Token inválido')); }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user._id}`);
    socket.join(`role:${socket.user.role}`);

    socket.on('order:join', async ({ orderId } = {}, ack = () => {}) => {
      try {
        const order = await Order.findById(orderId).populate('cliente repartidor');
        if (!order || !canAccessOrder(socket.user, order)) throw new Error('No tienes acceso al pedido');
        socket.join(`order:${orderId}`); ack({ ok: true });
      } catch (error) { ack({ ok: false, message: error.message }); }
    });

    socket.on('order:leave', ({ orderId } = {}) => socket.leave(`order:${orderId}`));

    socket.on('location:update', async ({ orderId, lat, lng } = {}, ack = () => {}) => {
      try {
        const order = await Order.findById(orderId);
        if (!order) throw new Error('Pedido no encontrado');
        if (socket.user.role !== 'administrador' && String(order.repartidor) !== String(socket.user._id)) throw new Error('No puedes actualizar esta ubicación');
        const latitude = Number(lat); const longitude = Number(lng);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new Error('Coordenadas inválidas');
        order.ubicacionRepartidor = { type: 'Point', coordinates: [longitude, latitude] };
        order.ubicacionActualizadaAt = new Date(); await order.save();
        const payload = { orderId, lat: latitude, lng: longitude, updatedAt: order.ubicacionActualizadaAt };
        io.to(`order:${orderId}`).emit('location:updated', payload); ack({ ok: true, location: payload });
      } catch (error) { ack({ ok: false, message: error.message }); }
    });

    socket.on('chat:send', async ({ orderId, text } = {}, ack = () => {}) => {
      try {
        const order = await Order.findById(orderId).populate('cliente repartidor');
        if (!order || !canAccessOrder(socket.user, order)) throw new Error('No tienes acceso a este chat');
        const cleanText = String(text || '').trim();
        if (!cleanText || cleanText.length > 1500) throw new Error('Mensaje inválido');
        let message = await Message.create({ order: orderId, sender: socket.user._id, text: cleanText, readBy: [socket.user._id] });
        message = await message.populate('sender', 'nombre role avatar');
        io.to(`order:${orderId}`).emit('chat:message', serializeMessage(message));
        ack({ ok: true, message: serializeMessage(message) });
      } catch (error) { ack({ ok: false, message: error.message }); }
    });

    socket.on('chat:typing', ({ orderId, isTyping } = {}) => {
      socket.to(`order:${orderId}`).emit('chat:typing', { orderId, userId: String(socket.user._id), nombre: socket.user.nombre, isTyping: Boolean(isTyping) });
    });
  });
};
module.exports = configureSockets;
