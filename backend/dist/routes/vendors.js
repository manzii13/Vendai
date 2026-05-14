"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vendorController_1 = require("../controllers/vendorController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', vendorController_1.getVendors);
router.get('/dashboard/stats', auth_1.protect, (0, auth_1.restrictTo)('VENDOR'), vendorController_1.getVendorStats);
router.get('/dashboard/ai-insights', auth_1.protect, (0, auth_1.restrictTo)('VENDOR'), vendorController_1.getAIInsights);
router.get('/:id', vendorController_1.getVendor);
exports.default = router;
//# sourceMappingURL=vendors.js.map