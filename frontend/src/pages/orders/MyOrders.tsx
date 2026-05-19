import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatRWF } from '../../utils/currency';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | (string & {});

interface OrderItem {
    id: string | number;
    price: number;
    quantity: number;
    product?: {
        name?: string;
        images?: string[];
        vendor?: {
            storeName?: string;
        };
    };
}

interface Order {
    id: string | number;
    status: OrderStatus;
    createdAt: string | number | Date;
    items?: OrderItem[];
    total: number;
}

const STATUS_STYLES: Record<string, string> = {
    PENDING: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    CONFIRMED: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    SHIPPED: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    DELIVERED: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    CANCELLED: 'bg-red-500/10 border-red-500/30 text-red-400',
};

export default function MyOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await api.get('/orders/my');
                setOrders(data.orders);
            } catch {
                toast.error('Failed to load orders');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">

            <div className="mb-10">
                
                <h1 className="font-display text-5xl text-white">
                    MY ORDERS<span className="text-gold-400">.</span>
                </h1>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="card animate-pulse">
                            <div className="h-4 bg-[#1a1a1a] rounded w-1/4 mb-3" />
                            <div className="h-3 bg-[#1a1a1a] rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="font-display text-6xl text-[#1a1a1a] mb-4">EMPTY</div>
                    <p className="text-[#555] mb-8">You haven't placed any orders yet.</p>
                    <Link to="/marketplace" className="btn-primary">Start Shopping →</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.id} className="card hover:border-[#2a2a2a] transition-all">

                            {/* Order Header */}
                            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                                <div>
                                    <div className="label mb-1">ORDER ID</div>
                                    <p className="font-mono text-xs text-white">{order.id}</p>
                                </div>
                                <div className="text-right">
                                    <div className="label mb-1">PLACED ON</div>
                                    <p className="font-mono text-xs text-[#666]">
                                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric', month: 'short', day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <span className={`font-mono text-[10px] px-3 py-1.5 rounded border ${STATUS_STYLES[order.status]}`}>
                                    {order.status}
                                </span>
                            </div>

                            {/* Items */}
                            <div className="space-y-2 mb-4">
                                {order.items?.map((item: OrderItem) => (
                                    <div key={item.id} className="flex items-center gap-3 p-2 bg-[#0a0a0a] rounded-lg">
                                        <div className="w-10 h-10 bg-[#111] rounded overflow-hidden flex-shrink-0">
                                            {item.product?.images?.[0] ? (
                                                <img
                                                    src={`http://localhost:5000${item.product.images[0]}`}
                                                    className="w-full h-full object-cover"
                                                    alt=""
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[#333] text-xs">?</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-xs font-medium line-clamp-1">{item.product?.name}</p>
                                            <p className="label">{item.product?.vendor?.storeName}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-display text-base text-gold-400">{formatRWF(item.price * item.quantity)}</p>
                                            <p className="label">x{item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="divider pt-4 flex items-center justify-between">
                                <div>
                                    <span className="label">ORDER TOTAL</span>
                                    <div className="font-display text-2xl text-gold-400 mt-0.5">
                                        {formatRWF(order.total)}
                                    </div>
                                </div>
                                <Link
                                    to={`/orders/${order.id}/confirmation`}
                                    className="font-mono text-[10px] border border-[#2a2a2a] text-[#888] px-4 py-2 rounded hover:border-gold-400 hover:text-gold-400 transition-all"
                                >
                                    VIEW DETAILS →
                                </Link>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}