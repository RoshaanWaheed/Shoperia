import express from 'express';
import {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  markOrderAsDelivered,
  updateOrderStatus,
  getMyOrders,
  getAllOrders,
  getPendingReviewOrders,
  markReviewPopupShown,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createOrder).get(protect, admin, getAllOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/pending-review').get(protect, getPendingReviewOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/deliver').put(protect, admin, markOrderAsDelivered);
router.route('/:id/status').put(protect, admin, updateOrderStatus);
router.route('/:id/mark-popup-shown').put(protect, markReviewPopupShown);

export default router;