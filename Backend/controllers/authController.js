const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ─── Plantilla base reutilizable ─────────────────────────────────────────────
const emailWrapper = (contenido) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>GasConnect</title>
</head>
<body style="margin:0; padding:0; background-color:#f0f2f5; font-family: Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f2f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:10px; overflow:hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
          
          <!-- ENCABEZADO -->
          <tr>
            <td style="background: linear-gradient(135deg, #ff6600 0%, #ff8c00 100%); padding: 35px 40px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:700; letter-spacing:1px;">
                🔥 GasConnect
              </h1>
              <p style="margin:6px 0 0; color:rgba(255,255,255,0.85); font-size:13px;">
                Tu distribuidora de gas en Quito
              </p>
            </td>
          </tr>

          <!-- CONTENIDO -->
          <tr>
            <td style="padding: 40px 40px 30px;">
              ${contenido}
            </td>
          </tr>

          <!-- PIE DE PÁGINA -->
          <tr>
            <td style="background-color:#f7f8fa; padding: 20px 40px; border-top: 1px solid #e8e8e8; text-align:center;">
              <p style="margin:0; font-size:12px; color:#999999;">
                Este correo fue generado automáticamente. Por favor no respondas a este mensaje.
              </p>
              <p style="margin:8px 0 0; font-size:12px; color:#999999;">
                © 2026 <strong style="color:#ff6600;">GasConnect</strong> · Escuela Politécnica Nacional · Quito, Ecuador
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ─── Registro + Correo de Bienvenida ─────────────────────────────────────────
const registerUser = async (req, res) => {
    const { nombre, email, password, role, telefono } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ mensaje: 'El usuario ya existe' });

        const user = await User.create({
            nombre,
            email,
            password,
            role,
            telefono,
            emailConfirmed: false
        });

        res.status(201).json({
            _id: user._id,
            nombre: user.nombre,
            email: user.email,
            role: user.role,
            emailConfirmed: user.emailConfirmed,
            mensaje: 'Registro exitoso. Ahora inicia sesión.',
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// ─── Login ────────────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }

        if (!user.emailConfirmed) {
            const confirmationToken = crypto.randomBytes(32).toString('hex');
            user.confirmationToken = crypto.createHash('sha256').update(confirmationToken).digest('hex');
            user.confirmationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;
            await user.save();

            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const confirmationUrl = `${frontendUrl}/confirm/${confirmationToken}`;

            const contenidoConfirmacion = `
              <h2 style="margin:0 0 15px; color:#1a1a1a; font-size:22px;">
                ¡Hola ${user.nombre}! 🎉
              </h2>
              <p style="margin:0 0 20px; color:#555555; font-size:15px; line-height:1.6;">
                Usa el siguiente código para confirmar tu cuenta:
              </p>
              <p style="margin:0 0 20px; padding:18px 20px; background:#fff7e6; border-radius:10px; font-size:19px; color:#bb6300; font-weight:700; letter-spacing:2px; word-break:break-all; border:2px dashed #ffb74d; text-align:center;">
                ${confirmationToken}
              </p>
              <p style="margin:0; color:#666; font-size:13px; text-align:center;">
                Copia y pega este código en la pantalla de confirmación del sitio.
              </p>
            `;

            const emailHtml = emailWrapper(contenidoConfirmacion);
            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Confirma tu cuenta GasConnect después del login',
                    html: emailHtml
                });
            } catch (err) {
                console.error('Error enviando correo de confirmación tras login:', err.message);
            }
        }

        res.json({
            _id: user._id,
            nombre: user.nombre,
            email: user.email,
            role: user.role,
            emailConfirmed: user.emailConfirmed,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// ─── Perfil del usuario autenticado ───────────────────────────────────────────
const profileUser = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ mensaje: 'Usuario no autenticado' });
    }

    res.json({
        _id: req.user._id,
        nombre: req.user.nombre,
        email: req.user.email,
        role: req.user.role,
        telefono: req.user.telefono,
        emailConfirmed: req.user.emailConfirmed,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt
    });
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener usuarios', error: error.message });
    }
};

const deleteProfile = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user._id);
        res.json({ mensaje: 'Cuenta eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar cuenta', error: error.message });
    }
};

