const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail, isEmailConfigured } = require('../utils/sendEmail');
const { uploadImage, deleteImage } = require('../utils/media');

const roles = ['administrador', 'repartidor', 'cliente'];
const normalizeEmail = (email = '') => String(email).trim().toLowerCase();
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });
const hashCode = (code) => crypto.createHash('sha256').update(String(code).trim()).digest('hex');
const randomCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const publicUser = (user) => ({
  _id: user._id,
  nombre: user.nombre,
  email: user.email,
  role: user.role,
  telefono: user.telefono,
  direccion: user.direccion,
  activo: user.activo,
  avatar: user.avatar,
  emailConfirmed: user.emailConfirmed,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const emailWrapper = (content) => `
<!doctype html><html lang="es"><body style="margin:0;background:#f4f6f8;font-family:Arial,sans-serif;color:#263445">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 12px">
<table width="600" style="max-width:100%;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 12px 35px rgba(20,33,61,.12)">
<tr><td style="padding:30px;background:linear-gradient(135deg,#ff7a00,#ffae32);color:#fff;text-align:center"><h1 style="margin:0">🔥 GasConnect</h1><p style="margin:8px 0 0">Gas a domicilio, simple y seguro</p></td></tr>
<tr><td style="padding:34px">${content}</td></tr>
<tr><td style="padding:18px;background:#f8fafc;text-align:center;color:#718096;font-size:12px">Mensaje automático de GasConnect · Quito, Ecuador</td></tr>
</table></td></tr></table></body></html>`;

const sendConfirmationCode = async (user) => {
  const code = randomCode();
  user.confirmationToken = hashCode(code);
  user.confirmationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;
  await user.save();

  if (!isEmailConfigured()) {
    return {
      sent: false,
      codeInDevelopment: process.env.NODE_ENV !== 'production' ? code : undefined,
    };
  }

  void sendEmail({
    email: user.email,
    subject: 'Código de confirmación GasConnect',
    html: emailWrapper(`
      <h2>Hola ${user.nombre}</h2>
      <p>Ingresa este código para confirmar tu cuenta:</p>
      <div style="font-size:30px;font-weight:800;letter-spacing:8px;text-align:center;padding:20px;background:#fff6e9;border:2px dashed #ff8c00;border-radius:12px">${code}</div>
      <p style="color:#718096">El código vence en 24 horas. Utiliza únicamente el último código que hayas solicitado.</p>
    `),
  }).catch((error) => console.error('No se pudo enviar el correo de confirmación:', error.message));

  return { sent: true };
};

const validateRegistration = ({ nombre, email, password, role, telefono }) => {
  if (!nombre || !email || !password || !role || !telefono) return 'Todos los campos son obligatorios';
  if (String(nombre).trim().length < 3) return 'El nombre debe tener al menos 3 caracteres';
  if (!/^\S+@\S+\.\S+$/.test(email)) return 'El correo electrónico no es válido';
  if (String(password).length < 6) return 'La contraseña debe tener al menos 6 caracteres';
  if (!roles.includes(role)) return 'Rol inválido';
  if (!/^\d{10}$/.test(String(telefono))) return 'El teléfono debe tener 10 dígitos';
  if (role === 'administrador' && process.env.ALLOW_PUBLIC_ADMIN_REGISTRATION !== 'true') return 'El registro público de administradores está desactivado';
  return null;
};

const registerUser = async (req, res) => {
  try {
    const data = { ...req.body, email: normalizeEmail(req.body.email), nombre: String(req.body.nombre || '').trim() };
    const validation = validateRegistration(data);
    if (validation) return res.status(400).json({ mensaje: validation });
    if (await User.exists({ email: data.email })) return res.status(409).json({ mensaje: 'El correo ya está registrado' });

    const user = await User.create({
      nombre: data.nombre,
      email: data.email,
      password: data.password,
      role: data.role,
      telefono: data.telefono,
      direccion: data.direccion || '',
    });

    const confirmation = await sendConfirmationCode(user).catch((error) => {
      console.error('No se pudo generar la confirmación:', error.message);
      return { sent: false };
    });

    return res.status(201).json({
      ...publicUser(user),
      token: generateToken(user._id),
      mensaje: confirmation.sent
        ? 'Registro exitoso. Revisa tu correo para confirmar la cuenta.'
        : 'Registro exitoso. El correo aún no está configurado.',
      ...(confirmation.codeInDevelopment ? { developmentConfirmationCode: confirmation.codeInDevelopment } : {}),
    });
  } catch (error) {
    return res.status(500).json({ mensaje: 'No se pudo registrar el usuario', error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(req.body.password || ''))) return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    if (!user.activo) return res.status(403).json({ mensaje: 'La cuenta está desactivada. Contacta al administrador.' });

    // No generamos otro código automáticamente: hacerlo invalidaba el código
    // que el usuario acababa de recibir durante el registro.
    return res.json({
      ...publicUser(user),
      token: generateToken(user._id),
      mensaje: user.emailConfirmed
        ? 'Inicio de sesión exitoso'
        : 'Inicio de sesión válido. Debes confirmar tu correo.',
    });
  } catch (error) {
    return res.status(500).json({ mensaje: 'No se pudo iniciar sesión', error: error.message });
  }
};

const confirmEmail = async (req, res) => {
  const rawCode = req.params.token || req.body.token || req.body.code;
  if (!rawCode) return res.status(400).json({ mensaje: 'Debes ingresar el código de confirmación', emailConfirmed: false });

  try {
    const query = {
      confirmationToken: hashCode(rawCode),
      confirmationTokenExpire: { $gt: Date.now() },
    };
    const email = normalizeEmail(req.body.email || req.query.email);
    if (email) query.email = email;

    const user = await User.findOne(query);
    if (!user) return res.status(400).json({ mensaje: 'Código inválido, reemplazado o expirado. Utiliza el último código recibido.', emailConfirmed: false });

    user.emailConfirmed = true;
    user.confirmationToken = undefined;
    user.confirmationTokenExpire = undefined;
    await user.save();

    return res.json({ mensaje: 'Cuenta confirmada correctamente', emailConfirmed: true, user: publicUser(user) });
  } catch (error) {
    return res.status(500).json({ mensaje: 'No se pudo confirmar la cuenta', error: error.message });
  }
};

const resendConfirmation = async (req, res) => {
  try {
    if (req.user.emailConfirmed) return res.status(400).json({ mensaje: 'La cuenta ya está confirmada' });
    const result = await sendConfirmationCode(req.user);
    return res.json({
      mensaje: result.sent ? 'Código reenviado al correo' : 'Código generado, pero el correo no está configurado',
      ...(result.codeInDevelopment ? { developmentConfirmationCode: result.codeInDevelopment } : {}),
    });
  } catch (error) {
    return res.status(500).json({ mensaje: 'No se pudo reenviar el código', error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) return res.status(400).json({ mensaje: 'El correo electrónico es obligatorio' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const pin = randomCode();
    user.resetPasswordToken = hashCode(pin);
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    const emailConfigured = isEmailConfigured();
    if (emailConfigured) {
      void sendEmail({
        email: user.email,
        subject: 'PIN de recuperación GasConnect',
        html: emailWrapper(`
          <h2>Recupera tu contraseña</h2>
          <p>Tu PIN de recuperación es:</p>
          <div style="font-size:30px;font-weight:800;letter-spacing:8px;text-align:center;padding:20px;background:#fff6e9;border:2px dashed #ff8c00;border-radius:12px">${pin}</div>
          <p>Vence en 15 minutos y solo funciona junto con el correo que solicitó la recuperación.</p>
        `),
      }).catch((error) => console.error('No se pudo enviar el PIN de recuperación:', error.message));
    }

    return res.json({
      mensaje: emailConfigured ? 'PIN generado. Revisa tu correo electrónico' : 'PIN generado, pero el correo no está configurado',
      ...(process.env.NODE_ENV !== 'production' && !emailConfigured ? { developmentPin: pin } : {}),
    });
  } catch (error) {
    return res.status(500).json({ mensaje: 'No se pudo procesar la recuperación', error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { pin, newPassword } = req.body;
    if (!email || !pin || !newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ mensaje: 'Correo, PIN y una nueva contraseña de mínimo 6 caracteres son obligatorios' });
    }

    const user = await User.findOne({
      email,
      resetPasswordToken: hashCode(pin),
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+password');

    if (!user) return res.status(400).json({ mensaje: 'Correo o PIN incorrecto, reemplazado o expirado' });
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    return res.status(500).json({ mensaje: 'No se pudo actualizar la contraseña', error: error.message });
  }
};

const profileUser = (req, res) => res.json(publicUser(req.user));

const updateProfile = async (req, res) => {
  try {
    ['nombre', 'telefono', 'direccion'].forEach((field) => {
      if (req.body[field] !== undefined) req.user[field] = String(req.body[field]).trim();
    });
    if (req.user.nombre.length < 3) return res.status(400).json({ mensaje: 'El nombre debe tener al menos 3 caracteres' });
    if (req.user.telefono && !/^\d{10}$/.test(req.user.telefono)) return res.status(400).json({ mensaje: 'El teléfono debe tener 10 dígitos' });
    await req.user.save();
    return res.json({ mensaje: 'Perfil actualizado correctamente', user: publicUser(req.user) });
  } catch (error) {
    return res.status(500).json({ mensaje: 'No se pudo actualizar el perfil', error: error.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) return res.status(400).json({ mensaje: 'Completa las dos contraseñas; la nueva debe tener mínimo 6 caracteres' });
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) return res.status(400).json({ mensaje: 'La contraseña actual no es correcta' });
    user.password = newPassword;
    await user.save();
    return res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    return res.status(500).json({ mensaje: 'No se pudo actualizar la contraseña', error: error.message });
  }
};

const updateAvatar = async (req, res) => {
  try {
    const file = req.files?.avatar || req.files?.image;
    const uploaded = await uploadImage(file, `gasconnect/users/${req.user._id}`);
    await deleteImage(req.user.avatar?.publicId).catch(() => {});
    req.user.avatar = uploaded;
    await req.user.save();
    return res.json({ mensaje: 'Foto de perfil actualizada', avatar: req.user.avatar });
  } catch (error) {
    return res.status(error.status || 400).json({ mensaje: error.message });
  }
};

const deleteProfile = async (req, res) => {
  try {
    req.user.activo = false;
    await req.user.save();
    return res.json({ mensaje: 'Cuenta desactivada correctamente' });
  } catch (error) {
    return res.status(500).json({ mensaje: 'No se pudo desactivar la cuenta', error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const query = {};
    if (req.query.role && roles.includes(req.query.role)) query.role = req.query.role;
    if (req.query.search) query.$or = [
      { nombre: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    return res.json(users.map(publicUser));
  } catch (error) {
    return res.status(500).json({ mensaje: 'No se pudieron obtener los usuarios', error: error.message });
  }
};

const createUserByAdmin = async (req, res) => {
  try {
    const data = { ...req.body, email: normalizeEmail(req.body.email) };
    const validation = validateRegistration(data);
    if (validation && !(data.role === 'administrador' && validation.includes('registro público'))) return res.status(400).json({ mensaje: validation });
    if (await User.exists({ email: data.email })) return res.status(409).json({ mensaje: 'El correo ya está registrado' });
    const user = await User.create({ ...data, emailConfirmed: req.body.emailConfirmed ?? true });
    return res.status(201).json({ mensaje: 'Usuario creado correctamente', user: publicUser(user) });
  } catch (error) {
    return res.status(500).json({ mensaje: 'No se pudo crear el usuario', error: error.message });
  }
};

const updateUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    if (req.body.role !== undefined) {
      if (!roles.includes(req.body.role)) return res.status(400).json({ mensaje: 'Rol inválido' });
      user.role = req.body.role;
    }
    if (req.body.activo !== undefined) user.activo = Boolean(req.body.activo);
    if (req.body.emailConfirmed !== undefined) user.emailConfirmed = Boolean(req.body.emailConfirmed);
    await user.save();
    return res.json({ mensaje: 'Usuario actualizado', user: publicUser(user) });
  } catch (error) {
    return res.status(500).json({ mensaje: 'No se pudo actualizar el usuario', error: error.message });
  }
};

const deleteUserByAdmin = async (req, res) => {
  try {
    if (String(req.user._id) === req.params.id) return res.status(400).json({ mensaje: 'No puedes eliminar tu propia cuenta desde este módulo' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    await deleteImage(user.avatar?.publicId).catch(() => {});
    await user.deleteOne();
    return res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    return res.status(500).json({ mensaje: 'No se pudo eliminar el usuario', error: error.message });
  }
};

module.exports = {
  registerUser, loginUser, confirmEmail, resendConfirmation, forgotPassword, resetPassword,
  profileUser, updateProfile, updatePassword, updateAvatar, deleteProfile,
  getUsers, createUserByAdmin, updateUserByAdmin, deleteUserByAdmin, publicUser,
};
