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

function formatStatus(status: string) {
    return status.charAt(0) + status.slice(1).toLowerCase();
}

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
            <div className="spinner" />
        </div>
    );

    if (error || !data) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center max-w-md mx-auto">
            <p className="text-sm font-medium text-red-400">Couldn&apos;t load dashboard data</p>
            {errorMessage && (
                <p className="text-sm text-slate-500 leading-relaxed">{errorMessage}</p>
            )}
            <p className="hint-text text-xs">
                Backend should run on port 5000. Sign in as admin:{' '}
                <span className="text-brand-400">demo-admin@vendxx.local</span> /{' '}
                <span className="text-brand-400">Demo123456!</span>
                {' '}(run <code className="hint-code">npm run db:seed</code> in backend if needed).
            </p>
            <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn-outline text-sm px-5 py-2.5"
            >
                Try again
            </button>
        </div>
    );

    const { stats, recentOrders } = data;

    const statCards = [
        { label: 'Total revenue', value: formatRWF(stats.totalRevenue), color: 'text-brand-400', sub: 'All time' },
        { label: 'Total orders', value: stats.totalOrders, color: 'text-blue-400', sub: 'All time' },
        { label: 'Total users', value: stats.totalUsers, color: 'text-emerald-400', sub: 'Registered accounts' },
        { label: 'Total vendors', value: stats.totalVendors, color: 'text-purple-400', sub: 'Active stores' },
        { label: 'Total products', value: stats.totalProducts, color: 'text-cyan-400', sub: 'Listed items' },
        { label: 'Pending vendors', value: stats.pendingVendors, color: 'text-amber-400', sub: 'Awaiting approval', key: 'pending' },
    ];

    return (
        <div className="page-shell">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <header className="page-header mb-0">
                    <span className="eyebrow">Platform overview</span>
                    <h1>Dashboard</h1>
                </header>
                <div className="flex flex-wrap gap-2">
                    <Link to="/admin/vendors" className="quick-link">Vendors</Link>
                    <Link to="/admin/users" className="quick-link">Users</Link>
                    <Link to="/admin/orders" className="quick-link">All orders</Link>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {statCards.map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="label mb-3 normal-case tracking-normal text-slate-500">{s.label}</div>
                        <div className={`stat-card-value ${s.color}`}>{s.value}</div>
                        <div className="stat-card-sub">{s.sub}</div>
                        {s.key === 'pending' && stats.pendingVendors > 0 && (
                            <Link
                                to="/admin/vendors"
                                className="inline-block mt-3 text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors"
                            >
                                Review approval queue
                            </Link>
                        )}
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-white font-semibold">Orders by status</h2>
                        <span className="text-xs text-slate-500">{stats.totalOrders} total</span>
                    </div>
                    <div className="space-y-4">
                        {ordersByStatusRows.map((s: OrderStatus) => (
                            <div key={s.status} className="flex items-center gap-4">
                                <span className={`status-badge min-w-[5.5rem] justify-center ${STATUS_STYLES[s.status]}`}>
                                    {formatStatus(s.status)}
                                </span>
                                <div className="progress-track flex-1">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: stats.totalOrders > 0
                                                ? `${Math.min((s._count.status / stats.totalOrders) * 100, 100)}%`
                                                : '0%',
                                        }}
                                    />
                                </div>
                                <span className="font-display text-lg text-white tabular-nums w-8 text-right">
                                    {s._count.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h2 className="text-white font-semibold mb-4">Recent orders</h2>
                    <div className="space-y-3">
                        {recentOrders.length === 0 ? (
                            <p className="hint-text">No recent orders yet.</p>
                        ) : (
                            recentOrders.map((order: Order) => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between gap-3 p-3 bg-surface-900/50 rounded-xl border border-surface-600/30"
                                >
                                    <div className="min-w-0">
                                        <p className="text-white text-sm font-medium truncate">
                                            {order.user?.name ?? '—'}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate mt-0.5">{order.id}</p>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className="font-display text-base text-brand-400 tabular-nums">
                                            {formatRWF(order.total)}
                                        </span>
                                        <span className={`status-badge ${STATUS_STYLES[order.status] ?? ''}`}>
                                            {formatStatus(order.status)}
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
