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
    ADMIN: 'bg-brand-400/10 border-brand-400/30 text-brand-400',
};

const ROLE_LABELS: Record<RoleFilter, string> = {
    ALL: 'All',
    CUSTOMER: 'Customers',
    VENDOR: 'Vendors',
    ADMIN: 'Admins',
};

type RoleFilter = 'ALL' | UserRole;

function formatRole(role: UserRole) {
    return role.charAt(0) + role.slice(1).toLowerCase();
}

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
        <div className="page-shell">
            <header className="page-header">
                <span className="eyebrow">Accounts</span>
                <h1>Users</h1>
                <p className="hint-text mt-2">
                    {users.length} registered — customers, vendors, and admins on the platform
                </p>
            </header>

            <div className="flex flex-wrap gap-2 mb-4">
                {(['ALL', 'CUSTOMER', 'VENDOR', 'ADMIN'] as const).map(r => (
                    <button
                        key={r}
                        type="button"
                        onClick={() => setRoleFilter(r)}
                        className={`filter-tab ${roleFilter === r ? 'filter-tab-active' : ''}`}
                    >
                        {ROLE_LABELS[r]} ({roleCounts[r]})
                    </button>
                ))}
            </div>

            <div className="mb-6">
                <input
                    type="search"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="input-field max-w-md"
                    placeholder="Search by name or email..."
                    aria-label="Search users"
                />
            </div>

            {loadError && (
                <div className="error-banner mb-6">
                    <p className="text-sm text-red-400">{loadError}</p>
                    <button type="button" onClick={() => void loadUsers()} className="btn-sm-danger shrink-0">
                        Try again
                    </button>
                </div>
            )}

            {loading ? (
                <div className="space-y-3">
                    {[...Array(6)].map((_, i) => <div key={i} className="card animate-pulse h-14" />)}
                </div>
            ) : loadError ? null : filtered.length === 0 ? (
                <div className="empty-state">
                    {users.length === 0 ? (
                        <>
                            <h3 className="empty-state-title">No users yet</h3>
                            <p className="hint-text mb-4 max-w-md mx-auto">
                                No accounts in the database yet, or the request failed. Check the error message above if the API rejected the request.
                            </p>
                            <p className="hint-text text-xs mb-4">
                                Load demo data: in <code className="hint-code">backend</code> run{' '}
                                <code className="hint-code">npm run db:seed</code> then refresh.
                            </p>
                            <Link to="/register" className="btn-outline text-sm inline-block px-4 py-2">
                                Open registration
                            </Link>
                        </>
                    ) : (
                        <p className="hint-text">No users match your search.</p>
                    )}
                </div>
            ) : (
                <div className="data-table-wrap">
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th className="w-[22%]">User</th>
                                    <th className="w-[28%]">Email</th>
                                    <th className="w-[14%]">Role</th>
                                    <th className="w-[10%]">Orders</th>
                                    <th className="w-[12%]">Joined</th>
                                    <th className="w-[20%] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <p className="text-white text-sm font-medium">{user.name}</p>
                                            {user.vendor && (
                                                <p className="text-xs text-brand-400 mt-1">
                                                    {user.vendor.storeName}
                                                    {user.vendor.approved === false && (
                                                        <span className="ml-2 text-amber-400">(pending)</span>
                                                    )}
                                                </p>
                                            )}
                                        </td>
                                        <td>
                                            <p className="text-slate-400 text-sm break-all">{user.email}</p>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${ROLE_STYLES[user.role]}`}>
                                                {formatRole(user.role)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="font-display text-lg text-white tabular-nums">
                                                {user._count?.orders ?? 0}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-sm text-slate-500">
                                                {user.createdAt
                                                    ? new Date(user.createdAt).toLocaleDateString()
                                                    : '—'}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <div className="flex flex-wrap justify-end gap-2">
                                                {user.role !== 'ADMIN' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => makeAdmin(user.id, user.name)}
                                                        className="btn-sm-brand whitespace-nowrap"
                                                    >
                                                        Make admin
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => deleteUser(user.id, user.name)}
                                                    className="btn-sm-danger whitespace-nowrap"
                                                >
                                                    Delete
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
