import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { formatRWF } from '../../utils/currency';

interface Stats {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    recentOrders: number;
    topProducts: string[];
    storeName: string;
    approved: boolean;
}

export default function Dashboard() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState<Stats | null>(null);
    const [insights, setInsights] = useState('');
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingInsights, setLoadingInsights] = useState(false);
    const [insightsFetched, setInsightsFetched] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/vendors/dashboard/stats');
                setStats(data.stats);
            } catch {
                toast.error('Failed to load dashboard');
            } finally {
                setLoadingStats(false);
            }
        };
        fetchStats();
    }, []);

    const fetchInsights = async () => {
        if (insightsFetched) return;
        setLoadingInsights(true);
        try {
            const { data } = await api.get('/vendors/dashboard/ai-insights');
            setInsights(data.insights);
            setInsightsFetched(true);
        } catch {
            toast.error('AI insights failed. Check your API key.');
        } finally {
            setLoadingInsights(false);
        }
    };

    if (loadingStats) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-market-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-market-700 mb-1">Vendor dashboard</p>
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                        {stats?.storeName || 'Your store'}
                    </h1>
                    <p className="text-slate-600 text-sm mt-1">Welcome back, {user?.name}</p>
                </div>

                <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold ${
                        stats?.approved
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}
                >
                    <span
                        className={`w-2 h-2 rounded-full ${stats?.approved ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}
                    />
                    {stats?.approved ? 'Store approved' : 'Pending approval'}
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total revenue', value: formatRWF(stats?.totalRevenue || 0), sub: 'All time', color: 'text-amber-600' },
                    { label: 'Total orders', value: stats?.totalOrders || 0, sub: 'All time', color: 'text-blue-600' },
                    { label: 'Recent orders', value: stats?.recentOrders || 0, sub: 'Last 30 days', color: 'text-emerald-600' },
                    { label: 'Products listed', value: stats?.totalProducts || 0, sub: 'Active listings', color: 'text-violet-600' },
                ].map((stat) => (
                    <div key={stat.label} className="market-card p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{stat.label}</p>
                        <p className={`text-2xl sm:text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
                        <p className="text-xs text-slate-500">{stat.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="market-card p-5 sm:p-6 border-market-200">
                        <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">AI business insights</h2>
                                <p className="text-sm text-slate-600 mt-1">
                                    Powered by Claude — analyzes your store performance
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={fetchInsights}
                                disabled={loadingInsights || insightsFetched}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${
                                    insightsFetched
                                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 cursor-default'
                                        : 'market-btn-outline text-sm py-2 disabled:opacity-50'
                                }`}
                            >
                                {loadingInsights ? (
                                    <>
                                        <span className="w-3 h-3 border-2 border-market-600 border-t-transparent rounded-full animate-spin" />
                                        Analyzing...
                                    </>
                                ) : insightsFetched ? (
                                    'Generated'
                                ) : (
                                    'Generate insights'
                                )}
                            </button>
                        </div>

                        {!insights && !loadingInsights && (
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50">
                                <p className="text-xl font-bold text-slate-800 mb-2">Ready for analysis</p>
                                <p className="text-sm text-slate-600 max-w-md mx-auto">
                                    Click &quot;Generate insights&quot; to get AI-powered suggestions for your store.
                                </p>
                            </div>
                        )}

                        {loadingInsights && (
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="animate-pulse space-y-2">
                                        <div className="h-3 bg-slate-200 rounded w-full" />
                                        <div className="h-3 bg-slate-200 rounded w-4/5" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {insights && (
                            <div className="space-y-3">
                                {insights.split('\n').filter(Boolean).map((line, i) => (
                                    <div
                                        key={i}
                                        className="flex gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-market-600 mt-2 flex-shrink-0" />
                                        <p className="text-sm text-slate-700 leading-relaxed">
                                            {line.replace(/^[•\-*]\s*/, '')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {stats?.topProducts && stats.topProducts.length > 0 && (
                        <div className="market-card p-5 sm:p-6">
                            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-4">
                                Top performing products
                            </h2>
                            <div className="space-y-3">
                                {stats.topProducts.map((name, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100"
                                    >
                                        <span
                                            className={`text-lg font-bold w-8 text-center ${
                                                i === 0 ? 'text-amber-600' : 'text-slate-400'
                                            }`}
                                        >
                                            {i + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 truncate">{name}</p>
                                            <p className="text-xs text-slate-500">By revenue</p>
                                        </div>
                                        {i === 0 && (
                                            <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-1 rounded-lg">
                                                Best seller
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="market-card p-5 sm:p-6">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-4">Quick actions</h2>
                        <div className="space-y-2">
                            <Link
                                to="/vendor/products/add"
                                className="flex items-center justify-between w-full p-3 bg-market-50 border border-market-200 rounded-xl hover:bg-market-100 transition-colors group"
                            >
                                <span className="text-sm font-medium text-slate-900">Add new product</span>
                                <span className="text-market-700 group-hover:translate-x-0.5 transition-transform">→</span>
                            </Link>
                            <Link
                                to="/vendor/products"
                                className="flex items-center justify-between w-full p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors group"
                            >
                                <span className="text-sm font-medium text-slate-900">Manage products</span>
                                <span className="text-slate-500 group-hover:text-slate-800">→</span>
                            </Link>
                            <Link
                                to="/marketplace"
                                className="flex items-center justify-between w-full p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors group"
                            >
                                <span className="text-sm font-medium text-slate-900">View marketplace</span>
                                <span className="text-slate-500 group-hover:text-slate-800">→</span>
                            </Link>
                        </div>
                    </div>

                    <div className="market-card p-5 sm:p-6">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-4">Store health</h2>
                        <div className="space-y-4">
                            {[
                                { label: 'Products listed', value: stats?.totalProducts || 0, max: 10, color: 'bg-blue-500' },
                                { label: 'Orders (30 days)', value: stats?.recentOrders || 0, max: 20, color: 'bg-emerald-500' },
                                {
                                    label: 'Revenue score',
                                    value: Math.min(stats?.totalRevenue || 0, 1000),
                                    max: 1000,
                                    color: 'bg-amber-500',
                                },
                            ].map((item) => (
                                <div key={item.label}>
                                    <div className="flex justify-between mb-1.5">
                                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                        <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                                    </div>
                                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                                            style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="market-card p-5 sm:p-6 bg-market-50/50 border-market-100">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-4">Tips</h2>
                        <ul className="space-y-3">
                            {[
                                'Add 5+ product photos to increase sales.',
                                'Use AI descriptions to save time and rank better.',
                                'Update stock regularly to avoid lost sales.',
                            ].map((tip) => (
                                <li key={tip} className="flex gap-3 text-sm text-slate-700 leading-relaxed">
                                    <span className="w-1.5 h-1.5 rounded-full bg-market-600 mt-2 flex-shrink-0" />
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
