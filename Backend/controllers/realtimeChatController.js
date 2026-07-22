const Message = require('../models/Message');
const Order = require('../models/Order');
const { canAccessOrder } = require('./orderController');
const { getIO } = require('../config/socket');

const ensureOrderAccess = async (user, orderId) => {
  const order = await Order.findById(orderId).populate('cliente repartidor');
  if (!order) { const error = new Error('Pedido no encontrado'); error.status = 404; throw error; }
  if (!canAccessOrder(user, order)) { const error = new Error('No tienes acceso al chat de este pedido'); error.status = 403; throw error; }
  return order;
};

const serializeMessage = (message) => ({
  _id: message._id,
  order: message.order,
  sender: message.sender,
  text: message.text,
  readBy: message.readBy,
  createdAt: message.createdAt,
});

const getOrderMessages = async (req, res) => {
  try {
    await ensureOrderAccess(req.user, req.params.orderId);
    const messages = await Message.find({ order: req.params.orderId })
      .populate('sender', 'nombre role avatar')
      .sort({ createdAt: 1 })
      .limit(300);
    res.json(messages);
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message });
  }
};

const sendOrderMessage = async (req, res) => {
  try {
    await ensureOrderAccess(req.user, req.params.orderId);
    const text = String(req.body.text || '').trim();
    if (!text || text.length > 1500) return res.status(400).json({ mensaje: 'El mensaje debe tener entre 1 y 1500 caracteres' });
    let message = await Message.create({ order: req.params.orderId, sender: req.user._id, text, readBy: [req.user._id] });
    message = await message.populate('sender', 'nombre role avatar');
    getIO()?.to(`order:${req.params.orderId}`).emit('chat:message', serializeMessage(message));
    res.status(201).json(message);
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message });
  }
};

const markMessagesRead = async (req, res) => {
  try {
    await ensureOrderAccess(req.user, req.params.orderId);
    await Message.updateMany({ order: req.params.orderId, readBy: { $ne: req.user._id } }, { $addToSet: { readBy: req.user._id } });
    res.json({ mensaje: 'Mensajes marcados como leídos' });
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message });
  }
};

module.exports = { getOrderMessages, sendOrderMessage, markMessagesRead, ensureOrderAccess, serializeMessage };
