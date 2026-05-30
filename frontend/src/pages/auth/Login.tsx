import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Logo from '../../components/ui/Logo';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error, user, clearError } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.role === 'VENDOR') navigate('/dashboard');
            else if (user.role === 'ADMIN') navigate('/admin');
            else navigate('/marketplace');
        }
    }, [user, navigate]);

    useEffect(() => { clearError(); }, [clearError]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(email, password);
    };

    return (
        <div className="min-h-screen flex bg-page">
            <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 border-r border-slate-300/60 relative overflow-hidden bg-slate-800">
                <div
                    className="absolute inset-0 z-0 opacity-40"
                    style={{
                        backgroundImage: 'url(/hero-bg2.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <div className="absolute inset-0 z-10 bg-gradient-to-b from-slate-900/80 via-slate-900/70 to-slate-900/90" />

                <div className="relative z-20">
                    <Logo className="h-10 w-auto max-w-[180px]" />
                </div>

                <div className="relative z-20">
                    <span className="inline-block text-xs font-semibold text-market-300 bg-market-900/40 border border-market-600/30 rounded-full px-3 py-1 mb-4">
                        Vendor and customer portal
                    </span>
                    <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
                        Your store
                        <span className="block text-market-400">starts here</span>
                    </h1>
                    <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
                        Sign in to manage your store, track orders, and access insights for your business.
                    </p>
                </div>

                <div className="relative z-20 flex gap-8">
                    {[['2,400+', 'Active vendors'], ['98K', 'Products'], ['99.9%', 'Uptime']].map(([n, l]) => (
                        <div key={l}>
                            <div className="text-2xl font-bold text-market-400">{n}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wide">{l}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
                <div className="w-full max-w-md market-card p-6 sm:p-8">
                    <div className="lg:hidden mb-6">
                        <Logo className="h-9 w-auto max-w-[160px]" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
                    <p className="text-slate-600 text-sm mb-6">Sign in to shop or manage your store</p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Email address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="market-input"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="market-input"
                                placeholder="Your password"
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading} className="market-btn-primary w-full mt-2 py-3">
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <p className="text-center text-slate-600 text-sm mt-6 pt-6 border-t border-slate-200">
                        Don&apos;t have an account?{' '}
                        <Link to="/register" className="text-market-700 hover:text-market-800 font-semibold">Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
