import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import api from '../../services/api';
import { IconOrders, IconOverview, IconUsers, IconVendors } from '../../components/admin/AdminNavIcons';

const links = [
    { to: '/admin', label: 'Overview', icon: IconOverview, end: true },
    { to: '/admin/vendors', label: 'Vendors', icon: IconVendors, badgeKey: 'pendingVendors' as const },
    { to: '/admin/users', label: 'Users', icon: IconUsers },
    { to: '/admin/orders', label: 'Orders', icon: IconOrders },
];

export default function AdminLayout() {
    const [pendingVendors, setPendingVendors] = useState(0);

    useEffect(() => {
        api.get('/admin/stats')
            .then(({ data }) => setPendingVendors(data?.stats?.pendingVendors ?? 0))
            .catch(() => setPendingVendors(0));
    }, []);

    return (
        <div className="flex min-h-[calc(100vh-4.25rem)] bg-surface-900/30">
            <aside className="admin-sidebar">
                <div className="p-6">
                    <p className="label mb-1">Administration</p>
                    <h2 className="font-display text-xl font-bold text-white mb-1">
                        Control panel
                    </h2>
                    <p className="text-xs text-slate-500 mb-6">Manage vendors, users, and orders</p>

                    <nav className="space-y-1">
                        {links.map(link => {
                            const Icon = link.icon;
                            return (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    end={link.end}
                                    className={({ isActive }) =>
                                        `admin-nav-item ${isActive ? 'admin-nav-item-active' : 'admin-nav-item-inactive'}`
                                    }
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0 opacity-90" />
                                    <span>{link.label}</span>
                                    {link.badgeKey === 'pendingVendors' && pendingVendors > 0 && (
                                        <span className="ml-auto text-[10px] font-bold bg-amber-500/20 text-amber-200 border border-amber-500/30 px-2 py-0.5 rounded-full min-w-[1.25rem] text-center">
                                            {pendingVendors}
                                        </span>
                                    )}
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            <main className="flex-1 min-w-0 overflow-x-auto bg-gradient-to-b from-surface-900/20 to-transparent">
                <Outlet />
            </main>
        </div>
    );
}