// ─── Generar PIN y enviarlo por correo ───────────────────────────────────────
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordToken = crypto.createHash('sha256').update(pin).digest('hex');
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutos
        await user.save();

        // Separar PIN en dígitos para mostrarlos en cajas individuales
        const digitosPin = pin.split('').map(d => `
          <td style="width:42px; height:52px; text-align:center; vertical-align:middle;
                     background:#fff; border:2px solid #ff6600; border-radius:8px;
                     font-size:26px; font-weight:bold; color:#ff6600; margin:0 4px;">
            ${d}
          </td>
          <td style="width:8px;"></td>
        `).join('');

        // ── Plantilla: Recuperación de Contraseña ─────────────────────────
        const contenidoRecuperacion = `
          <h2 style="margin:0 0 10px; color:#1a1a1a; font-size:22px;">
            Recuperación de contraseña 🔐
          </h2>
          <p style="margin:0 0 20px; color:#555555; font-size:15px; line-height:1.6;">
            Hola <strong>${user.nombre}</strong>, recibimos una solicitud para
            restablecer la contraseña de tu cuenta en GasConnect.
            Usa el siguiente PIN de 6 dígitos para continuar:
          </p>

          <!-- PIN en cajas -->
          <div style="text-align:center; margin:30px 0;">
            <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr>${digitosPin}</tr>
            </table>
          </div>

          <!-- Advertencia de expiración -->
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="background:#fff3f3; border-left:4px solid #e53935;
                        border-radius:6px; padding:14px 20px; margin:24px 0;">
            <tr>
              <td style="font-size:13px; color:#b71c1c;">
                ⏱ <strong>Este PIN expira en 15 minutos.</strong>
                Si no solicitaste este cambio, puedes ignorar este correo
                con total seguridad.
              </td>
            </tr>
          </table>

          <p style="margin:0 0 8px; color:#555555; font-size:14px; line-height:1.6;">
            Pasos para restablecer tu contraseña:
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
            <tr>
              <td style="padding:5px 0; font-size:14px; color:#444;">
                1️⃣ &nbsp; Ingresa el PIN de 6 dígitos en la pantalla de recuperación
              </td>
            </tr>
            <tr>
              <td style="padding:5px 0; font-size:14px; color:#444;">
                2️⃣ &nbsp; Escribe tu nueva contraseña
              </td>
            </tr>
            <tr>
              <td style="padding:5px 0; font-size:14px; color:#444;">
                3️⃣ &nbsp; ¡Listo! Inicia sesión con tu nueva contraseña
              </td>
            </tr>
          </table>

          <p style="margin:0; font-size:13px; color:#aaaaaa; text-align:center;">
            Por seguridad, nunca compartas este PIN con nadie,
            incluyendo al equipo de GasConnect.
          </p>
        `;

        const messageHtml = emailWrapper(contenidoRecuperacion);

        try {
            await sendEmail({
                email: user.email,
                subject: 'PIN de recuperación de contraseña – GasConnect 🔐',
                html: messageHtml
            });
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

// ─── Validar PIN y actualizar contraseña ─────────────────────────────────────
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

// ─── Confirmar correo electrónico ───────────────────────────────────────────────
const confirmEmail = async (req, res) => {
    const tokenParam = req.params?.token;
    const tokenBody = req.body?.token;
    const rawToken = tokenParam || tokenBody;

    if (!rawToken) {
        return res.status(400).json({ mensaje: 'Token de confirmación no proporcionado', emailConfirmed: false });
    }

    try {
        // Eliminar espacios en blanco del token
        const cleanToken = rawToken.trim();
        const hashedToken = crypto.createHash('sha256').update(cleanToken).digest('hex');
        
        console.log('Token recibido:', cleanToken);
        console.log('Token hasheado:', hashedToken);
        
        const user = await User.findOne({
            confirmationToken: hashedToken,
            confirmationTokenExpire: { $gt: Date.now() }
        });
        
        console.log('Usuario encontrado:', user ? user.email : 'No');

        if (!user) {
            return res.status(400).json({ 
                mensaje: 'Token de confirmación inválido o expirado',
                emailConfirmed: false
            });
        }

        // Marcar correo como confirmado
        user.emailConfirmed = true;
        user.confirmationToken = undefined;
        user.confirmationTokenExpire = undefined;
        await user.save();

        // ── Plantilla: Correo confirmado ───────────────────────────────────
        const contenidoConfirmado = `
          <h2 style="margin:0 0 10px; color:#1a1a1a; font-size:22px;">
            ¡Correo confirmado exitosamente! ✓
          </h2>
          <p style="margin:0 0 20px; color:#555555; font-size:15px; line-height:1.6;">
            Tu cuenta en <strong>GasConnect</strong> ha sido verificada correctamente.
            Ahora puedes acceder a todos los servicios de la plataforma y comenzar
            a realizar tus pedidos de gas.
          </p>

          <table width="100%" cellpadding="0" cellspacing="0"
                 style="background:#f3fff8; border-left:4px solid #00c853;
                        border-radius:6px; padding:16px 20px; margin-bottom:28px;">
            <tr>
              <td style="font-size:14px; color:#1b5e20; line-height:1.8;">
                <strong>✅ Estado:</strong> Cuenta verificada<br/>
                <strong>📧 Correo:</strong> ${user.email}<br/>
                <strong>👤 Rol:</strong> ${user.role}
              </td>
            </tr>
          </table>

          <p style="margin:0 0 24px; color:#555555; font-size:15px; line-height:1.6;">
            Con tu cuenta ahora puedes:
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
            <tr>
              <td style="padding:6px 0; font-size:14px; color:#444;">
                ✅ &nbsp; Realizar pedidos de cilindros de gas desde casa
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0; font-size:14px; color:#444;">
                ✅ &nbsp; Rastrear el estado de tu pedido en tiempo real
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0; font-size:14px; color:#444;">
                ✅ &nbsp; Recibir notificaciones sobre tu entrega
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0; font-size:14px; color:#444;">
                ✅ &nbsp; Gestionar tu perfil y preferencias
              </td>
            </tr>
          </table>

          <div style="text-align:center; margin:30px 0;">
            <a href="${process.env.FRONTEND_URL}" style="display:inline-block; background: linear-gradient(135deg,#ff6600,#ff8c00);
                               color:#ffffff; text-decoration:none; padding:14px 40px;
                               border-radius:50px; font-size:16px; font-weight:bold;
                               letter-spacing:0.5px;">
              Ir a GasConnect →
            </a>
          </div>

          <p style="margin:24px 0 0; font-size:13px; color:#aaaaaa; text-align:center;">
            Si tienes preguntas, contáctanos en soporte@gasconnect.com
          </p>
        `;

        const emailHtml = emailWrapper(contenidoConfirmado);

        try {
            await sendEmail({
                email: user.email,
                subject: '¡Tu correo ha sido confirmado en GasConnect! ✓',
                html: emailHtml
            });
        } catch (err) {
            console.error('Error enviando correo de confirmación exitosa:', err.message);
            // No retornar error, la confirmación ya fue exitosa
        }

        res.json({ 
            mensaje: 'Correo confirmado exitosamente. Bienvenido a GasConnect',
            emailConfirmed: true,
            usuario: {
                _id: user._id,
                nombre: user.nombre,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// ─── Reenviar correo de confirmación (usuario autenticado) ─────────────────
const resendConfirmation = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ mensaje: 'Usuario no autenticado' });
    if (user.emailConfirmed) return res.status(400).json({ mensaje: 'El correo ya está confirmado' });

    const confirmationToken = crypto.randomBytes(32).toString('hex');
    user.confirmationToken = crypto.createHash('sha256').update(confirmationToken).digest('hex');
    user.confirmationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 horas
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const confirmationUrl = `${frontendUrl}/confirm/${confirmationToken}`;

    const contenido = `
      <h2 style="margin:0 0 15px; color:#1a1a1a; font-size:22px;">Confirmación de correo</h2>
      <p style="margin:0 0 20px; color:#555555; font-size:15px; line-height:1.6;">Hola <strong>${user.nombre}</strong>, usa el siguiente código para confirmar tu correo:</p>
      <p style="margin:0 0 20px; padding:18px 20px; background:#fff7e6; border-radius:10px; font-size:19px; color:#bb6300; font-weight:700; letter-spacing:2px; word-break:break-all; border:2px dashed #ffb74d; text-align:center;">
        ${confirmationToken}
      </p>
      <p style="margin:0; color:#666; font-size:13px; text-align:center;">Cópialo y pégalo en la pantalla de confirmación del sitio.</p>
    `;

    const emailHtml = emailWrapper(contenido);
    try {
      await sendEmail({ email: user.email, subject: 'Reenvío: confirma tu correo en GasConnect', html: emailHtml });
    } catch (err) {
      console.error('Error reenviando correo de confirmación:', err.message);
      return res.status(500).json({ mensaje: 'No se pudo enviar el correo' });
    }

    res.json({ mensaje: 'Correo de confirmación reenviado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

module.exports = { registerUser, loginUser, profileUser, getUsers, deleteProfile, forgotPassword, resetPassword, confirmEmail, resendConfirmation };
