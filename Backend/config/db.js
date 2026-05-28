const mongoose = require('mongoose');

const connectDB = async () => {
    const uri = process.env.MONGODB_URI;
    const fallback = process.env.MONGODB_URI_FALLBACK; // opcional: cadena estándar sin +srv
    const opts = {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
    };

    if (!uri) {
        console.error('Error de configuración: MONGODB_URI no está definida en el .env');
        if (!fallback) process.exit(1);
    }

    try {
        const conn = await mongoose.connect(uri || fallback, opts);
        console.log(`MongoDB Conectado: ${conn.connection.host}`);
        return;
    } catch (error) {
        console.error(`Error de conexión a la BDD (principal): ${error.message}`);
        if (fallback && uri) {
            console.log('Intentando conectar con MONGODB_URI_FALLBACK...');
            try {
                const conn2 = await mongoose.connect(fallback, opts);
                console.log(`MongoDB Conectado (fallback): ${conn2.connection.host}`);
                return;
            } catch (err2) {
                console.error(`Error de conexión fallback: ${err2.message}`);
                process.exit(1);
            }
        }
        process.exit(1);
    }
};

module.exports = connectDB;