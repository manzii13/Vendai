import { Request, Response } from 'express';
const generateVendorInsights = async (
    storeName: string,
    totalRevenue: number,
    topProducts: string[],
    recentOrderCount: number
): Promise<string> => {
    const top = topProducts.filter(Boolean).slice(0, 3).join(', ') || 'No top products yet';
    const momentum = recentOrderCount > 0 ? 'Some recent activity' : 'No recent activity';
    return `Store ${storeName}: revenue $${totalRevenue.toFixed(2)}. ${momentum}. Top products: ${top}.`;
};
import prisma from '../utils/prisma';
// GET /api/vendors
export const getVendors = async (_req: Request, res: Response): Promise<void> => {
    try {
        const vendors = await prisma.vendor.findMany({
            where: { approved: true },
            include: {
                user: { select: { name: true, email: true } },
                _count: { select: { products: true } }
            }
        });
        res.json({ vendors });
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/vendors/:id
export const getVendor = async (req: Request, res: Response): Promise<void> => {
    try {
        const vendorId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

        if (!vendorId) {
            res.status(400).json({ message: 'Vendor id is required' });
            return;
        }

        const vendor = await prisma.vendor.findUnique({
            where: { id: vendorId },
            include: {
                user: { select: { name: true } },
                products: { take: 12, orderBy: { createdAt: 'desc' } }
            }
        });
        if (!vendor) { res.status(404).json({ message: 'Vendor not found' }); return; }
        res.json({ vendor });
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/vendors/dashboard/stats
export const getVendorStats = async (req: Request & { user?: any }, res: Response): Promise<void> => {
    try {
        const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.userId } });
        if (!vendor) { res.status(404).json({ message: 'Vendor not found' }); return; }

        const products = await prisma.product.findMany({ where: { vendorId: vendor.id } });
        const productIds = products.map(p => p.id);

        const orderItems = await prisma.orderItem.findMany({
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
        const productRevenue: Record<string, { name: string; revenue: number }> = {};
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
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/vendors/dashboard/ai-insights
export const getAIInsights = async (req: Request & { user?: any }, res: Response): Promise<void> => {
    try {
        const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.userId } });
        if (!vendor) { res.status(404).json({ message: 'Vendor not found' }); return; }

        const products = await prisma.product.findMany({ where: { vendorId: vendor.id } });
        const productIds = products.map(p => p.id);

        const orderItems = await prisma.orderItem.findMany({
            where: { productId: { in: productIds } },
            include: { order: true, product: true }
        });

        const totalRevenue = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
        const topProducts = products.slice(0, 3).map(p => p.name);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentCount = new Set(
            orderItems
                .filter(i => new Date(i.order.createdAt) > thirtyDaysAgo)
                .map(i => i.orderId)
        ).size;

        const insights = await generateVendorInsights(vendor.storeName, totalRevenue, topProducts, recentCount);
        res.json({ insights });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'AI insights failed' });
    }
};