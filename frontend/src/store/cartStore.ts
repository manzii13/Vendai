import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../types';

interface CartItem {
    product: Product;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    updateQty: (productId: string, quantity: number) => void;
    clearCart: () => void;
    total: () => number;
    count: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product) => {
                const existing = get().items.find(i => i.product.id === product.id);
                if (existing) {
                    set(s => ({
                        items: s.items.map(i =>
                            i.product.id === product.id
                                ? { ...i, quantity: i.quantity + 1 }
                                : i
                        )
                    }));
                } else {
                    set(s => ({ items: [...s.items, { product, quantity: 1 }] }));
                }
            },

            removeItem: (productId) =>
                set(s => ({ items: s.items.filter(i => i.product.id !== productId) })),

            updateQty: (productId, quantity) => {
                if (quantity <= 0) { get().removeItem(productId); return; }
                set(s => ({
                    items: s.items.map(i =>
                        i.product.id === productId ? { ...i, quantity } : i
                    )
                }));
            },

            clearCart: () => set({ items: [] }),

            total: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),

            count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
        }),
        { name: 'cart-storage' }
    )
);