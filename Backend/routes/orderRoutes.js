const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('cliente'), createOrder)
    .get(protect, getOrders);

router.route('/:id')
    .put(protect, authorize('administrador', 'repartidor'), updateOrderStatus);

module.exports = router;