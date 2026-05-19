import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatRWF } from '../../utils/currency';
import { getApiErrorMessage } from '../../utils/apiError';

const STATUS_STYLES: Record<string, string> = {
    PENDING: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    CONFIRMED: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    SHIPPED: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    DELIVERED: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    CANCELLED: 'bg-red-500/10 border-red-500/30 text-red-400',
};

/** Matches Prisma `OrderStatus` — show every bucket even when count is 0 */
const STATUS_ORDER = ['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

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

type OrderFilter = (typeof STATUS_ORDER)[number];

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [filter, setFilter] = useState<OrderFilter>('ALL');

    const loadOrders = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const { data } = await api.get('/admin/orders');
            setOrders(Array.isArray(data?.orders) ? data.orders : []);
        } catch (e) {
            const msg = getApiErrorMessage(e, 'Failed to load orders');
            setLoadError(msg);
            setOrders([]);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadOrders();
    }, [loadOrders]);

    const statusCounts = useMemo(() => {
        const c: Record<string, number> = {
            PENDING: 0,
            CONFIRMED: 0,
            SHIPPED: 0,
            DELIVERED: 0,
            CANCELLED: 0,
        };
        for (const o of orders) {
            if (c[o.status] !== undefined) c[o.status] += 1;
        }
        return c;
    }, [orders]);

    const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

    return (
        <div className="p-8 max-w-[1200px]">
            <div className="mb-8">
                
                <h1 className="font-display text-5xl text-white">
                    ALL ORDERS<span className="text-gold-400">.</span>
                </h1>
                <p className="text-[#555] text-sm mt-2">{orders.length} total orders on platform</p>
            </div>

            {loadError && (
                <div className="card border-red-500/30 bg-red-500/5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <p className="font-mono text-sm text-red-400">{loadError}</p>
                    <button
                        type="button"
                        onClick={() => void loadOrders()}
                        className="font-mono text-[10px] px-4 py-2 rounded border border-red-500/40 text-red-300 hover:bg-red-500/10 shrink-0"
                    >
                        RETRY
                    </button>
                </div>
            )}

            {/* Filter tabs — ALL + every order lifecycle state */}
            <div className="flex gap-2 flex-wrap mb-6">
                {STATUS_ORDER.map(s => {
                    const count =
                        s === 'ALL'
                            ? orders.length
                            : statusCounts[s] ?? 0;
                    return (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setFilter(s)}
                            className={`font-mono text-[10px] px-3 py-2 rounded border transition-all ${filter === s
                                ? 'bg-gold-400/10 border-gold-400/30 text-gold-400'
                                : 'border-[#1a1a1a] text-[#555] hover:text-white'
                                }`}
                        >
                            {s} ({count})
                        </button>
                    );
                })}
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => <div key={i} className="card animate-pulse h-24" />)}
                </div>
            ) : loadError ? null : filtered.length === 0 ? (
                <div className="card border-[#2a2a2a] py-16 px-6 text-center max-w-xl mx-auto">
                    <div className="font-display text-4xl text-[#333] mb-3">
                        {orders.length === 0 ? 'NO ORDERS' : 'NO MATCH'}
                    </div>
                    {orders.length === 0 ? (
                        <>
                            <p className="text-[#888] text-sm mb-4 leading-relaxed">
                                No checkout orders exist yet. Customers create orders from the marketplace checkout flow.
                            </p>
                            <p className="font-mono text-[10px] text-[#555] mb-4">
                                Demo data: in <code className="text-gold-400/90">backend</code> run{' '}
                                <code className="text-gold-400/90">npm run db:seed</code> then refresh.
                            </p>
                            <Link to="/marketplace" className="btn-outline text-xs inline-block px-4 py-2">
                                View marketplace
                            </Link>
                        </>
                    ) : (
                        <p className="text-[#666] text-sm">No orders with status &ldquo;{filter}&rdquo;. Pick ALL or another tab.</p>
                    )}
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