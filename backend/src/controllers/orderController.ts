import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// POST /api/orders — customer creates order
export const createOrder = async (req: Request & { user?: any }, res: Response): Promise<void> => {
    try {
        const { items, shippingAddress } = req.body;

        if (!items || items.length === 0) {
            res.status(400).json({ message: 'No items in order' });
            return;
        }

        // Verify all products exist and have enough stock
        let total = 0;
        const orderItems: Array<{ product: { id: string; price: number }; quantity: number }> = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId }
            });

            if (!product) {
                res.status(404).json({ message: `Product ${item.productId} not found` });
                return;
            }

            if (product.stock < item.quantity) {
                res.status(400).json({
                    message: `Not enough stock for "${product.name}". Available: ${product.stock}`
                });
                return;
            }

            total += product.price * item.quantity;
            orderItems.push({ product, quantity: item.quantity });
        }

        // Create order + items in one transaction
        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    userId: req.user.userId,
                    total,
                    status: 'PENDING',
                    shippingAddress: shippingAddress || ''
                }
            });

            // Create order items
            for (const item of orderItems) {
                await tx.orderItem.create({
                    data: {
                        orderId: newOrder.id,
                        productId: item.product.id,
                        quantity: item.quantity,
                        price: item.product.price
                    }
                });

                // Reduce stock
                await tx.product.update({
                    where: { id: item.product.id },
                    data: { stock: { decrement: item.quantity } }
                });
            }

            return newOrder;
        });

        // Fetch full order with items
        const fullOrder = await prisma.order.findUnique({
            where: { id: order.id },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                vendor: { select: { storeName: true } }
                            }
                        }
                    }
                }
            }
        });

        res.status(201).json({ message: 'Order placed successfully!', order: fullOrder });
    } catch (err: any) {
        console.error('Create order error:', err.message);
        res.status(500).json({ message: err.message || 'Server error' });
    }
};

// GET /api/orders/my — customer's own orders
export const getMyOrders = async (req: Request & { user?: any }, res: Response): Promise<void> => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.user.userId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
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

// GET /api/orders/:id
export const getOrder = async (req: Request & { user?: any }, res: Response): Promise<void> => {
    try {
        const orderId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                vendor: { select: { storeName: true, id: true } }
                            }
                        }
                    }
                },
                user: { select: { name: true, email: true } }
            }
        });

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        // Only the owner or admin can view
        if (order.userId !== req.user.userId && req.user.role !== 'ADMIN') {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }

        res.json({ order });
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/orders/vendor/incoming — vendor sees orders for their products
export const getVendorOrders = async (req: Request & { user?: any }, res: Response): Promise<void> => {
    try {
        const vendor = await prisma.vendor.findUnique({
            where: { userId: req.user.userId }
        });

        if (!vendor) {
            res.status(403).json({ message: 'Not a vendor' });
            return;
        }

        const orderItems = await prisma.orderItem.findMany({
            where: {
                product: { vendorId: vendor.id }
            },
            include: {
                product: true,
                order: {
                    include: {
                        user: { select: { name: true, email: true } }
                    }
                }
            },
            orderBy: { order: { createdAt: 'desc' } }
        });

        // Group by order
        const ordersMap = new Map();
        orderItems.forEach(item => {
            const orderId = item.order.id;
            if (!ordersMap.has(orderId)) {
                ordersMap.set(orderId, {
                    ...item.order,
                    items: []
                });
            }
            ordersMap.get(orderId).items.push(item);
        });

        res.json({ orders: Array.from(ordersMap.values()) });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// PATCH /api/orders/:id/status — vendor updates order status
export const updateOrderStatus = async (req: Request & { user?: any }, res: Response): Promise<void> => {
    try {
        const { status } = req.body;
        const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

        if (!validStatuses.includes(status)) {
            res.status(400).json({ message: 'Invalid status' });
            return;
        }

        const orderId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

        const order = await prisma.order.update({
            where: { id: orderId },
            data: { status }
        });

        res.json({ message: 'Order status updated', order });
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
};