import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import api from '../../services/api';

const links = [
    { to: '/admin', label: 'Overview', icon: '◎', end: true },
    { to: '/admin/vendors', label: 'Vendors', badgeKey: 'pendingVendors' as const },
    { to: '/admin/users', label: 'Users', },
    { to: '/admin/orders', label: 'Orders' },
];

export default function AdminLayout() {
    const [pendingVendors, setPendingVendors] = useState(0);

    useEffect(() => {
        api.get('/admin/stats')
            .then(({ data }) => setPendingVendors(data?.stats?.pendingVendors ?? 0))
            .catch(() => setPendingVendors(0));
    }, []);

    return (
        <div className="flex min-h-[calc(100vh-4.25rem)] bg-surface-900/50">
            <aside className="w-60 border-r border-surface-600/40 flex-shrink-0 sticky top-[4.25rem] h-[calc(100vh-4.25rem)] overflow-y-auto bg-surface-950/50">
                <div className="p-6">
                    <p className="label mb-1">Administration</p>
                    <h2 className="font-display text-xl font-bold text-white mb-6">
                        Control <span className="text-brand-400">panel</span>
                    </h2>

                    <nav className="space-y-1">
                        {links.map(link => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.end}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                        ? 'bg-brand-400/15 text-brand-400 border border-brand-400/25'
                                        : 'text-slate-400 hover:text-white hover:bg-surface-800/80'
                                    }`
                                }
                            >
                                <span>{link.icon}</span>
                                <span>{link.label}</span>
                                {link.badgeKey === 'pendingVendors' && pendingVendors > 0 && (
                                    <span className="ml-auto text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-md">
                                        {pendingVendors}
                                    </span>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </aside>

            <main className="flex-1 min-w-0 overflow-x-auto">
                <Outlet />
            </main>
        </div>
    );
}

