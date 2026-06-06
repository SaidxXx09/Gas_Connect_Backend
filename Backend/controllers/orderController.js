const Order = require('../models/Order');

const createOrder = async (req, res) => {
    const { direccionEntrega, cantidadCilindros, total } = req.body;
    try {
        const order = new Order({ cliente: req.user._id, direccionEntrega, cantidadCilindros, total });
        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear pedido', error: error.message });
    }
};

const getOrders = async (req, res) => {
    try {
        let orders;
        if (req.user.role === 'administrador') {
            orders = await Order.find({}).populate('cliente', 'nombre email').populate('repartidor', 'nombre');
        } else if (req.user.role === 'repartidor') {
            orders = await Order.find({ $or: [{ repartidor: req.user._id }, { estado: 'pendiente' }] }).populate('cliente', 'nombre telefono');
        } else {
            orders = await Order.find({ cliente: req.user._id });
        }
        res.json(orders);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener pedidos', error: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    const { estado, repartidorId } = req.body;
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ mensaje: 'Pedido no encontrado' });

        if (estado) order.estado = estado;
        if (repartidorId) order.repartidor = repartidorId;
        if (estado === 'entregado') order.fechaEntrega = Date.now();

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar', error: error.message });
    }
};

module.exports = { createOrder, getOrders, updateOrderStatus };