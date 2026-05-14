import { Router } from 'express';
import { getVendors, getVendor, getVendorStats, getAIInsights } from '../controllers/vendorController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

router.get('/',                    getVendors);
router.get('/dashboard/stats',     protect, restrictTo('VENDOR'), getVendorStats);
router.get('/dashboard/ai-insights', protect, restrictTo('VENDOR'), getAIInsights);
router.get('/:id',                 getVendor);

export default router;