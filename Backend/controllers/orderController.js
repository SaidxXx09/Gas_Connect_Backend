const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const { uploadImage, deleteImage } = require('../utils/media');
const { emitOrderUpdate } = require('../config/socket');

const populateOrder = (query) => query
  .populate('cliente', 'nombre email telefono avatar')
  .populate('repartidor', 'nombre email telefono avatar');

const canAccessOrder = (user, order) => {
  if (!user || !order) return false;
  if (user.role === 'administrador') return true;
  if (user.role === 'cliente') return String(order.cliente?._id || order.cliente) === String(user._id);
  if (user.role === 'repartidor') {
    return !order.repartidor || String(order.repartidor?._id || order.repartidor) === String(user._id);
  }
  return false;
};

const calculatePrice = (quantity) => {
  const unit = Number(process.env.GAS_CYLINDER_PRICE || 3.5);
  return { unit, total: Number((unit * quantity).toFixed(2)) };
};

const createOrder = async (req, res) => {
  try {
    const quantity = Number(req.body.cantidadCilindros);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return res.status(400).json({ mensaje: 'La cantidad debe ser un entero entre 1 y 20' });
    }

    const address = String(req.body.direccionEntrega || '').trim();
    if (address.length < 8) return res.status(400).json({ mensaje: 'La dirección de entrega es obligatoria' });

    const clientRequestId = String(req.body.clientRequestId || '').trim().slice(0, 100) || undefined;
    if (clientRequestId) {
      const existing = await Order.findOne({ cliente: req.user._id, clientRequestId });
      if (existing) {
        const populatedExisting = await populateOrder(Order.findById(existing._id));
        return res.status(200).json({ mensaje: 'El pedido ya había sido registrado', order: populatedExisting, duplicatePrevented: true });
      }
    }

    const { unit, total } = calculatePrice(quantity);
    const lat = Number(req.body.latitud);
    const lng = Number(req.body.longitud);

    let order;
    try {
      order = await Order.create({
        cliente: req.user._id,
        clientRequestId,
        direccionEntrega: address,
        referenciaEntrega: String(req.body.referenciaEntrega || '').trim(),
        cantidadCilindros: quantity,
        precioUnitario: unit,
        total,
        ...(Number.isFinite(lat) && Number.isFinite(lng)
          ? { ubicacionEntrega: { type: 'Point', coordinates: [lng, lat] } }
          : {}),
      });
    } catch (error) {
      if (error.code === 11000 && clientRequestId) {
        const existing = await Order.findOne({ cliente: req.user._id, clientRequestId });
        const populatedExisting = existing ? await populateOrder(Order.findById(existing._id)) : null;
        if (populatedExisting) return res.status(200).json({ mensaje: 'El pedido ya había sido registrado', order: populatedExisting, duplicatePrevented: true });
      }
      throw error;
    }

    const populated = await populateOrder(Order.findById(order._id));
    emitOrderUpdate(populated);
    return res.status(201).json({ mensaje: 'Pedido creado correctamente', order: populated });
  } catch (error) {
    return res.status(500).json({ mensaje: 'No se pudo crear el pedido', error: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'cliente') filter.cliente = req.user._id;
    if (req.user.role === 'repartidor') {
      if (req.query.available === 'true') filter.estado = 'pendiente';
      else filter.$or = [{ repartidor: req.user._id }, { repartidor: null, estado: 'pendiente' }];
    }
    if (req.query.estado) filter.estado = req.query.estado;
    if (req.query.estadoPago) filter.estadoPago = req.query.estadoPago;
    const orders = await populateOrder(Order.find(filter).sort({ createdAt: -1 }));
    res.json(orders);
  } catch (error) {
    res.status(500).json({ mensaje: 'No se pudieron obtener los pedidos', error: error.message });
  }
};

const getNearbyOrders = async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const maxDistance = Math.min(Number(req.query.maxDistance || 5000), 30000);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return res.status(400).json({ mensaje: 'Debes enviar lat y lng válidos' });
    const orders = await populateOrder(Order.find({
      estado: 'pendiente', repartidor: null,
      ubicacionEntrega: { $near: { $geometry: { type: 'Point', coordinates: [lng, lat] }, $maxDistance: maxDistance } },
    }).limit(30));
    res.json(orders);
  } catch (error) {
    res.status(500).json({ mensaje: 'No se pudieron buscar pedidos cercanos', error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ mensaje: 'ID de pedido inválido' });
    const order = await populateOrder(Order.findById(req.params.id).populate('payment'));
    if (!order) return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    if (!canAccessOrder(req.user, order)) return res.status(403).json({ mensaje: 'No tienes acceso a este pedido' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ mensaje: 'No se pudo obtener el pedido', error: error.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    const isOwner = String(order.cliente) === String(req.user._id);
    if (req.user.role !== 'administrador' && !isOwner) return res.status(403).json({ mensaje: 'No tienes permiso para editar este pedido' });
    if (order.estado !== 'pendiente') return res.status(400).json({ mensaje: 'Solo se pueden editar pedidos pendientes' });
    if (req.body.direccionEntrega !== undefined) order.direccionEntrega = String(req.body.direccionEntrega).trim();
    if (req.body.referenciaEntrega !== undefined) order.referenciaEntrega = String(req.body.referenciaEntrega).trim();
    if (req.body.cantidadCilindros !== undefined) {
      const quantity = Number(req.body.cantidadCilindros);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return res.status(400).json({ mensaje: 'Cantidad inválida' });
      const { unit, total } = calculatePrice(quantity);
      order.cantidadCilindros = quantity; order.precioUnitario = unit; order.total = total;
    }
    const lat = Number(req.body.latitud); const lng = Number(req.body.longitud);
    if (Number.isFinite(lat) && Number.isFinite(lng)) order.ubicacionEntrega = { type: 'Point', coordinates: [lng, lat] };
    await order.save();
    const populated = await populateOrder(Order.findById(order._id));
    emitOrderUpdate(populated);
    res.json({ mensaje: 'Pedido actualizado', order: populated });
  } catch (error) {
    res.status(500).json({ mensaje: 'No se pudo actualizar el pedido', error: error.message });
  }
};

const acceptOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, estado: 'pendiente', repartidor: null },
      { $set: { repartidor: req.user._id, estado: 'aceptado', acceptedAt: new Date() } },
      { new: true },
    );
    if (!order) return res.status(409).json({ mensaje: 'El pedido ya fue tomado o no está disponible' });
    const populated = await populateOrder(Order.findById(order._id));
    emitOrderUpdate(populated);
    res.json({ mensaje: 'Pedido aceptado', order: populated });
  } catch (error) {
    res.status(500).json({ mensaje: 'No se pudo aceptar el pedido', error: error.message });
  }
};

