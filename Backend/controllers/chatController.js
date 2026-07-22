const Order = require('../models/Order');
const { queryGroq } = require('../utils/groqService');

const chatWithAI = async (req, res) => {
  try {
    const userMessage = String(req.body.message || '').trim();
    if (!userMessage || userMessage.length > 1200) return res.status(400).json({ mensaje: 'El mensaje debe tener entre 1 y 1200 caracteres' });
    const query = req.user.role === 'cliente' ? { cliente: req.user._id } : req.user.role === 'repartidor' ? { repartidor: req.user._id } : {};
    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(8).select('codigo direccionEntrega cantidadCilindros total estado estadoPago createdAt').lean();
    const context = orders.length ? orders.map((order) => `${order.codigo}: ${order.cantidadCilindros} cilindro(s), $${order.total}, estado ${order.estado}, pago ${order.estadoPago}, destino ${order.direccionEntrega}`).join('\n') : 'No hay pedidos relacionados con esta cuenta.';
    const response = await queryGroq({ messages: [
      { role: 'system', content: 'Eres Sparky, el búho asistente de GasConnect. Responde en español de forma breve, amable y práctica. Usa únicamente los pedidos incluidos en el contexto. No inventes estados, precios, ubicaciones, fechas ni datos personales. Para emergencias de gas recomienda llamar a servicios de emergencia y alejarse del área.' },
      { role: 'user', content: `Rol autenticado: ${req.user.role}. Pedidos visibles:\n${context}\n\nPregunta: ${userMessage}` },
    ] });
    res.json({ respuesta: response });
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message || 'No se pudo consultar a Sparky' });
  }
};
module.exports = { chatWithAI };
