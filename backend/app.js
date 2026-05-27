const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(helmet()); 
app.use(cors());
app.use(express.json());

// Montar Rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

app.get('/', (req, res) => {
    res.send('API REST de GasConnect ejecutándose correctamente...');
});

app.use((req, res) => {
    res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor de desarrollo activo en el puerto: ${PORT}`);
});