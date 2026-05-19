import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="mt-auto border-t border-surface-600/40 bg-surface-950">
            <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
                <div className="md:col-span-2">
                    <Link to="/" className="font-display text-2xl font-bold text-white">
                        Vend<span className="text-brand-400">X</span>X
                    </Link>
                    <p className="mt-4 text-slate-400 text-sm leading-relaxed max-w-sm">
                        Rwanda&apos;s multi-vendor marketplace. Shop from trusted stores, sell with AI-powered tools, and checkout in one place.
                    </p>
                </div>
                <div>
                    <h4 className="label mb-4 text-slate-300">Shop</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li><Link to="/marketplace" className="hover:text-brand-400 transition-colors">All products</Link></li>
                        <li><Link to="/register" className="hover:text-brand-400 transition-colors">Become a vendor</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="label mb-4 text-slate-300">Account</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li><Link to="/login" className="hover:text-brand-400 transition-colors">Sign in</Link></li>
                        <li><Link to="/orders" className="hover:text-brand-400 transition-colors">My orders</Link></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-surface-600/30 py-6 text-center text-xs text-slate-500">
                © {new Date().getFullYear()} VendXX — Built for modern commerce
            </div>
        </footer>
    );
}
