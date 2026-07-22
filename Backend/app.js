const path = require('path');
const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const fileUpload = require('express-fileupload');
const { Server } = require('socket.io');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const connectDB = require('./config/db');
const configureSockets = require('./sockets');
const { configureCloudinary } = require('./config/cloudinary');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  ...(process.env.FRONTEND_URL || '').split(',').map((origin) => origin.trim()).filter(Boolean),
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  credentials: true,
};

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ limits: { fileSize: 5 * 1024 * 1024 }, abortOnLimit: true, createParentPath: false }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/realtime-chat', require('./routes/realtimeChatRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'GasConnect API', version: '2.0.0', timestamp: new Date().toISOString() }));
app.get('/', (req, res) => res.send('API REST y Socket.IO de GasConnect ejecutándose correctamente.'));
app.use(notFound);
app.use(errorHandler);

const io = new Server(server, { cors: corsOptions, transports: ['websocket', 'polling'] });
configureSockets(io);
configureCloudinary();

const PORT = Number(process.env.PORT || 3000);
const startServer = async () => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET no está configurada en Backend/.env');
  await connectDB();
  server.listen(PORT, () => console.log(`GasConnect API activa en http://localhost:${PORT}`));
};

if (require.main === module) {
  startServer().catch((error) => { console.error(`No se pudo iniciar el servidor: ${error.message}`); process.exit(1); });
}

module.exports = { app, server, io, startServer };
