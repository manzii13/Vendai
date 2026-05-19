import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatRWF } from '../../utils/currency';
import { getApiErrorMessage } from '../../utils/apiError';

/** Full set of platform order statuses (matches Prisma) for charts even when count is 0 */
const ORDER_STATUS_KEYS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

const STATUS_STYLES: Record<string, string> = {
    PENDING: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    CONFIRMED: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    SHIPPED: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    DELIVERED: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    CANCELLED: 'bg-red-500/10 border-red-500/30 text-red-400',
};

interface Order {
    id: string;
    user?: { name: string };
    total: number;
    status: string;
}

interface OrderStatus {
    status: string;
    _count: { status: number };
}

interface AdminStats {
    stats: {
        totalRevenue: number;
        totalOrders: number;
        totalUsers: number;
        totalVendors: number;
        totalProducts: number;
        pendingVendors: number;
        ordersByStatus: OrderStatus[];
    };
    recentOrders: Order[];
}

export default function AdminOverview() {
    const [data, setData] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const ordersByStatusRows = useMemo(() => {
        if (!data) return [];
        const map = new Map(data.stats.ordersByStatus.map(s => [s.status, s._count.status]));
        return ORDER_STATUS_KEYS.map(status => ({
            status,
            _count: { status: map.get(status) ?? 0 },
        }));
    }, [data]);

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await api.get('/admin/stats');
                setData(data);
            } catch (e) {
                setError(true);
                setErrorMessage(getApiErrorMessage(e, 'Failed to load stats'));
                toast.error('Failed to load stats');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (error || !data) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center max-w-md mx-auto">
            <p className="font-mono text-sm text-red-400">Failed to load dashboard data.</p>
            {errorMessage && (
                <p className="font-mono text-[11px] text-[#888] leading-relaxed">{errorMessage}</p>
            )}
            <p className="font-mono text-[10px] text-[#555] leading-relaxed">
                Backend must be on port 5000. Sign in as admin: <span className="text-gold-400/90">demo-admin@vendxx.local</span> / <span className="text-gold-400/90">Demo123456!</span> (run <code className="text-gold-400/80">npm run db:seed</code> in backend if needed).
            </p>
            <button
                onClick={() => window.location.reload()}
                className="font-mono text-xs px-4 py-2 border border-[#333] text-[#888] hover:text-white hover:border-white transition-colors rounded"
            >
                RETRY
            </button>
        </div>
    );

    const { stats, recentOrders } = data;

    return (
        <div className="p-8 max-w-[1600px]">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <header className="page-header mb-0">
                    <span className="eyebrow">Platform overview</span>
                    <h1>Dashboard</h1>
                </header>
                <div className="flex flex-wrap gap-2">
                    <Link
                        to="/admin/vendors"
                        className="text-xs font-medium px-3 py-2 rounded-lg border border-surface-600/60 text-slate-400 hover:text-brand-400 hover:border-brand-400/30 transition-all"
                    >
                        VENDORS →
                    </Link>
                    <Link
                        to="/admin/users"
                        className="text-xs font-medium px-3 py-2 rounded-lg border border-surface-600/60 text-slate-400 hover:text-brand-400 hover:border-brand-400/30 transition-all"
                    >
                        USERS →
                    </Link>
                    <Link
                        to="/admin/orders"
                        className="text-xs font-medium px-3 py-2 rounded-lg border border-surface-600/60 text-slate-400 hover:text-brand-400 hover:border-brand-400/30 transition-all"
                    >
                        ALL ORDERS →
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {[
                    { label: 'TOTAL REVENUE', value: formatRWF(stats.totalRevenue), color: 'text-gold-400', sub: 'All time' },
                    { label: 'TOTAL ORDERS', value: stats.totalOrders, color: 'text-blue-400', sub: 'All time' },
                    { label: 'TOTAL USERS', value: stats.totalUsers, color: 'text-emerald-400', sub: 'Registered' },
                    { label: 'TOTAL VENDORS', value: stats.totalVendors, color: 'text-purple-400', sub: 'Stores' },
                    { label: 'TOTAL PRODUCTS', value: stats.totalProducts, color: 'text-cyan-400', sub: 'Listed' },
                    { label: 'PENDING VENDORS', value: stats.pendingVendors, color: 'text-amber-400', sub: 'Need approval' },
                ].map(s => (
                    <div key={s.label} className="card">
                        <div className="label mb-3">{s.label}</div>
                        <div className={`font-display text-4xl ${s.color} mb-1`}>{s.value}</div>
                        <div className="font-mono text-[10px] text-[#444]">{s.sub}</div>
                        {s.label === 'PENDING VENDORS' && stats.pendingVendors > 0 && (
                            <Link
                                to="/admin/vendors"
                                className="inline-block mt-3 font-mono text-[9px] text-gold-400 hover:underline"
                            >
                                Review queue →
                            </Link>
                        )}
                    </div>
                ))}
            </div>

            {/* Orders by Status */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <div className="card">
                    <div className="label mb-4">ORDERS BY STATUS</div>
                    <p className="font-mono text-[9px] text-[#444] mb-3">PENDING · CONFIRMED · SHIPPED · DELIVERED · CANCELLED</p>
                    <div className="space-y-3">
                        {ordersByStatusRows.map((s: OrderStatus) => (
                            <div key={s.status} className="flex items-center justify-between">
                                <span className={`font-mono text-[10px] px-3 py-1 rounded border ${STATUS_STYLES[s.status]}`}>
                                    {s.status}
                                </span>
                                <div className="flex items-center gap-3 flex-1 mx-4">
                                    <div className="flex-1 h-1.5 bg-[#111] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gold-400 rounded-full"
                                            style={{
                                                width: stats.totalOrders > 0
                                                    ? `${Math.min((s._count.status / stats.totalOrders) * 100, 100)}%`
                                                    : '0%'
                                            }}
                                        />
                                    </div>
                                </div>
                                <span className="font-display text-lg text-white">{s._count.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="card">
                    <div className="label mb-4">RECENT ORDERS</div>
                    <div className="space-y-3">
                        {recentOrders.length === 0 ? (
                            <p className="font-mono text-[10px] text-[#444]">No recent orders.</p>
                        ) : (
                            recentOrders.map((order: Order) => (
                                <div key={order.id} className="flex items-center justify-between p-2 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
                                    <div className="min-w-0">
                                        <p className="text-white text-xs font-medium">{order.user?.name ?? '—'}</p>
                                        <p className="font-mono text-[9px] text-[#444] truncate">{order.id}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className="font-display text-base text-gold-400">{formatRWF(order.total)}</span>
                                        <span className={`font-mono text-[9px] px-2 py-0.5 rounded border ${STATUS_STYLES[order.status] ?? ''}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}