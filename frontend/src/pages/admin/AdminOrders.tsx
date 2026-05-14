import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatRWF } from '../../utils/currency';

const STATUS_STYLES: Record<string, string> = {
    PENDING: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    CONFIRMED: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    SHIPPED: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    DELIVERED: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    CANCELLED: 'bg-red-500/10 border-red-500/30 text-red-400',
};

type Vendor = {
    storeName?: string;
};

type Product = {
    id: string;
    name?: string;
    vendor?: Vendor;
};

type OrderItem = {
    id: string;
    product?: Product;
    quantity: number;
};

type User = {
    name?: string;
    email?: string;
};

type Order = {
    id: string;
    user?: User;
    total: number;
    createdAt: string;
    status: string;
    items?: OrderItem[];
};

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await api.get('/admin/orders');
                setOrders(data.orders);
            } catch {
                toast.error('Failed to load orders');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

    return (
        <div className="p-8">
            <div className="mb-8">
                <div className="label mb-2">// ADMIN</div>
                <h1 className="font-display text-5xl text-white">
                    ALL ORDERS<span className="text-gold-400">.</span>
                </h1>
                <p className="text-[#555] text-sm mt-2">{orders.length} total orders on platform</p>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap mb-6">
                {statuses.map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`font-mono text-[10px] px-3 py-1.5 rounded border transition-all ${filter === s
                            ? 'bg-gold-400/10 border-gold-400/30 text-gold-400'
                            : 'border-[#1a1a1a] text-[#555] hover:text-white'
                            }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => <div key={i} className="card animate-pulse h-24" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                    <div className="font-display text-5xl text-[#1a1a1a] mb-4">EMPTY</div>
                    <p className="text-[#555]">No orders found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(order => (
                        <div key={order.id} className="card hover:border-[#2a2a2a] transition-all">
                            <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                                <div>
                                    <p className="font-mono text-[10px] text-[#444]">{order.id}</p>
                                    <p className="text-white text-sm font-semibold mt-0.5">{order.user?.name}</p>
                                    <p className="text-[#555] text-xs">{order.user?.email}</p>
                                </div>
                                <div className="text-right">
                                    <div className="font-display text-2xl text-gold-400">{formatRWF(order.total)}</div>
                                    <p className="font-mono text-[10px] text-[#444]">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`font-mono text-[10px] px-3 py-1.5 rounded border ${STATUS_STYLES[order.status]}`}>
                                    {order.status}
                                </span>
                            </div>

                            {/* Items summary */}
                            <div className="flex flex-wrap gap-2">
                                {order.items?.map((item: OrderItem) => (
                                    <span key={item.id} className="font-mono text-[9px] bg-[#0a0a0a] border border-[#1a1a1a] text-[#555] px-2 py-1 rounded">
                                        {item.product?.name} x{item.quantity} — {item.product?.vendor?.storeName}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}