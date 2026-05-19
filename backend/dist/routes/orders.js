"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/', auth_1.protect, orderController_1.createOrder);
router.get('/my', auth_1.protect, orderController_1.getMyOrders);
router.get('/vendor/incoming', auth_1.protect, (0, auth_1.restrictTo)('VENDOR'), orderController_1.getVendorOrders);
router.get('/:id', auth_1.protect, orderController_1.getOrder);
router.patch('/:id/status', auth_1.protect, (0, auth_1.restrictTo)('VENDOR', 'ADMIN'), orderController_1.updateOrderStatus);
exports.default = router;
//# sourceMappingURL=orders.js.map