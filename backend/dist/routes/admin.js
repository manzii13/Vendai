"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All admin routes require ADMIN role
router.use(auth_1.protect, (0, auth_1.restrictTo)('ADMIN'));
router.get('/stats', adminController_1.getPlatformStats);
router.get('/vendors', adminController_1.getAllVendors);
router.patch('/vendors/:id/approve', adminController_1.approveVendor);
router.patch('/vendors/:id/reject', adminController_1.rejectVendor);
router.get('/users', adminController_1.getAllUsers);
router.patch('/users/:id/make-admin', adminController_1.makeAdmin);
router.delete('/users/:id', adminController_1.deleteUser);
router.get('/orders', adminController_1.getAllOrders);
exports.default = router;
//# sourceMappingURL=admin.js.map