import { Request, Response } from 'express';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { generateProductDescription, generateSmartSearch } = require('../services/aiServices') as {
    generateProductDescription: (productName: string, category: string, keywords: string) => Promise<any>;
    generateSmartSearch: (q: string, categories: string[]) => Promise<any>;
};
import prisma from '../utils/prisma';

const getProductId = (req: Request): string => {
    const id = req.params.id;
    return Array.isArray(id) ? id[0] : id;
};

// GET /api/products — list all with filters
export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { category, vendorId, search, minPrice, maxPrice, page = '1', limit = '12' } = req.query;

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const where: any = {};
        if (category) where.category = { equals: category as string, mode: 'insensitive' };
        if (vendorId) where.vendorId = vendorId as string;
        if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice as string) };
        if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice as string) };
        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } },
                { tags: { has: search as string } },
            ];
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: parseInt(limit as string),
                include: {
                    vendor: { select: { storeName: true, logo: true, approved: true } }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.product.count({ where })
        ]);

        res.json({
            products,
            pagination: {
                total,
                page: parseInt(page as string),
                pages: Math.ceil(total / parseInt(limit as string))
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/products/:id
export const getProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: getProductId(req) },
            include: {
                vendor: { select: { id: true, storeName: true, logo: true, description: true } },
                reviews: {
                    include: { user: { select: { name: true, avatar: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        });
        if (!product) { res.status(404).json({ message: 'Product not found' }); return; }
        res.json({ product });
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/products — vendor creates product
export const createProduct = async (req: Request & { user?: any }, res: Response): Promise<void> => {
    try {
        const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.userId } });
        if (!vendor) { res.status(403).json({ message: 'Vendor profile not found' }); return; }
        if (!vendor.approved) { res.status(403).json({ message: 'Your store is pending approval' }); return; }

        const { name, description, price, stock, category, tags } = req.body;
        const files = req.files as Express.Multer.File[];
        const images = files ? files.map(f => `/uploads/products/${f.filename}`) : [];

        const product = await prisma.product.create({
            data: {
                vendorId: vendor.id,
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock),
                category,
                images,
                tags: tags ? JSON.parse(tags) : []
            }
        });

        res.status(201).json({ message: 'Product created', product });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/products/:id
export const updateProduct = async (req: Request & { user?: any }, res: Response): Promise<void> => {
    try {
        const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.userId } });
        if (!vendor) { res.status(403).json({ message: 'Not a vendor' }); return; }

        const productId = getProductId(req);
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product || product.vendorId !== vendor.id) {
            res.status(403).json({ message: 'Not authorized' }); return;
        }

        const { name, description, price, stock, category, tags } = req.body;
        const files = req.files as Express.Multer.File[];
        const newImages = files?.length ? files.map(f => `/uploads/products/${f.filename}`) : product.images;

        const updated = await prisma.product.update({
            where: { id: productId },
            data: {
                name, description,
                price: parseFloat(price),
                stock: parseInt(stock),
                category,
                images: newImages,
                tags: tags ? JSON.parse(tags) : product.tags
            }
        });

        res.json({ message: 'Product updated', product: updated });
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/products/:id
export const deleteProduct = async (req: Request & { user?: any }, res: Response): Promise<void> => {
    try {
        const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.userId } });
        if (!vendor) { res.status(403).json({ message: 'Not a vendor' }); return; }

        const productId = getProductId(req);
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product || product.vendorId !== vendor.id) {
            res.status(403).json({ message: 'Not authorized' }); return;
        }

        await prisma.product.delete({ where: { id: productId } });
        res.json({ message: 'Product deleted' });
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/products/vendor/mine — vendor's own products
export const getMyProducts = async (req: Request & { user?: any }, res: Response): Promise<void> => {
    try {
        const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.userId } });
        if (!vendor) { res.status(403).json({ message: 'Not a vendor' }); return; }

        const products = await prisma.product.findMany({
            where: { vendorId: vendor.id },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ products });
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/products/ai/generate-description
export const aiGenerateDescription = async (req: Request, res: Response): Promise<void> => {
    try {
        const { productName, category, keywords } = req.body;
        if (!productName || !category) {
            res.status(400).json({ message: 'productName and category are required' }); return;
        }
        const result = await generateProductDescription(productName, category, keywords || '');
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'AI generation failed' });
    }
};

// GET /api/products/ai/smart-search?q=...
export const aiSmartSearch = async (req: Request, res: Response): Promise<void> => {
    try {
        const { q } = req.query;
        if (!q) { res.status(400).json({ message: 'Query required' }); return; }

        const categories = await prisma.product.findMany({
            select: { category: true },
            distinct: ['category']
        });
        const catList = categories.map(c => c.category);

        const parsed = await generateSmartSearch(q as string, catList);

        // Now search with the AI-extracted keywords
        const products = await prisma.product.findMany({
            where: {
                OR: [
                    ...parsed.keywords.map((kw: string) => ({ name: { contains: kw, mode: 'insensitive' as const } })),
                    ...parsed.keywords.map((kw: string) => ({ description: { contains: kw, mode: 'insensitive' as const } })),
                    ...(parsed.suggestedCategory ? [{ category: { equals: parsed.suggestedCategory, mode: 'insensitive' as const } }] : [])
                ]
            },
            include: { vendor: { select: { storeName: true } } },
            take: 20
        });

        res.json({ products, meta: parsed });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Smart search failed' });
    }
};

// GET /api/products/categories
export const getCategories = async (_req: Request, res: Response): Promise<void> => {
    try {
        const raw = await prisma.product.findMany({
            select: { category: true },
            distinct: ['category']
        });
        res.json({ categories: raw.map(r => r.category) });
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
};