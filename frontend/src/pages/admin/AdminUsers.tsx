import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../../utils/apiError';

type UserRole = 'CUSTOMER' | 'VENDOR' | 'ADMIN';

interface VendorInfo {
    storeName: string;
    approved?: boolean;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt?: string;
    vendor?: VendorInfo | null;
    _count?: { orders?: number } | null;
}

const ROLE_STYLES: Record<UserRole, string> = {
    CUSTOMER: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    VENDOR: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    ADMIN: 'bg-gold-400/10 border-gold-400/30 text-gold-400',
};

type RoleFilter = 'ALL' | UserRole;

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const { data } = await api.get('/admin/users');
            setUsers(Array.isArray(data?.users) ? data.users : []);
        } catch (e) {
            const msg = getApiErrorMessage(e, 'Failed to load users');
            setLoadError(msg);
            setUsers([]);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadUsers();
    }, [loadUsers]);

    const makeAdmin = async (id: string, name: string) => {
        if (!confirm(`Make ${name} an admin?`)) return;
        try {
            await api.patch(`/admin/users/${id}/make-admin`);
            setUsers(u => u.map(x => x.id === id ? { ...x, role: 'ADMIN' } : x));
            toast.success(`${name} is now an admin`);
        } catch (e) {
            toast.error(getApiErrorMessage(e, 'Failed'));
        }
    };

    const deleteUser = async (id: string, name: string) => {
        if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(u => u.filter(x => x.id !== id));
            toast.success('User deleted');
        } catch (e) {
            toast.error(getApiErrorMessage(e, 'Failed to delete user'));
        }
    };

    const roleCounts = {
        ALL: users.length,
        CUSTOMER: users.filter(u => u.role === 'CUSTOMER').length,
        VENDOR: users.filter(u => u.role === 'VENDOR').length,
        ADMIN: users.filter(u => u.role === 'ADMIN').length,
    };

    const filtered = users.filter(u => {
        if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
        const q = search.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    });

    return (
        <div className="p-8 max-w-[1600px]">
            <div className="mb-8">
                
                <h1 className="font-display text-5xl text-white">
                    USERS<span className="text-gold-400">.</span>
                </h1>
                <p className="text-[#555] text-sm mt-2">
                    {users.length} registered — customers, vendors, and admins on the platform
                </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                {(['ALL', 'CUSTOMER', 'VENDOR', 'ADMIN'] as const).map(r => (
                    <button
                        key={r}
                        type="button"
                        onClick={() => setRoleFilter(r)}
                        className={`font-mono text-[10px] px-4 py-2 rounded border transition-all ${roleFilter === r
                            ? 'bg-gold-400/10 border-gold-400/30 text-gold-400'
                            : 'border-[#1a1a1a] text-[#555] hover:text-white'
                            }`}
                    >
                        {r} ({roleCounts[r]})
                    </button>
                ))}
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="input-field max-w-md"
                    placeholder="Search by name or email..."
                />
            </div>

            {loadError && (
                <div className="card border-red-500/30 bg-red-500/5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <p className="font-mono text-sm text-red-400">{loadError}</p>
                    <button
                        type="button"
                        onClick={() => void loadUsers()}
                        className="font-mono text-[10px] px-4 py-2 rounded border border-red-500/40 text-red-300 hover:bg-red-500/10 shrink-0"
                    >
                        RETRY
                    </button>
                </div>
            )}

            {loading ? (
                <div className="space-y-3">
                    {[...Array(6)].map((_, i) => <div key={i} className="card animate-pulse h-14" />)}
                </div>
            ) : loadError ? null : filtered.length === 0 ? (
                <div className="card text-center py-16 max-w-lg mx-auto">
                    {users.length === 0 ? (
                        <>
                            <p className="text-[#888] text-sm mb-4">
                                No user accounts in the database yet, or the list failed silently before. Check the red error box above if the API rejected the request.
                            </p>
                            <p className="font-mono text-[10px] text-[#555] mb-4">
                                Load demo users and vendors: in <code className="text-gold-400/90">backend</code> run{' '}
                                <code className="text-gold-400/90">npm run db:seed</code> then refresh.
                            </p>
                            <Link to="/register" className="btn-outline text-xs inline-block px-4 py-2">
                                Open registration
                            </Link>
                        </>
                    ) : (
                        <p className="text-[#555] text-sm">No users match your search.</p>
                    )}
                </div>
            ) : (
                <div className="card p-0 overflow-hidden border border-[#1a1a1a]">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
                                    <th className="label px-5 py-3 font-normal w-[22%]">USER</th>
                                    <th className="label px-5 py-3 font-normal w-[28%]">EMAIL</th>
                                    <th className="label px-5 py-3 font-normal w-[14%]">ROLE</th>
                                    <th className="label px-5 py-3 font-normal w-[10%]">ORDERS</th>
                                    <th className="label px-5 py-3 font-normal w-[12%]">JOINED</th>
                                    <th className="label px-5 py-3 font-normal w-[20%] text-right">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#111]">
                                {filtered.map(user => (
                                    <tr key={user.id} className="hover:bg-[#0a0a0a]/80 transition-colors">
                                        <td className="px-5 py-4 align-top">
                                            <p className="text-white text-sm font-medium">{user.name}</p>
                                            {user.vendor && (
                                                <p className="font-mono text-[9px] text-gold-400 mt-1">
                                                    {user.vendor.storeName}
                                                    {user.vendor.approved === false && (
                                                        <span className="ml-2 text-amber-400">(pending)</span>
                                                    )}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 align-top">
                                            <p className="text-[#aaa] text-xs break-all">{user.email}</p>
                                        </td>
                                        <td className="px-5 py-4 align-top">
                                            <span className={`inline-flex font-mono text-[9px] px-2 py-1 rounded border ${ROLE_STYLES[user.role]}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 align-top">
                                            <span className="font-display text-lg text-white tabular-nums">
                                                {user._count?.orders ?? 0}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 align-top">
                                            <span className="font-mono text-[9px] text-[#555]">
                                                {user.createdAt
                                                    ? new Date(user.createdAt).toLocaleDateString()
                                                    : '—'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 align-top text-right">
                                            <div className="flex flex-wrap justify-end gap-2">
                                                {user.role !== 'ADMIN' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => makeAdmin(user.id, user.name)}
                                                        className="font-mono text-[9px] border border-gold-400/30 text-gold-400 px-2 py-1.5 rounded hover:bg-gold-400/10 transition-all whitespace-nowrap"
                                                    >
                                                        MAKE ADMIN
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => deleteUser(user.id, user.name)}
                                                    className="font-mono text-[9px] border border-red-500/30 text-red-400 px-2 py-1.5 rounded hover:bg-red-500/10 transition-all whitespace-nowrap"
                                                >
                                                    DELETE
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
