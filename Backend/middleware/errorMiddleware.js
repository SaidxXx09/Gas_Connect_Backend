const notFound = (req, res) => res.status(404).json({ mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });

const errorHandler = (error, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(error);
  const status = error.status || (res.statusCode === 200 ? 500 : res.statusCode);
  res.status(status).json({ mensaje: error.message || 'Error interno del servidor' });
};

module.exports = { notFound, errorHandler };
