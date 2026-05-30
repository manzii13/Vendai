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

const STATUS_LABELS: Record<string, string> = {
    ALL: 'All',
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
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
        <div className="page-shell max-w-[1200px]">
            <header className="page-header">
                <span className="eyebrow">Fulfillment</span>
                <h1>Orders</h1>
                <p className="hint-text mt-2">{orders.length} total orders on the platform</p>
            </header>

            {loadError && (
                <div className="error-banner mb-6">
                    <p className="text-sm text-red-400">{loadError}</p>
                    <button type="button" onClick={() => void loadOrders()} className="btn-sm-danger shrink-0">
                        Try again
                    </button>
                </div>
            )}

            <div className="flex gap-2 flex-wrap mb-6">
                {STATUS_ORDER.map(s => {
                    const count = s === 'ALL' ? orders.length : statusCounts[s] ?? 0;
                    return (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setFilter(s)}
                            className={`filter-tab ${filter === s ? 'filter-tab-active' : ''}`}
                        >
                            {STATUS_LABELS[s]} ({count})
                        </button>
                    );
                })}
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => <div key={i} className="card animate-pulse h-24" />)}
                </div>
            ) : loadError ? null : filtered.length === 0 ? (
                <div className="empty-state">
                    <h3 className="empty-state-title">
                        {orders.length === 0 ? 'No orders yet' : 'No matches'}
                    </h3>
                    {orders.length === 0 ? (
                        <>
                            <p className="hint-text mb-4 max-w-md mx-auto">
                                No checkout orders exist yet. Customers create orders from the marketplace checkout flow.
                            </p>
                            <p className="hint-text text-xs mb-4">
                                Demo data: in <code className="hint-code">backend</code> run{' '}
                                <code className="hint-code">npm run db:seed</code> then refresh.
                            </p>
                            <Link to="/marketplace" className="btn-outline text-sm inline-block px-4 py-2">
                                View marketplace
                            </Link>
                        </>
                    ) : (
                        <p className="hint-text">
                            No orders with status &ldquo;{STATUS_LABELS[filter]}&rdquo;. Try another filter.
                        </p>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(order => (
                        <div key={order.id} className="list-row">
                            <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                                <div>
                                    <p className="text-xs text-slate-500 font-mono">{order.id}</p>
                                    <p className="text-white text-sm font-semibold mt-0.5">{order.user?.name}</p>
                                    <p className="text-slate-500 text-sm">{order.user?.email}</p>
                                </div>
                                <div className="text-right">
                                    <div className="font-display text-2xl text-brand-400 tabular-nums">
                                        {formatRWF(order.total)}
                                    </div>
                                    <p className="text-sm text-slate-500 mt-0.5">
                                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <span className={`status-badge ${STATUS_STYLES[order.status]}`}>
                                    {STATUS_LABELS[order.status] ?? order.status}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {order.items?.map((item: OrderItem) => (
                                    <span key={item.id} className="order-chip">
                                        {item.product?.name} ×{item.quantity} — {item.product?.vendor?.storeName}
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
