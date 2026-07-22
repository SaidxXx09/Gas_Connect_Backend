const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

(async () => {
  try {
    const required = ['ADMIN_NAME', 'ADMIN_EMAIL', 'ADMIN_PASSWORD', 'ADMIN_PHONE'];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length) throw new Error(`Faltan variables: ${missing.join(', ')}`);
    await connectDB();
    const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
    let user = await User.findOne({ email }).select('+password');
    if (!user) user = new User({ email });
    user.nombre = process.env.ADMIN_NAME;
    user.telefono = process.env.ADMIN_PHONE;
    user.password = process.env.ADMIN_PASSWORD;
    user.role = 'administrador';
    user.activo = true;
    user.emailConfirmed = true;
    await user.save();
    console.log(`Administrador listo: ${email}`);
    process.exit(0);
  } catch (error) { console.error(error.message); process.exit(1); }
})();
