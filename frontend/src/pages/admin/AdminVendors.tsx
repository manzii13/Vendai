import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../../utils/apiError';

type Vendor = {
    id: string;
    approved: boolean;
    storeName: string;
    user?: {
        name?: string;
        email?: string;
        createdAt?: string;
    } | null;
    _count?: {
        products?: number;
    } | null;
};

export default function AdminVendors() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED'>('PENDING');

    const loadVendors = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const { data } = await api.get('/admin/vendors');
            setVendors(Array.isArray(data?.vendors) ? data.vendors : []);
        } catch (e) {
            const msg = getApiErrorMessage(e, 'Failed to load vendors');
            setLoadError(msg);
            setVendors([]);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadVendors();
    }, [loadVendors]);

    const approve = async (id: string, name: string) => {
        try {
            await api.patch(`/admin/vendors/${id}/approve`);
            setVendors(v => v.map(x => x.id === id ? { ...x, approved: true } : x));
            toast.success(`${name} approved! ✓`);
        } catch (e) {
            toast.error(getApiErrorMessage(e, 'Failed to approve vendor'));
        }
    };

    const reject = async (id: string, name: string) => {
        try {
            await api.patch(`/admin/vendors/${id}/reject`);
            setVendors(v => v.map(x => x.id === id ? { ...x, approved: false } : x));
            toast.success(`${name} rejected`);
        } catch (e) {
            toast.error(getApiErrorMessage(e, 'Failed to reject vendor'));
        }
    };

    const filtered = vendors.filter(v => {
        if (filter === 'PENDING') return !v.approved;
        if (filter === 'APPROVED') return v.approved;
        return true;
    });

    return (
        <div className="p-8 max-w-[1200px]">
            <div className="mb-8">
                
                <h1 className="font-display text-5xl text-white">
                    VENDORS<span className="text-gold-400">.</span>
                </h1>
                <p className="text-[#555] text-sm mt-2 max-w-2xl">
                    Approve pending stores so vendors can list products. Revoke approval to block new listings.
                </p>
            </div>

            {loadError && (
                <div className="card border-red-500/30 bg-red-500/5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <p className="font-mono text-sm text-red-400">{loadError}</p>
                    <button
                        type="button"
                        onClick={() => void loadVendors()}
                        className="font-mono text-[10px] px-4 py-2 rounded border border-red-500/40 text-red-300 hover:bg-red-500/10 shrink-0"
                    >
                        RETRY
                    </button>
                </div>
            )}

            {/* Filter Tabs — default PENDING so approvals are front and center */}
            <div className="flex flex-wrap gap-2 mb-6">
                {(['ALL', 'PENDING', 'APPROVED'] as const).map(f => (
                    <button
                        key={f}
                        type="button"
                        onClick={() => setFilter(f)}
                        className={`font-mono text-[10px] px-4 py-2 rounded border transition-all ${filter === f
                                ? 'bg-gold-400/10 border-gold-400/30 text-gold-400'
                                : 'border-[#1a1a1a] text-[#555] hover:text-white'
                            }`}
                    >
                        {f} ({f === 'ALL' ? vendors.length : f === 'PENDING' ? vendors.filter(v => !v.approved).length : vendors.filter(v => v.approved).length})
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="card animate-pulse h-20" />
                    ))}
                </div>
            ) : loadError ? null : filtered.length === 0 ? (
                <div className="card border-[#2a2a2a] py-16 px-6 text-center max-w-xl mx-auto">
                    <div className="font-display text-4xl text-[#333] mb-3">
                        {vendors.length === 0 ? 'NO STORES' : 'NO MATCH'}
                    </div>
                    {vendors.length === 0 ? (
                        <>
                            <p className="text-[#888] text-sm mb-4 leading-relaxed">
                                The database has no vendor profiles yet. A store row is only created when someone registers
                                with the <span className="text-gold-400">Vendor</span> role on sign-up.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
                                <Link to="/register" className="btn-primary text-xs px-5 py-2.5">
                                    Open registration
                                </Link>
                            </div>
                            <p className="font-mono text-[10px] text-[#555] leading-relaxed">
                                For local development you can load demo vendors, users, and orders: in the{' '}
                                <code className="text-gold-400/90">backend</code> folder run{' '}
                                <code className="text-gold-400/90">npm run db:seed</code>
                                (requires PostgreSQL and <code className="text-gold-400/90">DATABASE_URL</code> in{' '}
                                <code className="text-gold-400/90">.env</code>), then refresh this page.
                            </p>
                        </>
                    ) : (
                        <p className="text-[#666] text-sm">No vendors match the &ldquo;{filter}&rdquo; filter. Try ALL or PENDING.</p>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(vendor => (
                        <div key={vendor.id} className="card hover:border-[#2a2a2a] transition-all">
                            <div className="flex items-center justify-between flex-wrap gap-4">

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#111] border border-[#1a1a1a] rounded-lg flex items-center justify-center flex-shrink-0">
                                        <span className="font-display text-gold-400 text-lg">
                                            {vendor.storeName?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold">{vendor.storeName}</p>
                                        <p className="text-[#ccc] text-xs mt-0.5">
                                            {vendor.user?.name ?? '—'}
                                        </p>
                                        <p className="text-[#555] text-xs">{vendor.user?.email}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="font-mono text-[9px] text-[#444]">
                                                {vendor._count?.products || 0} PRODUCTS
                                            </span>
                                            <span className="font-mono text-[9px] text-[#444]">
                                                JOINED {vendor.user?.createdAt ? new Date(vendor.user.createdAt).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`font-mono text-[10px] px-3 py-1 rounded border ${vendor.approved
                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                            : 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
                                        }`}>
                                        {vendor.approved ? '✓ APPROVED' : '⏳ PENDING'}
                                    </span>

                                    {!vendor.approved ? (
                                        <button
                                            type="button"
                                            onClick={() => approve(vendor.id, vendor.storeName)}
                                            className="font-mono text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded hover:bg-emerald-500/20 transition-all"
                                        >
                                            ✓ APPROVE
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => reject(vendor.id, vendor.storeName)}
                                            className="font-mono text-[10px] bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded hover:bg-red-500/20 transition-all"
                                        >
                                            ✕ REVOKE
                                        </button>
                                    )}
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
