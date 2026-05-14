"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = exports.aiSmartSearch = exports.aiGenerateDescription = exports.getMyProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.getProducts = void 0;
const aiServices_1 = require("../services/aiServices");
const prisma_1 = require("../utils/prisma");
const getProductId = (req) => {
    const id = req.params.id;
    return Array.isArray(id) ? id[0] : id;
};
// GET /api/products — list all with filters
const getProducts = async (req, res) => {
    try {
        const { category, vendorId, search, minPrice, maxPrice, page = '1', limit = '12' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = {};
        if (category)
            where.category = { equals: category, mode: 'insensitive' };
        if (vendorId)
            where.vendorId = vendorId;
        if (minPrice)
            where.price = { ...where.price, gte: parseFloat(minPrice) };
        if (maxPrice)
            where.price = { ...where.price, lte: parseFloat(maxPrice) };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { tags: { has: search } },
            ];
        }
        const [products, total] = await Promise.all([
            prisma_1.prisma.product.findMany({
                where,
                skip,
                take: parseInt(limit),
                include: {
                    vendor: { select: { storeName: true, logo: true, approved: true } }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma_1.prisma.product.count({ where })
        ]);
        res.json({
            products,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getProducts = getProducts;
// GET /api/products/:id
const getProduct = async (req, res) => {
    try {
        const product = await prisma_1.prisma.product.findUnique({
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
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.json({ product });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getProduct = getProduct;
// POST /api/products — vendor creates product
const createProduct = async (req, res) => {
    try {
        const vendor = await prisma_1.prisma.vendor.findUnique({ where: { userId: req.user.userId } });
        if (!vendor) {
            res.status(403).json({ message: 'Vendor profile not found' });
            return;
        }
        if (!vendor.approved) {
            res.status(403).json({ message: 'Your store is pending approval' });
            return;
        }
        const { name, description, price, stock, category, tags } = req.body;
        const files = req.files;
        const images = files ? files.map(f => `/uploads/products/${f.filename}`) : [];
        const product = await prisma_1.prisma.product.create({
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createProduct = createProduct;
// PUT /api/products/:id
const updateProduct = async (req, res) => {
    try {
        const vendor = await prisma_1.prisma.vendor.findUnique({ where: { userId: req.user.userId } });
        if (!vendor) {
            res.status(403).json({ message: 'Not a vendor' });
            return;
        }
        const productId = getProductId(req);
        const product = await prisma_1.prisma.product.findUnique({ where: { id: productId } });
        if (!product || product.vendorId !== vendor.id) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        const { name, description, price, stock, category, tags } = req.body;
        const files = req.files;
        const newImages = files?.length ? files.map(f => `/uploads/products/${f.filename}`) : product.images;
        const updated = await prisma_1.prisma.product.update({
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
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateProduct = updateProduct;
// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
    try {
        const vendor = await prisma_1.prisma.vendor.findUnique({ where: { userId: req.user.userId } });
        if (!vendor) {
            res.status(403).json({ message: 'Not a vendor' });
            return;
        }
        const productId = getProductId(req);
        const product = await prisma_1.prisma.product.findUnique({ where: { id: productId } });
        if (!product || product.vendorId !== vendor.id) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        await prisma_1.prisma.product.delete({ where: { id: productId } });
        res.json({ message: 'Product deleted' });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteProduct = deleteProduct;
// GET /api/products/vendor/mine — vendor's own products
const getMyProducts = async (req, res) => {
    try {
        const vendor = await prisma_1.prisma.vendor.findUnique({ where: { userId: req.user.userId } });
        if (!vendor) {
            res.status(403).json({ message: 'Not a vendor' });
            return;
        }
        const products = await prisma_1.prisma.product.findMany({
            where: { vendorId: vendor.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ products });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getMyProducts = getMyProducts;
// POST /api/products/ai/generate-description
const aiGenerateDescription = async (req, res) => {
    try {
        const { productName, category, keywords } = req.body;
        if (!productName || !category) {
            res.status(400).json({ message: 'productName and category are required' });
            return;
        }
        const result = await (0, aiServices_1.generateProductDescription)(productName, category, keywords || '');
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'AI generation failed' });
    }
};
exports.aiGenerateDescription = aiGenerateDescription;
// GET /api/products/ai/smart-search?q=...
const aiSmartSearch = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            res.status(400).json({ message: 'Query required' });
            return;
        }
        const categories = await prisma_1.prisma.product.findMany({
            select: { category: true },
            distinct: ['category']
        });
        const catList = categories.map(c => c.category);
        const parsed = await (0, aiServices_1.generateSmartSearch)(q, catList);
        // Now search with the AI-extracted keywords
        const products = await prisma_1.prisma.product.findMany({
            where: {
                OR: [
                    ...parsed.keywords.map((kw) => ({ name: { contains: kw, mode: 'insensitive' } })),
                    ...parsed.keywords.map((kw) => ({ description: { contains: kw, mode: 'insensitive' } })),
                    ...(parsed.suggestedCategory ? [{ category: { equals: parsed.suggestedCategory, mode: 'insensitive' } }] : [])
                ]
            },
            include: { vendor: { select: { storeName: true } } },
            take: 20
        });
        res.json({ products, meta: parsed });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Smart search failed' });
    }
};
exports.aiSmartSearch = aiSmartSearch;
// GET /api/products/categories
const getCategories = async (_req, res) => {
    try {
        const raw = await prisma_1.prisma.product.findMany({
            select: { category: true },
            distinct: ['category']
        });
        res.json({ categories: raw.map(r => r.category) });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getCategories = getCategories;
//# sourceMappingURL=productController.js.map