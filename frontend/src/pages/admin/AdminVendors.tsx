import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

type Vendor = {
    id: string;
    approved: boolean;
    storeName: string;
    user?: {
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
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await api.get('/admin/vendors');
                setVendors(data.vendors);
            } catch {
                toast.error('Failed to load vendors');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const approve = async (id: string, name: string) => {
        try {
            await api.patch(`/admin/vendors/${id}/approve`);
            setVendors(v => v.map(x => x.id === id ? { ...x, approved: true } : x));
            toast.success(`${name} approved! ✓`);
        } catch {
            toast.error('Failed to approve vendor');
        }
    };

    const reject = async (id: string, name: string) => {
        try {
            await api.patch(`/admin/vendors/${id}/reject`);
            setVendors(v => v.map(x => x.id === id ? { ...x, approved: false } : x));
            toast.success(`${name} rejected`);
        } catch {
            toast.error('Failed to reject vendor');
        }
    };

    const filtered = vendors.filter(v => {
        if (filter === 'PENDING') return !v.approved;
        if (filter === 'APPROVED') return v.approved;
        return true;
    });

    return (
        <div className="p-8">
            <div className="mb-8">
                <div className="label mb-2">// ADMIN</div>
                <h1 className="font-display text-5xl text-white">
                    VENDORS<span className="text-gold-400">.</span>
                </h1>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                {(['ALL', 'PENDING', 'APPROVED'] as const).map(f => (
                    <button
                        key={f}
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
            ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                    <div className="font-display text-5xl text-[#1a1a1a] mb-4">EMPTY</div>
                    <p className="text-[#555]">No vendors found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(vendor => (
                        <div key={vendor.id} className="card hover:border-[#2a2a2a] transition-all">
                            <div className="flex items-center justify-between flex-wrap gap-4">

                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 bg-[#111] border border-[#1a1a1a] rounded-lg flex items-center justify-center flex-shrink-0">
                                        <span className="font-display text-gold-400 text-lg">
                                            {vendor.storeName?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold">{vendor.storeName}</p>
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
                                    {/* Status badge */}
                                    <span className={`font-mono text-[10px] px-3 py-1 rounded border ${vendor.approved
                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                            : 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
                                        }`}>
                                        {vendor.approved ? '✓ APPROVED' : '⏳ PENDING'}
                                    </span>

                                    {/* Actions */}
                                    {!vendor.approved ? (
                                        <button
                                            onClick={() => approve(vendor.id, vendor.storeName)}
                                            className="font-mono text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded hover:bg-emerald-500/20 transition-all"
                                        >
                                            ✓ APPROVE
                                        </button>
                                    ) : (
                                        <button
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