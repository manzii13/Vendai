import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import CartSidebar from '../ui/CartSidebar';
import { SearchIcon, CartIcon, HeartIcon } from '../market/MarketIcons';
import Logo from '../ui/Logo';

const SEARCH_CATEGORIES = ['All Categories', 'Groceries', 'Electronics', 'Fashion', 'Home', 'Beauty'];

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                    isActive ? 'text-market-700 bg-market-50' : 'text-slate-600 hover:text-market-700 hover:bg-slate-50'
                }`
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
    const [search, setSearch] = useState('');
    const [searchCategory, setSearchCategory] = useState('All Categories');
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
        navigate('/');
    };

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        const params = new URLSearchParams();
        if (search.trim()) params.set('search', search.trim());
        if (searchCategory !== 'All Categories') params.set('category', searchCategory);
        navigate(`/marketplace${params.toString() ? `?${params}` : ''}`);
    };

    const displayName = user?.name?.split(' ')[0] ?? 'Guest';
    const cartCount = count();
    const wishlistCount = 0;

    return (
        <>
            <header className="market-nav">
                <div className="max-w-[1600px] mx-auto px-3 sm:px-4">
                    <div className="flex items-center gap-3 sm:gap-4 h-16 lg:h-[4.5rem]">
                        <Logo className="h-8 sm:h-9 w-auto max-w-[140px] sm:max-w-[160px]" />

                        <form
                            onSubmit={handleSearch}
                            className="hidden md:flex flex-1 max-w-2xl mx-auto items-stretch"
                        >
                            <div className="flex flex-1 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-market-500/20 focus-within:border-market-500">
                                <select
                                    value={searchCategory}
                                    onChange={(e) => setSearchCategory(e.target.value)}
                                    className="bg-white border-r border-slate-200 text-xs sm:text-sm text-slate-700 px-3 py-2.5 max-w-[130px] focus:outline-none cursor-pointer"
                                    aria-label="Category"
                                >
                                    {SEARCH_CATEGORIES.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search products, brands..."
                                    className="flex-1 bg-transparent px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none min-w-0"
                                />
                                <button
                                    type="submit"
                                    className="bg-market-600 text-white px-4 flex items-center justify-center hover:bg-market-700 transition-colors"
                                    aria-label="Search"
                                >
                                    <SearchIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </form>

                        <div className="flex items-center gap-1 sm:gap-2 ml-auto">
                            <button
                                type="button"
                                className="relative w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                                aria-label="Wishlist"
                            >
                                <HeartIcon />
                                {wishlistCount > 0 && <span className="market-badge">{wishlistCount}</span>}
                            </button>

                            {(user?.role === 'CUSTOMER' || !user) && (
                                <button
                                    type="button"
                                    onClick={() => setCartOpen(true)}
                                    className="relative w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                                    aria-label="Open cart"
                                >
                                    <CartIcon />
                                    {cartCount > 0 && <span className="market-badge">{cartCount}</span>}
                                </button>
                            )}

                            <div className="relative hidden sm:block">
                                {user ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                                            className="flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                                        >
                                            <span className="w-8 h-8 rounded-full bg-market-100 text-market-700 flex items-center justify-center text-sm font-bold">
                                                {displayName.charAt(0).toUpperCase()}
                                            </span>
                                            <span className="text-sm text-slate-700">
                                                Hi, <span className="font-semibold text-slate-900">{displayName}</span>
                                            </span>
                                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        {userMenuOpen && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="fixed inset-0 z-40"
                                                    aria-label="Close menu"
                                                    onClick={() => setUserMenuOpen(false)}
                                                />
                                                <div className="absolute right-0 top-full mt-2 w-48 market-card py-2 z-50 shadow-lg">
                                                    {user.role === 'CUSTOMER' && (
                                                        <Link to="/orders" className="block px-4 py-2 text-sm text-slate-700 hover:bg-market-50" onClick={() => setUserMenuOpen(false)}>
                                                            My orders
                                                        </Link>
                                                    )}
                                                    {user.role === 'VENDOR' && (
                                                        <>
                                                            <Link to="/dashboard" className="block px-4 py-2 text-sm text-slate-700 hover:bg-market-50" onClick={() => setUserMenuOpen(false)}>Dashboard</Link>
                                                            <Link to="/vendor/products" className="block px-4 py-2 text-sm text-slate-700 hover:bg-market-50" onClick={() => setUserMenuOpen(false)}>My products</Link>
                                                        </>
                                                    )}
                                                    {user.role === 'ADMIN' && (
                                                        <Link to="/admin" className="block px-4 py-2 text-sm text-slate-700 hover:bg-market-50" onClick={() => setUserMenuOpen(false)}>Admin</Link>
                                                    )}
                                                    <button type="button" onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                                        Logout
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-market-700 px-3 py-2">
                                            Sign in
                                        </Link>
                                        <Link to="/register" className="market-btn-primary text-xs px-4 py-2">
                                            Get started
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                className="md:hidden w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600"
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

                    <form onSubmit={handleSearch} className="md:hidden pb-3">
                        <div className="flex rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search products..."
                                className="flex-1 px-4 py-2.5 text-sm bg-transparent focus:outline-none"
                            />
                            <button type="submit" className="bg-market-600 text-white px-4">
                                <SearchIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </form>

                    {mobileOpen && (
                        <div className="md:hidden pb-4 flex flex-col gap-1 border-t border-slate-100 pt-3">
                            <NavItem to="/">Home</NavItem>
                            <NavItem to="/marketplace">Marketplace</NavItem>
                            {user?.role === 'CUSTOMER' && <NavItem to="/orders">My orders</NavItem>}
                            {user?.role === 'VENDOR' && (
                                <>
                                    <NavItem to="/dashboard">Dashboard</NavItem>
                                    <NavItem to="/vendor/products">My products</NavItem>
                                </>
                            )}
                            {user?.role === 'ADMIN' && <NavItem to="/admin">Admin</NavItem>}
                            {!user && (
                                <div className="flex gap-2 pt-2 sm:hidden">
                                    <Link to="/login" className="flex-1 text-center py-2 border border-slate-200 rounded-xl text-sm font-medium">Sign in</Link>
                                    <Link to="/register" className="flex-1 market-btn-primary text-center text-sm py-2">Register</Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {(user?.role === 'CUSTOMER' || !user) && (
                <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
            )}
        </>
    );
}
