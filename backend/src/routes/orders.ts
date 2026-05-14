import { Router } from 'express';
import {
    createOrder, getMyOrders, getOrder,
    getVendorOrders, updateOrderStatus
} from '../controllers/orderController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/vendor/incoming', protect, restrictTo('VENDOR'), getVendorOrders);
router.get('/:id', protect, getOrder);
router.patch('/:id/status', protect, restrictTo('VENDOR', 'ADMIN'), updateOrderStatus);

export default router;