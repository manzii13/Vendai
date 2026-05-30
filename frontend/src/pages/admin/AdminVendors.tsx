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

const FILTER_LABELS: Record<'ALL' | 'PENDING' | 'APPROVED', string> = {
    ALL: 'All',
    PENDING: 'Pending',
    APPROVED: 'Approved',
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

    const filterCount = (f: typeof filter) =>
        f === 'ALL' ? vendors.length : f === 'PENDING' ? vendors.filter(v => !v.approved).length : vendors.filter(v => v.approved).length;

    return (
        <div className="page-shell max-w-[1200px]">
            <header className="page-header">
                <span className="eyebrow">Store management</span>
                <h1>Vendors</h1>
                <p className="hint-text mt-2 max-w-2xl">
                    Approve pending stores so vendors can list products. Revoke approval to block new listings.
                </p>
            </header>

            {loadError && (
                <div className="error-banner mb-6">
                    <p className="text-sm text-red-400">{loadError}</p>
                    <button type="button" onClick={() => void loadVendors()} className="btn-sm-danger shrink-0">
                        Try again
                    </button>
                </div>
            )}

            <div className="flex flex-wrap gap-2 mb-6">
                {(['ALL', 'PENDING', 'APPROVED'] as const).map(f => (
                    <button
                        key={f}
                        type="button"
                        onClick={() => setFilter(f)}
                        className={`filter-tab ${filter === f ? 'filter-tab-active' : ''}`}
                    >
                        {FILTER_LABELS[f]} ({filterCount(f)})
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
                <div className="empty-state">
                    <h3 className="empty-state-title">
                        {vendors.length === 0 ? 'No stores yet' : 'No matches'}
                    </h3>
                    {vendors.length === 0 ? (
                        <>
                            <p className="hint-text mb-6 max-w-md mx-auto">
                                The database has no vendor profiles yet. A store is created when someone registers
                                with the <span className="text-brand-400 font-medium">Vendor</span> role.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
                                <Link to="/register" className="btn-primary text-sm px-5 py-2.5">
                                    Open registration
                                </Link>
                            </div>
                            <p className="hint-text text-xs max-w-md mx-auto">
                                For local development, load demo data in the{' '}
                                <code className="hint-code">backend</code> folder:{' '}
                                <code className="hint-code">npm run db:seed</code>
                                {' '}(requires PostgreSQL and <code className="hint-code">DATABASE_URL</code> in{' '}
                                <code className="hint-code">.env</code>), then refresh.
                            </p>
                        </>
                    ) : (
                        <p className="hint-text">No vendors match the &ldquo;{FILTER_LABELS[filter]}&rdquo; filter.</p>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(vendor => (
                        <div key={vendor.id} className="list-row">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="avatar-placeholder">
                                        {vendor.storeName?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold">{vendor.storeName}</p>
                                        <p className="text-slate-300 text-sm mt-0.5">
                                            {vendor.user?.name ?? '—'}
                                        </p>
                                        <p className="text-slate-500 text-sm">{vendor.user?.email}</p>
                                        <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
                                            <span>{vendor._count?.products || 0} products</span>
                                            <span>
                                                Joined{' '}
                                                {vendor.user?.createdAt
                                                    ? new Date(vendor.user.createdAt).toLocaleDateString()
                                                    : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span
                                        className={`status-badge ${
                                            vendor.approved
                                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                        }`}
                                    >
                                        {vendor.approved ? 'Approved' : 'Pending'}
                                    </span>

                                    {!vendor.approved ? (
                                        <button
                                            type="button"
                                            onClick={() => approve(vendor.id, vendor.storeName)}
                                            className="btn-sm-success"
                                        >
                                            Approve
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => reject(vendor.id, vendor.storeName)}
                                            className="btn-sm-danger"
                                        >
                                            Revoke
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
