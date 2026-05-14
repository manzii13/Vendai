export interface User {
    id: string;
    name: string;
    email: string;
    role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
    avatar?: string;
}

export interface Vendor {
    id: string;
    storeName: string;
    description?: string;
    logo?: string;
    approved: boolean;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    images: string[];
    tags: string[];
    vendor: Vendor;
    reviews?: {
        id: string | number;
        rating: number;
        comment?: string;
        user?: {
            name?: string;
        };
    }[];
}

export interface Order {
    id: string;
    total: number;
    status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    createdAt: string;
    items: OrderItem[];
}

export interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    product: Product;
}