const express = require('express');
const { protect, requireConfirmed } = require('../middleware/authMiddleware');
const { chargeOrder, getPayments, kushkiWebhook } = require('../controllers/paymentController');
const router = express.Router();
router.post('/webhook/kushki', kushkiWebhook);
router.get('/', protect, requireConfirmed, getPayments);
router.post('/orders/:orderId/charge', protect, requireConfirmed, chargeOrder);
module.exports = router;
