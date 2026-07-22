let ioInstance = null;

const setIO = (io) => { ioInstance = io; };
const getIO = () => ioInstance;

const emitOrderUpdate = (order) => {
  if (!ioInstance || !order) return;
  const orderId = String(order._id);
  ioInstance.to(`order:${orderId}`).emit('order:updated', order);
  if (order.cliente) ioInstance.to(`user:${String(order.cliente._id || order.cliente)}`).emit('order:updated', order);
  if (order.repartidor) ioInstance.to(`user:${String(order.repartidor._id || order.repartidor)}`).emit('order:updated', order);
  ioInstance.to('role:administrador').emit('order:updated', order);
};

module.exports = { setIO, getIO, emitOrderUpdate };
