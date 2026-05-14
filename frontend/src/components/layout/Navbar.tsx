import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import CartSidebar from '../ui/CartSidebar';

export default function Navbar() {
    const { user, logout } = useAuthStore();
    const { count } = useCartStore();
    const navigate = useNavigate();
    const [cartOpen, setCartOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/'); };

    return (
        <>
            <nav className="border-b border-[#1a1a1a] bg-[#080808] sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link to="/" className="font-display text-2xl tracking-widest text-white flex-shrink-0">
                        VEND<span className="text-gold-400">x</span>X
                    </Link>

                    {/* Nav Links — different per role */}
                    <div className="hidden md:flex items-center gap-8">

                        {/* NO USER — public links only */}
                        {!user && (
                            <Link to="/marketplace" className="label hover:text-gold-400 transition-colors">Marketplace</Link>
                        )}

                        {/* CUSTOMER links */}
                        {user?.role === 'CUSTOMER' && (
                            <>
                                <Link to="/marketplace" className="label hover:text-gold-400 transition-colors">Marketplace</Link>
                                <Link to="/orders" className="label hover:text-gold-400 transition-colors">My Orders</Link>
                            </>
                        )}

                        {/* VENDOR links */}
                        {user?.role === 'VENDOR' && (
                            <>
                                <Link to="/marketplace" className="label hover:text-gold-400 transition-colors">Marketplace</Link>
                                <Link to="/vendor/products" className="label hover:text-gold-400 transition-colors">My Products</Link>
                                <Link to="/vendor/orders" className="label hover:text-gold-400 transition-colors">Orders</Link>
                                <Link to="/dashboard" className="label hover:text-gold-400 transition-colors">Dashboard</Link>
                            </>
                        )}

                        {/* ADMIN links */}
                        {user?.role === 'ADMIN' && (
                            <>
                                <Link to="/marketplace" className="label hover:text-gold-400 transition-colors">Marketplace</Link>
                                <Link to="/admin" className="label hover:text-gold-400 transition-colors">Admin Panel</Link>
                            </>
                        )}

                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-3">

                        {/* ✅ Cart — ONLY for customers and guests, hidden from vendors & admins */}
                        {(user?.role === 'CUSTOMER' || !user) && (
                            <button
                                onClick={() => setCartOpen(true)}
                                className="relative w-10 h-10 flex items-center justify-center border border-[#1a1a1a] rounded hover:border-gold-400 transition-all group"
                            >
                                <span className="text-[#888] group-hover:text-gold-400 transition-colors text-base">🛒</span>
                                {count() > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gold-400 text-black font-mono text-[9px] font-bold rounded-full flex items-center justify-center">
                                        {count()}
                                    </span>
                                )}
                            </button>
                        )}

                        {/* Auth buttons */}
                        {user ? (
                            <>
                                <span className="label text-[#555] hidden md:block">{user.name}</span>
                                <button onClick={handleLogout} className="btn-outline text-xs px-4 py-2">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn-ghost text-xs">Sign in</Link>
                                <Link to="/register" className="btn-primary text-xs px-4 py-2">Get Started</Link>
                            </>
                        )}

                    </div>

                </div>
            </nav>

            <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
        </>
    );
}