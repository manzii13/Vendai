import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Logo from '../../components/ui/Logo';

const roles = [
    { value: 'CUSTOMER', label: 'Customer', desc: 'Browse and buy products' },
    { value: 'VENDOR', label: 'Vendor', desc: 'Sell your products' },
];

const VENDOR_FEATURES = [
    'AI product descriptions',
    'Smart pricing suggestions',
    'Sales analytics',
    'Customer insights',
];

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CUSTOMER' });
    const { register, loading, error, user, clearError } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.role === 'VENDOR') navigate('/dashboard');
            else navigate('/marketplace');
        }
    }, [user, navigate]);

    useEffect(() => { clearError(); }, [clearError]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await register(form.name, form.email, form.password, form.role);
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
                        Join the marketplace
                    </span>
                    <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
                        Start selling
                        <span className="block text-market-400">today</span>
                    </h1>
                    <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
                        Join vendors using tools to list products, track orders, and grow your business.
                    </p>
                </div>

                <div className="relative z-20 market-card bg-white/95 p-4">
                    {VENDOR_FEATURES.map((f) => (
                        <div key={f} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-market-600 flex-shrink-0" />
                            <span className="text-sm text-slate-700">{f}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
                <div className="w-full max-w-md market-card p-6 sm:p-8">
                    <div className="lg:hidden mb-6">
                        <Logo className="h-9 w-auto max-w-[160px]" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Create account</h2>
                    <p className="text-slate-600 text-sm mb-6">Choose how you want to use VendXX</p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {roles.map((r) => (
                            <button
                                key={r.value}
                                type="button"
                                onClick={() => setForm((f) => ({ ...f, role: r.value }))}
                                className={`p-4 rounded-xl border text-left transition-all ${
                                    form.role === r.value
                                        ? 'border-market-600 bg-market-50 shadow-sm'
                                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                                }`}
                            >
                                <div className={`text-sm font-semibold mb-1 ${form.role === r.value ? 'text-market-800' : 'text-slate-800'}`}>
                                    {r.label}
                                </div>
                                <div className="text-xs text-slate-500">{r.desc}</div>
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Full name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                className="market-input"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Email address</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                className="market-input"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Password</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                                className="market-input"
                                placeholder="Min. 8 characters"
                                minLength={8}
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading} className="market-btn-primary w-full mt-2 py-3">
                            {loading ? 'Creating account...' : `Create ${form.role === 'VENDOR' ? 'vendor' : 'customer'} account`}
                        </button>
                    </form>

                    <p className="text-center text-slate-600 text-sm mt-6 pt-6 border-t border-slate-200">
                        Already have an account?{' '}
                        <Link to="/login" className="text-market-700 hover:text-market-800 font-semibold">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
