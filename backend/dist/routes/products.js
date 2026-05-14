"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const auth_1 = require("../middleware/auth");
const multer_1 = require("../utils/multer");
const router = (0, express_1.Router)();
// Public routes
router.get('/', productController_1.getProducts);
router.get('/categories', productController_1.getCategories);
router.get('/ai/smart-search', productController_1.aiSmartSearch);
router.get('/vendor/mine', auth_1.protect, (0, auth_1.restrictTo)('VENDOR'), productController_1.getMyProducts);
router.get('/:id', productController_1.getProduct);
// Vendor protected routes
router.post('/', auth_1.protect, (0, auth_1.restrictTo)('VENDOR'), multer_1.upload.array('images', 5), productController_1.createProduct);
router.put('/:id', auth_1.protect, (0, auth_1.restrictTo)('VENDOR'), multer_1.upload.array('images', 5), productController_1.updateProduct);
router.delete('/:id', auth_1.protect, (0, auth_1.restrictTo)('VENDOR'), productController_1.deleteProduct);
// AI routes (vendor only)
router.post('/ai/generate-description', auth_1.protect, (0, auth_1.restrictTo)('VENDOR'), productController_1.aiGenerateDescription);
exports.default = router;
//# sourceMappingURL=products.js.map