import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

type UserRole = 'CUSTOMER' | 'VENDOR' | 'ADMIN';

interface VendorInfo {
    storeName: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    vendor?: VendorInfo | null;
    _count?: { orders?: number } | null;
}

const ROLE_STYLES: Record<UserRole, string> = {
    CUSTOMER: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    VENDOR: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    ADMIN: 'bg-gold-400/10 border-gold-400/30 text-gold-400',
};

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await api.get('/admin/users');
                setUsers(data.users);
            } catch {
                toast.error('Failed to load users');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const makeAdmin = async (id: string, name: string) => {
        if (!confirm(`Make ${name} an admin?`)) return;
        try {
            await api.patch(`/admin/users/${id}/make-admin`);
            setUsers(u => u.map(x => x.id === id ? { ...x, role: 'ADMIN' } : x));
            toast.success(`${name} is now an admin`);
        } catch {
            toast.error('Failed');
        }
    };

    const deleteUser = async (id: string, name: string) => {
        if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(u => u.filter(x => x.id !== id));
            toast.success('User deleted');
        } catch {
            toast.error('Failed to delete user');
        }
    };

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8">
            <div className="mb-8">
                <div className="label mb-2">// ADMIN</div>
                <h1 className="font-display text-5xl text-white">
                    USERS<span className="text-gold-400">.</span>
                </h1>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="input-field max-w-sm"
                    placeholder="Search by name or email..."
                />
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => <div key={i} className="card animate-pulse h-16" />)}
                </div>
            ) : (
                <div className="card overflow-hidden p-0">
                    {/* Table Header */}
                    <div className="grid grid-cols-5 gap-4 px-5 py-3 border-b border-[#1a1a1a] bg-[#0a0a0a]">
                        {['USER', 'EMAIL', 'ROLE', 'ORDERS', 'ACTIONS'].map(h => (
                            <div key={h} className="label">{h}</div>
                        ))}
                    </div>

                    {/* Table Rows */}
                    <div className="divide-y divide-[#111]">
                        {filtered.map(user => (
                            <div key={user.id} className="grid grid-cols-5 gap-4 px-5 py-4 hover:bg-[#0a0a0a] transition-colors items-center">

                                <div>
                                    <p className="text-white text-sm font-medium">{user.name}</p>
                                    {user.vendor && (
                                        <p className="font-mono text-[9px] text-gold-400">{user.vendor.storeName}</p>
                                    )}
                                </div>

                                <p className="text-[#666] text-xs truncate">{user.email}</p>

                                <span className={`font-mono text-[9px] px-2 py-1 rounded border w-fit ${ROLE_STYLES[user.role]}`}>
                                    {user.role}
                                </span>

                                <span className="font-display text-lg text-white">
                                    {user._count?.orders || 0}
                                </span>

                                <div className="flex gap-2">
                                    {user.role !== 'ADMIN' && (
                                        <button
                                            onClick={() => makeAdmin(user.id, user.name)}
                                            className="font-mono text-[9px] border border-gold-400/30 text-gold-400 px-2 py-1 rounded hover:bg-gold-400/10 transition-all"
                                        >
                                            MAKE ADMIN
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteUser(user.id, user.name)}
                                        className="font-mono text-[9px] border border-red-500/30 text-red-400 px-2 py-1 rounded hover:bg-red-500/10 transition-all"
                                    >
                                        DELETE
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}