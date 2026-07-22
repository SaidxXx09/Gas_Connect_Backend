const express = require('express');
const {
  createOrder, getOrders, getNearbyOrders, getOrderById, updateOrder,
  acceptOrder, assignOrder, updateOrderStatus, cancelOrder,
  uploadDeliveryProof, updateDriverLocation,
} = require('../controllers/orderController');
const { protect, requireConfirmed, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect, requireConfirmed);
router.route('/').post(authorize('cliente'), createOrder).get(getOrders);
router.get('/nearby', authorize('repartidor', 'administrador'), getNearbyOrders);
router.route('/:id').get(getOrderById).put(updateOrder);
router.post('/:id/accept', authorize('repartidor'), acceptOrder);
router.patch('/:id/assign', authorize('administrador'), assignOrder);
router.patch('/:id/status', authorize('administrador', 'repartidor'), updateOrderStatus);
router.patch('/:id/cancel', authorize('administrador', 'cliente', 'repartidor'), cancelOrder);
router.put('/:id/proof', authorize('administrador', 'repartidor'), uploadDeliveryProof);
router.patch('/:id/location', authorize('administrador', 'repartidor'), updateDriverLocation);

module.exports = router;
