import { NavLink, Outlet } from 'react-router-dom';

const links = [
    { to: '/admin', label: 'Overview', icon: '◎', end: true },
    { to: '/admin/vendors', label: 'Vendors', icon: '🏪' },
    { to: '/admin/users', label: 'Users', icon: '👤' },
    { to: '/admin/orders', label: 'Orders', icon: '📦' },
];

export default function AdminLayout() {
    return (
        <div className="flex min-h-screen">

            {/* Sidebar */}
            <aside className="w-56 border-r border-[#1a1a1a] flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
                <div className="p-6">
                    <div className="label mb-1">// ADMIN</div>
                    <div className="font-display text-xl text-white mb-6">
                        CONTROL PANEL<span className="text-gold-400">.</span>
                    </div>

                    <nav className="space-y-1">
                        {links.map(link => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.end}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all ${isActive
                                        ? 'bg-gold-400/10 text-gold-400 border border-gold-400/20'
                                        : 'text-[#666] hover:text-white hover:bg-[#111]'
                                    }`
                                }
                            >
                                <span>{link.icon}</span>
                                <span className="font-mono text-[11px] tracking-wider">{link.label.toUpperCase()}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden">
                <Outlet />
            </main>

        </div>
    );
}