const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const mediaSchema = new mongoose.Schema({
  url: { type: String, default: '' },
  publicId: { type: String, default: '' },
}, { _id: false });

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true, minlength: 3 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['administrador', 'repartidor', 'cliente'], default: 'cliente' },
  telefono: { type: String, trim: true, default: '' },
  direccion: { type: String, trim: true, default: '' },
  activo: { type: Boolean, default: true },
  avatar: { type: mediaSchema, default: () => ({}) },
  emailConfirmed: { type: Boolean, default: false },
  confirmationToken: String,
  confirmationTokenExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

userSchema.pre('save', async function encryptPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function matchPassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
