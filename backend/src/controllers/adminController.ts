import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// GET /api/admin/stats
export const getPlatformStats = async (_req: Request, res: Response): Promise<void> => {
    try {
        const [
            totalUsers,
            totalVendors,
            totalProducts,
            totalOrders,
            pendingVendors,
            revenueData
        ] = await Promise.all([
            prisma.user.count(),
            prisma.vendor.count(),
            prisma.product.count(),
            prisma.order.count(),
            prisma.vendor.count({ where: { approved: false } }),
            prisma.order.aggregate({ _sum: { total: true } })
        ]);

        // Orders by status
        const ordersByStatus = await prisma.order.groupBy({
            by: ['status'],
            _count: { status: true }
        });

        // Recent orders
        const recentOrders = await prisma.order.findMany({
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
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/admin/vendors
export const getAllVendors = async (_req: Request, res: Response): Promise<void> => {
    try {
        const vendors = await prisma.vendor.findMany({
            include: {
                user: { select: { name: true, email: true, createdAt: true } },
                _count: { select: { products: true } }
            },
            // Pending approvals first, then newest
            orderBy: [{ approved: 'asc' }, { createdAt: 'desc' }]
        });
        res.json({ vendors });
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
};

// PATCH /api/admin/vendors/:id/approve
export const approveVendor = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const vendor = await prisma.vendor.update({
            where: { id },
            data: { approved: true },
            include: { user: { select: { name: true, email: true } } }
        });
        res.json({ message: `${vendor.storeName} approved!`, vendor });
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
};

// PATCH /api/admin/vendors/:id/reject
export const rejectVendor = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const vendor = await prisma.vendor.update({
            where: { id },
            data: { approved: false },
            include: { user: { select: { name: true } } }
        });
        res.json({ message: `${vendor.storeName} rejected`, vendor });
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/admin/users
export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true, name: true, email: true,
                role: true, createdAt: true,
                vendor: { select: { storeName: true, approved: true } },
                _count: { select: { orders: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ users });
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/admin/orders
export const getAllOrders = async (_req: Request, res: Response): Promise<void> => {
    try {
        const orders = await prisma.order.findMany({
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
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/admin/users/:id
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        await prisma.user.delete({ where: { id } });
        res.json({ message: 'User deleted' });
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
};

// PATCH /api/admin/users/:id/make-admin
export const makeAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const user = await prisma.user.update({
            where: { id },
            data: { role: 'ADMIN' }
        });
        res.json({ message: `${user.name} is now an admin`, user });
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
};