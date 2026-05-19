/**
 * Demo data so the admin panel has users, vendors (pending + approved), products, and orders.
 * Run from backend folder: npx prisma db seed
 * Requires DATABASE_URL and applied migrations.
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const DEMO_PASSWORD = 'Demo123456!';

async function main() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL is not set. Add it to backend/.env');
    }

    const adapter = new PrismaPg({ connectionString });
    const prisma = new PrismaClient({ adapter });

    try {
        const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

        const admin = await prisma.user.upsert({
        where: { email: 'demo-admin@vendxx.local' },
        update: { role: 'ADMIN' },
        create: {
            email: 'demo-admin@vendxx.local',
            name: 'Demo Admin',
            password: passwordHash,
            role: 'ADMIN',
        },
    });

    const customer = await prisma.user.upsert({
        where: { email: 'demo-customer@vendxx.local' },
        update: {},
        create: {
            email: 'demo-customer@vendxx.local',
            name: 'Demo Customer',
            password: passwordHash,
            role: 'CUSTOMER',
        },
    });

    const pendingUser = await prisma.user.upsert({
        where: { email: 'demo-vendor-pending@vendxx.local' },
        update: { role: 'VENDOR' },
        create: {
            email: 'demo-vendor-pending@vendxx.local',
            name: 'Pending Vendor User',
            password: passwordHash,
            role: 'VENDOR',
        },
    });

    const approvedUser = await prisma.user.upsert({
        where: { email: 'demo-vendor-approved@vendxx.local' },
        update: { role: 'VENDOR' },
        create: {
            email: 'demo-vendor-approved@vendxx.local',
            name: 'Approved Vendor User',
            password: passwordHash,
            role: 'VENDOR',
        },
    });

    await prisma.vendor.upsert({
        where: { userId: pendingUser.id },
        update: { approved: false, storeName: 'Awaiting Approval Shop' },
        create: {
            userId: pendingUser.id,
            storeName: 'Awaiting Approval Shop',
            description: 'Seed vendor — approve in admin to allow listings.',
            approved: false,
        },
    });

    const approvedVendor = await prisma.vendor.upsert({
        where: { userId: approvedUser.id },
        update: { approved: true, storeName: 'Approved Demo Store' },
        create: {
            userId: approvedUser.id,
            storeName: 'Approved Demo Store',
            description: 'Seed vendor — already approved.',
            approved: true,
        },
    });

    const product = await prisma.product.upsert({
        where: { id: 'seed-demo-product-wireless' },
        update: {},
        create: {
            id: 'seed-demo-product-wireless',
            vendorId: approvedVendor.id,
            name: 'Demo Wireless Buds',
            description: 'Seeded product for marketplace and admin order previews.',
            price: 25000,
            stock: 20,
            category: 'Electronics',
            images: [],
            tags: ['demo', 'seed', 'audio'],
            aiGenerated: false,
        },
    });

    const existingOrders = await prisma.order.count({
        where: { userId: customer.id },
    });

    if (existingOrders === 0) {
        await prisma.order.create({
            data: {
                userId: customer.id,
                total: 75000,
                status: 'CONFIRMED',
                shippingAddress: 'Kigali, Rwanda (demo)',
                paymentMethod: 'CASH',
                items: {
                    create: [
                        { productId: product.id, quantity: 2, price: 25000 },
                        { productId: product.id, quantity: 1, price: 25000 },
                    ],
                },
            },
        });

        await prisma.order.create({
            data: {
                userId: customer.id,
                total: 25000,
                status: 'PENDING',
                shippingAddress: 'Kigali, Rwanda (demo)',
                paymentMethod: 'CASH',
                items: {
                    create: [{ productId: product.id, quantity: 1, price: 25000 }],
                },
            },
        });
    }

    console.log('Seed complete.');
    console.log('  Admin (optional login):', admin.email, '/', DEMO_PASSWORD);
    console.log('  Pending vendor:', pendingUser.email, '/', DEMO_PASSWORD);
    console.log('  Approved vendor:', approvedUser.email, '/', DEMO_PASSWORD);
    console.log('  Customer:', customer.email, '/', DEMO_PASSWORD);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