const assignOrder = async (req, res) => {
  try {
    const driver = await User.findOne({ _id: req.body.repartidorId, role: 'repartidor', activo: true });
    if (!driver) return res.status(404).json({ mensaje: 'Repartidor no encontrado o inactivo' });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    if (['entregado', 'cancelado'].includes(order.estado)) return res.status(400).json({ mensaje: 'No se puede asignar este pedido' });
    order.repartidor = driver._id;
    if (order.estado === 'pendiente') { order.estado = 'aceptado'; order.acceptedAt = new Date(); }
    await order.save();
    const populated = await populateOrder(Order.findById(order._id));
    emitOrderUpdate(populated);
    res.json({ mensaje: 'Repartidor asignado', order: populated });
  } catch (error) {
    res.status(500).json({ mensaje: 'No se pudo asignar el pedido', error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    if (req.user.role === 'repartidor' && String(order.repartidor) !== String(req.user._id)) return res.status(403).json({ mensaje: 'Este pedido no está asignado a tu cuenta' });
    const nextStatus = req.body.estado;
    const transitions = {
      pendiente: ['aceptado', 'cancelado'],
      aceptado: ['en camino', 'cancelado'],
      'en camino': ['entregado', 'cancelado'],
      entregado: [], cancelado: [],
    };
    if (!transitions[order.estado]?.includes(nextStatus)) return res.status(400).json({ mensaje: `No se puede pasar de ${order.estado} a ${nextStatus}` });
    if (nextStatus === 'entregado' && !order.evidenciaEntrega?.url) return res.status(400).json({ mensaje: 'Primero debes subir una fotografía de entrega' });
    order.estado = nextStatus;
    if (nextStatus === 'en camino') order.fechaEnCamino = new Date();
    if (nextStatus === 'entregado') order.fechaEntrega = new Date();
    if (nextStatus === 'cancelado') { order.fechaCancelacion = new Date(); order.notasCancelacion = req.body.motivo || ''; }
    await order.save();
    const populated = await populateOrder(Order.findById(order._id));
    emitOrderUpdate(populated);
    res.json({ mensaje: `Pedido actualizado a ${nextStatus}`, order: populated });
  } catch (error) {
    res.status(500).json({ mensaje: 'No se pudo cambiar el estado', error: error.message });
  }
};

const cancelOrder = async (req, res) => {
  req.body.estado = 'cancelado';
  return updateOrderStatus(req, res);
};

const uploadDeliveryProof = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    if (req.user.role === 'repartidor' && String(order.repartidor) !== String(req.user._id)) return res.status(403).json({ mensaje: 'Este pedido no está asignado a tu cuenta' });
    if (req.user.role !== 'administrador' && req.user.role !== 'repartidor') return res.status(403).json({ mensaje: 'No tienes permiso para subir la evidencia' });
    const uploaded = await uploadImage(req.files?.proof || req.files?.image, `gasconnect/orders/${order._id}`);
    await deleteImage(order.evidenciaEntrega?.publicId).catch(() => {});
    order.evidenciaEntrega = { ...uploaded, uploadedAt: new Date() };
    await order.save();
    const populated = await populateOrder(Order.findById(order._id));
    emitOrderUpdate(populated);
    res.json({ mensaje: 'Evidencia de entrega guardada', order: populated });
  } catch (error) {
    res.status(error.status || 400).json({ mensaje: error.message });
  }
};

const updateDriverLocation = async (req, res) => {
  try {
    const lat = Number(req.body.lat); const lng = Number(req.body.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return res.status(400).json({ mensaje: 'Coordenadas inválidas' });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    if (req.user.role !== 'administrador' && String(order.repartidor) !== String(req.user._id)) return res.status(403).json({ mensaje: 'No tienes permiso para actualizar esta ubicación' });
    order.ubicacionRepartidor = { type: 'Point', coordinates: [lng, lat] };
    order.ubicacionActualizadaAt = new Date();
    if (Array.isArray(req.body.route) && req.body.route.length <= 500) order.rutaOptima = req.body.route;
    await order.save();
    const payload = { orderId: String(order._id), lat, lng, updatedAt: order.ubicacionActualizadaAt };
    const { getIO } = require('../config/socket');
    getIO()?.to(`order:${order._id}`).emit('location:updated', payload);
    res.json({ mensaje: 'Ubicación actualizada', location: payload });
  } catch (error) {
    res.status(500).json({ mensaje: 'No se pudo actualizar la ubicación', error: error.message });
  }
};

module.exports = {
  createOrder, getOrders, getNearbyOrders, getOrderById, updateOrder,
  acceptOrder, assignOrder, updateOrderStatus, cancelOrder,
  uploadDeliveryProof, updateDriverLocation, canAccessOrder, populateOrder,
};
