const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    cliente: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    repartidor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    direccionEntrega: { type: String, required: true },
    cantidadCilindros: { type: Number, required: true, default: 1 },
    total: { type: Number, required: true },
    estado: { 
        type: String, 
        enum: ['pendiente', 'en camino', 'entregado', 'cancelado'], 
        default: 'pendiente' 
    },
    fechaEntrega: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);