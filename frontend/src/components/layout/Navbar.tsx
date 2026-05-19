import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import CartSidebar from '../ui/CartSidebar';

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
        >
            {children}
        </NavLink>
    );
}

export default function Navbar() {
    const { user, logout } = useAuthStore();
    const { count } = useCartStore();
    const navigate = useNavigate();
    const [cartOpen, setCartOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <>
            <nav className="glass-nav sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16 lg:h-[4.25rem]">
                        <Link
                            to="/"
                            className="font-display text-2xl font-bold text-white tracking-tight flex-shrink-0"
                        >
                            Vend<span className="text-brand-400">X</span>X
                        </Link>

                        <div className="hidden md:flex items-center gap-1">
                            {!user && <NavItem to="/marketplace">Marketplace</NavItem>}
                            {user?.role === 'CUSTOMER' && (
                                <>
                                    <NavItem to="/marketplace">Shop</NavItem>
                                    <NavItem to="/orders">Orders</NavItem>
                                </>
                            )}
                            {user?.role === 'VENDOR' && (
                                <>
                                    <NavItem to="/marketplace">Marketplace</NavItem>
                                    <NavItem to="/vendor/products">Products</NavItem>
                                    <NavItem to="/vendor/orders">Orders</NavItem>
                                    <NavItem to="/dashboard">Dashboard</NavItem>
                                </>
                            )}
                            {user?.role === 'ADMIN' && (
                                <>
                                    <NavItem to="/marketplace">Shop</NavItem>
                                    <NavItem to="/admin">Admin</NavItem>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                            {(user?.role === 'CUSTOMER' || !user) && (
                                <button
                                    type="button"
                                    onClick={() => setCartOpen(true)}
                                    className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-surface-800 border border-surface-600/60 hover:border-brand-400/40 transition-all group"
                                    aria-label="Open cart"
                                >
                                    <svg className="w-5 h-5 text-slate-400 group-hover:text-brand-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    {count() > 0 && (
                                        <span className="absolute -top-1 -right-1 min-w-[1.125rem] h-[1.125rem] bg-brand-400 text-surface-950 text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                                            {count()}
                                        </span>
                                    )}
                                </button>
                            )}

                            {user ? (
                                <>
                                    <span className="hidden sm:block text-sm text-slate-400 max-w-[120px] truncate">
                                        Hi, <span className="text-white font-medium">{user.name.split(' ')[0]}</span>
                                    </span>
                                    <button type="button" onClick={handleLogout} className="btn-outline text-xs px-4 py-2">
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="btn-ghost text-sm hidden sm:inline-flex">Sign in</Link>
                                    <Link to="/register" className="btn-primary text-xs px-4 py-2.5">Get started</Link>
                                </>
                            )}

                            <button
                                type="button"
                                className="md:hidden w-10 h-10 rounded-xl border border-surface-600/60 flex items-center justify-center text-slate-400"
                                onClick={() => setMobileOpen(!mobileOpen)}
                                aria-label="Menu"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {mobileOpen
                                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                                </svg>
                            </button>
                        </div>
                    </div>

                    {mobileOpen && (
                        <div className="md:hidden pb-4 flex flex-col gap-1 border-t border-surface-600/40 pt-3">
                            <NavItem to="/marketplace">Marketplace</NavItem>
                            {user?.role === 'CUSTOMER' && <NavItem to="/orders">My orders</NavItem>}
                            {user?.role === 'VENDOR' && (
                                <>
                                    <NavItem to="/dashboard">Dashboard</NavItem>
                                    <NavItem to="/vendor/products">My products</NavItem>
                                </>
                            )}
                            {user?.role === 'ADMIN' && <NavItem to="/admin">Admin panel</NavItem>}
                        </div>
                    )}
                </div>
            </nav>

            {(user?.role === 'CUSTOMER' || !user) && (
                <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
            )}
        </>
    );
}
