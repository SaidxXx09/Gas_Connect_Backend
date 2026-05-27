const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Registro + Correo Bienvenida
const registerUser = async (req, res) => {
    const { nombre, email, password, role, telefono } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ mensaje: 'El usuario ya existe' });

        const user = await User.create({ nombre, email, password, role, telefono });

        // Generar token de confirmación (PIN largo)
        const pin = crypto.randomBytes(20).toString('hex');
        user.confirmationToken = crypto.createHash('sha256').update(pin).digest('hex');
        user.confirmationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 horas
        await user.save();

        const confirmUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/confirm/${pin}`;
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
                <h2 style="color: #ff6600; text-align: center;">¡Bienvenido/a a GasConnect, ${nombre}!</h2>
                <p>Haz clic en el siguiente botón para confirmar tu cuenta:</p>
                <p style="text-align:center;"><a href="${confirmUrl}" style="background:#ff6600;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">Confirmar cuenta</a></p>
                <p style="font-size: 12px; color: #777; text-align: center;">GasConnect - EPN 2026</p>
            </div>
        `;

        try {
            await sendEmail({ email: user.email, subject: 'Confirma tu cuenta en GasConnect', html: emailHtml });
        } catch (err) {
            console.error('Error enviando correo de confirmación:', err.message);
        }

        res.status(201).json({ mensaje: 'Usuario registrado. Revisa tu correo para confirmar la cuenta' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Login
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ mensaje: 'Credenciales inválidas' });
        if (!user.isConfirmed) return res.status(403).json({ mensaje: 'Cuenta no confirmada. Revisa tu correo.' });
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id, nombre: user.nombre, email: user.email, role: user.role, token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Confirmar cuenta por token
const confirmAccount = async (req, res) => {
    const { token } = req.params;
    try {
        const hashed = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({ confirmationToken: hashed, confirmationExpire: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ mensaje: 'Token de confirmación inválido o expirado' });

        user.isConfirmed = true;
        user.confirmationToken = undefined;
        user.confirmationExpire = undefined;
        await user.save();

        res.json({ mensaje: 'Cuenta confirmada correctamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Obtener perfil del usuario autenticado
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -resetPasswordToken -resetPasswordExpire -confirmationToken -confirmationExpire');
        res.json(user);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Generar PIN y mandar por correo
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordToken = crypto.createHash('sha256').update(pin).digest('hex');
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutos de validez
        await user.save();

        const messageHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
                <h3>Recuperación de Contraseña - GasConnect</h3>
                <p>Usa el siguiente PIN único para cambiar tu contraseña:</p>
                <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; color: #ff6600; letter-spacing: 5px;">
                    ${pin}
                </div>
                <p style="color: red; font-size: 12px;">Expira en 15 minutos.</p>
            </div>
        `;

        try {
            await sendEmail({ email: user.email, subject: 'PIN de recuperación - GasConnect', html: messageHtml });
            res.json({ mensaje: 'PIN enviado al correo electrónico' });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ mensaje: 'No se pudo enviar el correo' });
        }
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Validar PIN y actualizar contraseña
const resetPassword = async (req, res) => {
    const { pin, newPassword } = req.body;
    try {
        const hashedPin = crypto.createHash('sha256').update(pin).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedPin,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ mensaje: 'PIN incorrecto o expirado' });

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ mensaje: 'Contraseña actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    confirmAccount,
    getProfile
};