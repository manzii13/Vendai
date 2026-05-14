import { Router } from 'express';
import {
    getPlatformStats, getAllVendors, approveVendor,
    rejectVendor, getAllUsers, getAllOrders,
    deleteUser, makeAdmin
} from '../controllers/adminController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

// All admin routes require ADMIN role
router.use(protect, restrictTo('ADMIN'));

router.get('/stats', getPlatformStats);
router.get('/vendors', getAllVendors);
router.patch('/vendors/:id/approve', approveVendor);
router.patch('/vendors/:id/reject', rejectVendor);
router.get('/users', getAllUsers);
router.patch('/users/:id/make-admin', makeAdmin);
router.delete('/users/:id', deleteUser);
router.get('/orders', getAllOrders);

export default router;