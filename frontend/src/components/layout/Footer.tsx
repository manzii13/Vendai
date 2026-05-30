import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';

export default function Footer() {
    return (
        <footer className="mt-auto border-t border-slate-200 bg-white">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
                <div className="md:col-span-2">
                    <Logo className="h-9 w-auto max-w-[160px]" />
                    <p className="mt-4 text-slate-500 text-sm leading-relaxed max-w-sm">
                        Rwanda&apos;s multi-vendor marketplace. Shop fresh groceries and everyday essentials from trusted local stores.
                    </p>
                </div>
                <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Shop</h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                        <li><Link to="/marketplace" className="hover:text-market-700 transition-colors">All products</Link></li>
                        <li><Link to="/register" className="hover:text-market-700 transition-colors">Become a vendor</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Account</h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                        <li><Link to="/login" className="hover:text-market-700 transition-colors">Sign in</Link></li>
                        <li><Link to="/orders" className="hover:text-market-700 transition-colors">My orders</Link></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
                © {new Date().getFullYear()} VendXX — Built for modern commerce
            </div>
        </footer>
    );
}
