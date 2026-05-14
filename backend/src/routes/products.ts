import { Router } from 'express';
import {
    getProducts, getProduct, createProduct, updateProduct,
    deleteProduct, getMyProducts, aiGenerateDescription,
    aiSmartSearch, getCategories
} from '../controllers/productController';
import { protect, restrictTo } from '../middleware/auth';
import { upload } from '../utils/multer';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/ai/smart-search', aiSmartSearch);
router.get('/vendor/mine', protect, restrictTo('VENDOR'), getMyProducts);
router.get('/:id', getProduct);

// Vendor protected routes
router.post('/',
    protect, restrictTo('VENDOR'),
    upload.array('images', 5),
    createProduct
);
router.put('/:id',
    protect, restrictTo('VENDOR'),
    upload.array('images', 5),
    updateProduct
);
router.delete('/:id', protect, restrictTo('VENDOR'), deleteProduct);

// AI routes (vendor only)
router.post('/ai/generate-description', protect, restrictTo('VENDOR'), aiGenerateDescription);

export default router;