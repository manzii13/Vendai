import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { signToken } from '../utils/jwt';
import prisma from '../utils/prisma';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            res.status(400).json({ message: 'Name, email and password are required' });
            return;
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            res.status(409).json({ message: 'Email already registered' });
            return;
        }

        const hashed = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashed,
                role: role === 'VENDOR' ? 'VENDOR' : 'CUSTOMER'
            }
        });

        // If registering as vendor, create vendor profile
        if (role === 'VENDOR') {
            await prisma.vendor.create({
                data: {
                    userId: user.id,
                    storeName: `${name}'s Store`,
                    approved: false
                }
            });
        }

        const token = signToken({ userId: user.id, email: user.email, role: user.role });

        res.status(201).json({
            message: 'Account created successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const token = signToken({ userId: user.id, email: user.email, role: user.role });

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMe = async (req: Request & { user?: any }, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: { vendor: true }
        });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const { password: _, ...safeUser } = user;
        res.json({ user: safeUser });
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
};