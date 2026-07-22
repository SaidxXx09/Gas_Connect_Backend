const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: {
    type: [Number],
    default: undefined,
    validate: { validator: (value) => !value || value.length === 2, message: 'Las coordenadas deben ser [lng, lat]' },
  },
}, { _id: false });

const proofSchema = new mongoose.Schema({
  url: { type: String, default: '' },
  publicId: { type: String, default: '' },
  uploadedAt: Date,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  codigo: { type: String, unique: true, index: true },
  clientRequestId: { type: String, trim: true, maxlength: 100, default: undefined },
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  repartidor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  direccionEntrega: { type: String, required: true, trim: true },
  referenciaEntrega: { type: String, trim: true, default: '' },
  cantidadCilindros: { type: Number, required: true, min: 1, max: 20 },
  precioUnitario: { type: Number, required: true },
  total: { type: Number, required: true },
  ubicacionEntrega: { type: pointSchema, default: undefined },
  ubicacionRepartidor: { type: pointSchema, default: undefined },
  ubicacionActualizadaAt: Date,
  rutaOptima: { type: [[Number]], default: [] },
  estado: {
    type: String,
    enum: ['pendiente', 'aceptado', 'en camino', 'entregado', 'cancelado'],
    default: 'pendiente',
    index: true,
  },
  estadoPago: { type: String, enum: ['pendiente', 'pagado', 'fallido', 'reembolsado'], default: 'pendiente' },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
  evidenciaEntrega: { type: proofSchema, default: () => ({}) },
  acceptedAt: Date,
  fechaEnCamino: Date,
  fechaEntrega: Date,
  fechaCancelacion: Date,
  notasCancelacion: { type: String, default: '' },
}, { timestamps: true });

orderSchema.pre('validate', function generateCode(next) {
  if (!this.codigo) {
    const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
    this.codigo = `GC-${Date.now().toString().slice(-7)}-${suffix}`;
  }
  next();
});

orderSchema.index({ ubicacionEntrega: '2dsphere' });
orderSchema.index({ cliente: 1, clientRequestId: 1 }, { unique: true, sparse: true });
orderSchema.index({ cliente: 1, createdAt: -1 });
orderSchema.index({ repartidor: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
