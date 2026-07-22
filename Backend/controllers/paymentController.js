const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { emitOrderUpdate } = require('../config/socket');

const sanitizeProviderResponse = (payload) => {
  if (!payload || typeof payload !== 'object') return payload;
  const clone = JSON.parse(JSON.stringify(payload));
  delete clone.token;
  delete clone.card;
  return clone;
};

const isApprovedKushkiResponse = (httpOk, provider) => {
  if (!httpOk) return false;
  const code = String(provider?.code ?? provider?.processorError ?? '').trim();
  if (!code) return Boolean(provider?.ticketNumber || provider?.ticket_number || provider?.transactionReference || provider?.transaction_reference);
  return code === '000';
};

const chargeOrder = async (req, res) => {
  let payment;

  try {
    const order = await Order.findById(req.params.orderId).populate('cliente');
    if (!order) return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    if (req.user.role !== 'administrador' && String(order.cliente._id) !== String(req.user._id)) return res.status(403).json({ mensaje: 'No puedes pagar este pedido' });
    if (order.estadoPago === 'pagado') return res.status(409).json({ mensaje: 'El pedido ya está pagado' });

    const token = String(req.body.token || '').trim();
    if (!token) return res.status(400).json({ mensaje: 'Kushki no entregó un token de pago' });

    const mockMode = process.env.KUSHKI_MOCK_MODE === 'true';
    if (!mockMode && !process.env.KUSHKI_PRIVATE_MERCHANT_ID) {
      return res.status(503).json({ mensaje: 'Configura KUSHKI_PRIVATE_MERCHANT_ID en Backend/.env' });
    }

    payment = await Payment.create({
      order: order._id,
      customer: order.cliente._id,
      amount: order.total,
      status: 'pending',
    });

    if (mockMode) {
      payment.status = 'approved';
      payment.ticketNumber = `MOCK-${Date.now()}`;
      payment.providerResponse = { mock: true, message: 'Pago simulado para desarrollo' };
    } else {
      const customerName = String(order.cliente.nombre || 'Cliente GasConnect').trim().split(/\s+/);
      const firstName = customerName.shift() || 'Cliente';
      const lastName = customerName.join(' ') || 'GasConnect';
      const phoneNumber = order.cliente.telefono
        ? `+593${String(order.cliente.telefono).replace(/^0/, '')}`
        : '+593999999999';

      const payload = {
        token,
        amount: {
          subtotalIva: 0,
          subtotalIva0: Number(order.total.toFixed(2)),
          ice: 0,
          iva: 0,
          currency: 'USD',
        },
        ...(req.body.deferred ? { deferred: req.body.deferred } : {}),
        metadata: { orderId: String(order._id), orderCode: order.codigo },
        contactDetails: {
          documentType: req.body.contactDetails?.documentType || 'CI',
          documentNumber: req.body.contactDetails?.documentNumber || '9999999999',
          email: order.cliente.email,
          firstName,
          lastName,
          phoneNumber,
        },
        orderDetails: {
          siteDomain: process.env.FRONTEND_URL || 'http://localhost:5173',
          shippingDetails: {
            name: order.cliente.nombre,
            phone: phoneNumber,
            address: order.direccionEntrega,
            city: 'Quito',
            region: 'Pichincha',
            country: 'Ecuador',
            zipCode: req.body.zipCode || '170150',
          },
          billingDetails: {
            name: order.cliente.nombre,
            phone: phoneNumber,
            address: order.direccionEntrega,
            city: 'Quito',
            region: 'Pichincha',
            country: 'Ecuador',
            zipCode: req.body.zipCode || '170150',
          },
        },
        fullResponse: true,
      };

      const response = await fetch(process.env.KUSHKI_API_URL || 'https://api-uat.kushkipagos.com/card/v1/charges', {
        method: 'POST',
        headers: {
          'Private-Merchant-Id': process.env.KUSHKI_PRIVATE_MERCHANT_ID,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(25000),
      });

      const provider = await response.json().catch(() => ({}));
      const approved = isApprovedKushkiResponse(response.ok, provider);

      payment.providerResponse = sanitizeProviderResponse(provider);
      payment.ticketNumber = provider.ticketNumber || provider.ticket_number;
      payment.transactionReference = provider.transactionReference || provider.transaction_reference;
      payment.processorCode = provider.processorError || provider.code;
      payment.status = approved ? 'approved' : 'declined';

      if (!approved) {
        await payment.save();
        order.estadoPago = 'fallido';
        order.payment = payment._id;
        await order.save();
        return res.status(402).json({
          mensaje: provider.message || `Kushki rechazó el pago${payment.processorCode ? ` (${payment.processorCode})` : ''}`,
          payment,
        });
      }
    }

    await payment.save();
    order.estadoPago = 'pagado';
    order.payment = payment._id;
    await order.save();

    const populated = await Order.findById(order._id).populate('cliente repartidor payment');
    emitOrderUpdate(populated);
    return res.json({ mensaje: 'Pago aprobado correctamente', payment, order: populated });
  } catch (error) {
    if (payment) {
      payment.status = 'error';
      payment.providerResponse = { error: error.message };
      await payment.save().catch(() => {});
    }
    const timeout = error.name === 'TimeoutError' || error.name === 'AbortError';
    return res.status(timeout ? 504 : 500).json({
      mensaje: timeout ? 'Kushki tardó demasiado en responder. Intenta nuevamente.' : 'No se pudo procesar el pago',
      error: error.message,
    });
  }
};

const getPayments = async (req, res) => {
  try {
    const filter = req.user.role === 'administrador' ? {} : { customer: req.user._id };
    const payments = await Payment.find(filter)
      .populate('order', 'codigo total estado estadoPago')
      .populate('customer', 'nombre email')
      .sort({ createdAt: -1 });
    return res.json(payments);
  } catch (error) {
    return res.status(500).json({ mensaje: 'No se pudieron obtener los pagos', error: error.message });
  }
};

const kushkiWebhook = async (req, res) => {
  if (!process.env.KUSHKI_WEBHOOK_SECRET) return res.status(503).json({ mensaje: 'KUSHKI_WEBHOOK_SECRET no está configurado' });
  if (req.headers['x-gasconnect-webhook-secret'] !== process.env.KUSHKI_WEBHOOK_SECRET) return res.status(401).json({ mensaje: 'Webhook no autorizado' });
  const ticket = req.body.ticketNumber || req.body.ticket_number;
  const payment = ticket ? await Payment.findOne({ ticketNumber: ticket }) : null;
  if (payment) {
    payment.providerResponse = sanitizeProviderResponse(req.body);
    await payment.save();
  }
  return res.sendStatus(204);
};

module.exports = { chargeOrder, getPayments, kushkiWebhook, isApprovedKushkiResponse };
