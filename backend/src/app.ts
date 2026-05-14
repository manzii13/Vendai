import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import orderRoutes from './routes/orders';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
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