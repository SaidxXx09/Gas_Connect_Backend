const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const fallback = process.env.MONGODB_URI_FALLBACK;
  const options = { serverSelectionTimeoutMS: 12000, connectTimeoutMS: 12000 };

  if (!uri && !fallback) {
    throw new Error('Debes configurar MONGODB_URI en Backend/.env');
  }

  try {
    const connection = await mongoose.connect(uri || fallback, options);
    console.log(`MongoDB conectado: ${connection.connection.host}`);
    return connection;
  } catch (primaryError) {
    if (!fallback || !uri) throw primaryError;
    console.warn('Falló MONGODB_URI. Intentando MONGODB_URI_FALLBACK...');
    return mongoose.connect(fallback, options);
  }
};

module.exports = connectDB;
