const express = require('express');
const { protect, requireConfirmed } = require('../middleware/authMiddleware');
const { getOrderMessages, sendOrderMessage, markMessagesRead } = require('../controllers/realtimeChatController');
const router = express.Router();
router.use(protect, requireConfirmed);
router.get('/orders/:orderId/messages', getOrderMessages);
router.post('/orders/:orderId/messages', sendOrderMessage);
router.patch('/orders/:orderId/read', markMessagesRead);
module.exports = router;
