"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeAdmin = exports.deleteUser = exports.getAllOrders = exports.getAllUsers = exports.rejectVendor = exports.approveVendor = exports.getAllVendors = exports.getPlatformStats = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
// GET /api/admin/stats
const getPlatformStats = async (_req, res) => {
    try {
        const [totalUsers, totalVendors, totalProducts, totalOrders, pendingVendors, revenueData] = await Promise.all([
            prisma_1.default.user.count(),
            prisma_1.default.vendor.count(),
            prisma_1.default.product.count(),
            prisma_1.default.order.count(),
            prisma_1.default.vendor.count({ where: { approved: false } }),
            prisma_1.default.order.aggregate({ _sum: { total: true } })
        ]);
        // Orders by status
        const ordersByStatus = await prisma_1.default.order.groupBy({
            by: ['status'],
            _count: { status: true }
        });
        // Recent orders
        const recentOrders = await prisma_1.default.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true, email: true } },
                items: { include: { product: { select: { name: true } } } }
            }
        });
        res.json({
            stats: {
                totalUsers,
                totalVendors,
                totalProducts,
                totalOrders,
                pendingVendors,
                totalRevenue: revenueData._sum.total || 0,
                ordersByStatus
            },
            recentOrders
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getPlatformStats = getPlatformStats;
// GET /api/admin/vendors
const getAllVendors = async (_req, res) => {
    try {
        const vendors = await prisma_1.default.vendor.findMany({
            include: {
                user: { select: { name: true, email: true, createdAt: true } },
                _count: { select: { products: true } }
            },
            // Pending approvals first, then newest
            orderBy: [{ approved: 'asc' }, { createdAt: 'desc' }]
        });
        res.json({ vendors });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllVendors = getAllVendors;
// PATCH /api/admin/vendors/:id/approve
const approveVendor = async (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const vendor = await prisma_1.default.vendor.update({
            where: { id },
            data: { approved: true },
            include: { user: { select: { name: true, email: true } } }
        });
        res.json({ message: `${vendor.storeName} approved!`, vendor });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.approveVendor = approveVendor;
// PATCH /api/admin/vendors/:id/reject
const rejectVendor = async (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const vendor = await prisma_1.default.vendor.update({
            where: { id },
            data: { approved: false },
            include: { user: { select: { name: true } } }
        });
        res.json({ message: `${vendor.storeName} rejected`, vendor });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.rejectVendor = rejectVendor;
// GET /api/admin/users
const getAllUsers = async (_req, res) => {
    try {
        const users = await prisma_1.default.user.findMany({
            select: {
                id: true, name: true, email: true,
                role: true, createdAt: true,
                vendor: { select: { storeName: true, approved: true } },
                _count: { select: { orders: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ users });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllUsers = getAllUsers;
// GET /api/admin/orders
const getAllOrders = async (_req, res) => {
    try {
        const orders = await prisma_1.default.order.findMany({
            include: {
                user: { select: { name: true, email: true } },
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                                vendor: { select: { storeName: true } }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ orders });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllOrders = getAllOrders;
// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        await prisma_1.default.user.delete({ where: { id } });
        res.json({ message: 'User deleted' });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteUser = deleteUser;
// PATCH /api/admin/users/:id/make-admin
const makeAdmin = async (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const user = await prisma_1.default.user.update({
            where: { id },
            data: { role: 'ADMIN' }
        });
        res.json({ message: `${user.name} is now an admin`, user });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.makeAdmin = makeAdmin;
//# sourceMappingURL=adminController.js.map