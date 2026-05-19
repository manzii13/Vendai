"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAIInsights = exports.getVendorStats = exports.getVendor = exports.getVendors = void 0;
const generateVendorInsights = async (storeName, totalRevenue, topProducts, recentOrderCount) => {
    const top = topProducts.filter(Boolean).slice(0, 3).join(', ') || 'No top products yet';
    const momentum = recentOrderCount > 0 ? 'Some recent activity' : 'No recent activity';
    return `Store ${storeName}: revenue $${totalRevenue.toFixed(2)}. ${momentum}. Top products: ${top}.`;
};
const prisma_1 = __importDefault(require("../utils/prisma"));
// GET /api/vendors
const getVendors = async (_req, res) => {
    try {
        const vendors = await prisma_1.default.vendor.findMany({
            where: { approved: true },
            include: {
                user: { select: { name: true, email: true } },
                _count: { select: { products: true } }
            }
        });
        res.json({ vendors });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getVendors = getVendors;
// GET /api/vendors/:id
const getVendor = async (req, res) => {
    try {
        const vendorId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!vendorId) {
            res.status(400).json({ message: 'Vendor id is required' });
            return;
        }
        const vendor = await prisma_1.default.vendor.findUnique({
            where: { id: vendorId },
            include: {
                user: { select: { name: true } },
                products: { take: 12, orderBy: { createdAt: 'desc' } }
            }
        });
        if (!vendor) {
            res.status(404).json({ message: 'Vendor not found' });
            return;
        }
        res.json({ vendor });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getVendor = getVendor;
// GET /api/vendors/dashboard/stats
const getVendorStats = async (req, res) => {
    try {
        const vendor = await prisma_1.default.vendor.findUnique({ where: { userId: req.user.userId } });
        if (!vendor) {
            res.status(404).json({ message: 'Vendor not found' });
            return;
        }
        const products = await prisma_1.default.product.findMany({ where: { vendorId: vendor.id } });
        const productIds = products.map(p => p.id);
        const orderItems = await prisma_1.default.orderItem.findMany({
            where: { productId: { in: productIds } },
            include: { product: true, order: true }
        });
        const totalRevenue = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const totalOrders = new Set(orderItems.map(i => i.orderId)).size;
        // Orders in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentOrders = orderItems.filter(i => new Date(i.order.createdAt) > thirtyDaysAgo);
        const recentOrderCount = new Set(recentOrders.map(i => i.orderId)).size;
        // Top products by revenue
        const productRevenue = {};
        orderItems.forEach(item => {
            if (!productRevenue[item.productId]) {
                productRevenue[item.productId] = { name: item.product.name, revenue: 0 };
            }
            productRevenue[item.productId].revenue += item.price * item.quantity;
        });
        const topProducts = Object.values(productRevenue)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 3)
            .map(p => p.name);
        res.json({
            stats: {
                totalRevenue,
                totalOrders,
                totalProducts: products.length,
                recentOrders: recentOrderCount,
                topProducts,
                storeName: vendor.storeName,
                approved: vendor.approved
            }
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getVendorStats = getVendorStats;
// GET /api/vendors/dashboard/ai-insights
const getAIInsights = async (req, res) => {
    try {
        const vendor = await prisma_1.default.vendor.findUnique({ where: { userId: req.user.userId } });
        if (!vendor) {
            res.status(404).json({ message: 'Vendor not found' });
            return;
        }
        const products = await prisma_1.default.product.findMany({ where: { vendorId: vendor.id } });
        const productIds = products.map(p => p.id);
        const orderItems = await prisma_1.default.orderItem.findMany({
            where: { productId: { in: productIds } },
            include: { order: true, product: true }
        });
        const totalRevenue = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
        const topProducts = products.slice(0, 3).map(p => p.name);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentCount = new Set(orderItems
            .filter(i => new Date(i.order.createdAt) > thirtyDaysAgo)
            .map(i => i.orderId)).size;
        const insights = await generateVendorInsights(vendor.storeName, totalRevenue, topProducts, recentCount);
        res.json({ insights });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'AI insights failed' });
    }
};
exports.getAIInsights = getAIInsights;
//# sourceMappingURL=vendorController.js.map