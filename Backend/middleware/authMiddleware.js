const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return res.status(401).json({ mensaje: 'No autorizado, falta el token' });

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.activo) return res.status(401).json({ mensaje: 'La cuenta no existe o está desactivada' });
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'No autorizado, token inválido o expirado' });
  }
};

const requireConfirmed = (req, res, next) => {
  if (!req.user?.emailConfirmed) {
    return res.status(403).json({ mensaje: 'Debes confirmar tu correo antes de utilizar este módulo', requiresEmailConfirmation: true });
  }
  return next();
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ mensaje: `El rol (${req.user?.role || 'desconocido'}) no tiene permisos para esta acción` });
  }
  return next();
};

module.exports = { protect, requireConfirmed, authorize };
