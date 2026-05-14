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

    if (loadingStats) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">

            {/* Header */}
            <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
                <div>
                    <div className="label mb-2">// VENDOR PORTAL</div>
                    <h1 className="font-display text-5xl text-white">
                        {stats?.storeName?.toUpperCase() || 'DASHBOARD'}
                        <span className="text-gold-400">.</span>
                    </h1>
                    <p className="text-[#555] text-sm mt-2">
                        Welcome back, {user?.name}
                    </p>
                </div>

                {/* Approval badge */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded border ${stats?.approved
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    }`}>
                    <span className={`w-2 h-2 rounded-full ${stats?.approved ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                    <span className="font-mono text-[10px]">
                        {stats?.approved ? 'STORE APPROVED' : 'PENDING APPROVAL'}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    {
                        label: 'TOTAL REVENUE',
                        value: formatRWF(stats?.totalRevenue || 0),
                        sub: 'All time',
                        color: 'text-gold-400',
                    },
                    {
                        label: 'TOTAL ORDERS',
                        value: stats?.totalOrders || 0,
                        sub: 'All time',
                        color: 'text-blue-400',
                    },
                    {
                        label: 'RECENT ORDERS',
                        value: stats?.recentOrders || 0,
                        sub: 'Last 30 days',
                        color: 'text-emerald-400',
                    },
                    {
                        label: 'PRODUCTS LISTED',
                        value: stats?.totalProducts || 0,
                        sub: 'Active listings',
                        color: 'text-purple-400',
                    },
                ].map(stat => (
                    <div key={stat.label} className="card">
                        <div className="label mb-3">{stat.label}</div>
                        <div className={`font-display text-4xl ${stat.color} mb-1`}>
                            {stat.value}
                        </div>
                        <div className="font-mono text-[10px] text-[#444]">{stat.sub}</div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">

                {/* Left — AI Insights + Top Products */}
                <div className="lg:col-span-2 space-y-6">

                    {/* AI Insights Panel */}
                    <div className="card border-gold-400/20">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-gold-400">✦</span>
                                    <div className="label text-gold-400">AI BUSINESS INSIGHTS</div>
                                </div>
                                <p className="text-[#555] text-xs">
                                    Powered by Claude — analyzes your store performance
                                </p>
                            </div>
                            <button
                                onClick={fetchInsights}
                                disabled={loadingInsights || insightsFetched}
                                className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold transition-all ${insightsFetched
                                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 cursor-default'
                                    : 'bg-gold-400/10 border border-gold-400/30 text-gold-400 hover:bg-gold-400/20 disabled:opacity-50'
                                    }`}
                            >
                                {loadingInsights ? (
                                    <>
                                        <span className="w-3 h-3 border border-gold-400 border-t-transparent rounded-full animate-spin" />
                                        Analyzing...
                                    </>
                                ) : insightsFetched ? (
                                    '✓ Generated'
                                ) : (
                                    '✦ Generate Insights'
                                )}
                            </button>
                        </div>

                        {/* Insights content */}
                        {!insights && !loadingInsights && (
                            <div className="border border-dashed border-[#2a2a2a] rounded-lg p-8 text-center">
                                <div className="font-display text-3xl text-[#1a1a1a] mb-3">AI READY</div>
                                <p className="text-[#444] text-sm">
                                    Click "Generate Insights" to get AI-powered analysis of your store performance.
                                </p>
                            </div>
                        )}

                        {loadingInsights && (
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="h-3 bg-[#1a1a1a] rounded w-full mb-2" />
                                        <div className="h-3 bg-[#1a1a1a] rounded w-4/5" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {insights && (
                            <div className="space-y-3">
                                {insights.split('\n').filter(Boolean).map((line, i) => (
                                    <div key={i} className="flex gap-3 p-3 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
                                        <span className="text-gold-400 mt-0.5 flex-shrink-0">✦</span>
                                        <p className="text-[#aaa] text-sm leading-relaxed">
                                            {line.replace(/^[•-]\s*/, '')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Top Products */}
                    {stats?.topProducts && stats.topProducts.length > 0 && (
                        <div className="card">
                            <div className="label mb-4">// TOP PERFORMING PRODUCTS</div>
                            <div className="space-y-3">
                                {stats.topProducts.map((name, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
                                        <div className={`font-display text-2xl w-8 text-center ${i === 0 ? 'text-gold-400' : i === 1 ? 'text-[#888]' : 'text-[#555]'
                                            }`}>
                                            {i + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white text-sm font-medium">{name}</p>
                                            <p className="font-mono text-[10px] text-[#444]">BY REVENUE</p>
                                        </div>
                                        {i === 0 && (
                                            <span className="font-mono text-[9px] bg-gold-400/10 border border-gold-400/30 text-gold-400 px-2 py-1 rounded">
                                                BEST SELLER
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* Right — Quick Actions */}
                <div className="space-y-6">

                    {/* Quick Actions */}
                    <div className="card">
                        <div className="label mb-4">// QUICK ACTIONS</div>
                        <div className="space-y-2">
                            <Link
                                to="/vendor/products/add"
                                className="flex items-center justify-between w-full p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg hover:border-gold-400 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-gold-400">+</span>
                                    <span className="text-sm text-white">Add New Product</span>
                                </div>
                                <span className="text-[#444] group-hover:text-gold-400 transition-colors">→</span>
                            </Link>
                            <Link
                                to="/vendor/products"
                                className="flex items-center justify-between w-full p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg hover:border-[#2a2a2a] transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-blue-400">▤</span>
                                    <span className="text-sm text-white">Manage Products</span>
                                </div>
                                <span className="text-[#444] group-hover:text-white transition-colors">→</span>
                            </Link>
                            <Link
                                to="/marketplace"
                                className="flex items-center justify-between w-full p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg hover:border-[#2a2a2a] transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-emerald-400">◎</span>
                                    <span className="text-sm text-white">View Marketplace</span>
                                </div>
                                <span className="text-[#444] group-hover:text-white transition-colors">→</span>
                            </Link>
                        </div>
                    </div>

                    {/* Store Health */}
                    <div className="card">
                        <div className="label mb-4">// STORE HEALTH</div>
                        <div className="space-y-4">
                            {[
                                {
                                    label: 'Products Listed',
                                    value: stats?.totalProducts || 0,
                                    max: 10,
                                    color: 'bg-blue-400'
                                },
                                {
                                    label: 'Orders (30 days)',
                                    value: stats?.recentOrders || 0,
                                    max: 20,
                                    color: 'bg-emerald-400'
                                },
                                {
                                    label: 'Revenue Score',
                                    value: Math.min(stats?.totalRevenue || 0, 1000),
                                    max: 1000,
                                    color: 'bg-gold-400'
                                },
                            ].map(item => (
                                <div key={item.label}>
                                    <div className="flex justify-between mb-1">
                                        <span className="font-mono text-[10px] text-[#555]">{item.label}</span>
                                        <span className="font-mono text-[10px] text-[#666]">{item.value}</span>
                                    </div>
                                    <div className="h-1.5 bg-[#111] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                                            style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="card border-[#1a1a1a]">
                        <div className="label mb-3">// PRO TIPS</div>
                        <div className="space-y-3">
                            {[
                                'Add 5+ product photos to increase sales by 40%',
                                'Use AI descriptions to save time & rank better',
                                'Update stock regularly to avoid lost sales',
                            ].map((tip, i) => (
                                <div key={i} className="flex gap-2">
                                    <span className="text-gold-400 text-xs mt-0.5 flex-shrink-0">✦</span>
                                    <p className="text-[#555] text-xs leading-relaxed">{tip}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}