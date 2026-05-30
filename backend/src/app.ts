import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import orderRoutes from './routes/orders';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();

const corsOrigins = new Set(
    [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        process.env.FRONTEND_URL,
    ].filter((o): o is string => Boolean(o))
);

function isAllowedOrigin(origin: string | undefined): boolean {
    if (!origin) return true;
    if (corsOrigins.has(origin)) return true;
    // Vite may use the next free port (5174, 5175, …) when 5173 is taken
    return /^https?:\/\/localhost(:\d+)?$/.test(origin);
}

app.use(
    cors({
        origin(origin, callback) {
            if (isAllowedOrigin(origin)) {
                callback(null, origin ?? true);
            } else {
                callback(new Error(`CORS blocked origin: ${origin}`));
            }
        },
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/orders', orderRoutes);

app.use('/api/admin', adminRoutes);

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, '../src/uploads')));

// Routes
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import vendorRoutes from './routes/vendors';

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/vendors', vendorRoutes);

app.get('/api/health', (_req, res) => {
    res.json({ status: 'OK', message: 'VendAIX API running ' });
});

export default app;