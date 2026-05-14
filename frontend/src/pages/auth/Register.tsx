import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const roles = [
    { value: 'CUSTOMER', label: 'Customer', desc: 'Browse & buy products' },
    { value: 'VENDOR', label: 'Vendor', desc: 'Sell your products' },
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
        <div className="min-h-screen flex">

            {/* Left Panel */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 border-r border-[#1a1a1a] relative overflow-hidden">

                {/* Background Image */}
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: 'url(/hero-bg2.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />

                {/* Logo */}
                <div className="relative z-20 font-display text-3xl tracking-widest text-white">
                    VEND<span className="text-gold-400">X</span>X
                </div>

                <div className="relative z-20">
                    
                    <h1 className="font-display text-7xl text-white leading-none mb-6">
                        START<br />SELLING<br />TODAY<span className="text-gold-400">.</span>
                    </h1>
                    <p className="text-[#aaa] text-sm leading-relaxed max-w-sm">
                        Join thousands of vendors using AI-powered tools to grow their business.
                    </p>
                </div>

                <div className="relative z-20 card bg-black/40 backdrop-blur-sm">

                    {['AI Product Descriptions', 'Smart Pricing Suggestions', 'Sales Analytics', 'Customer Insights'].map(f => (
                        <div key={f} className="flex items-center gap-2 py-2 border-b border-[#ffffff10] last:border-0">
                            <span className="text-gold-400 text-xs">✦</span>
                            <span className="text-sm text-[#aaa]">{f}</span>
                        </div>
                    ))}
                </div>

            </div>

            {/* Right Panel */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">

                    <h2 className="font-display text-4xl text-white mb-8">JOIN VENDXX</h2>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded text-sm mb-6">
                            {error}
                        </div>
                    )}

                    {/* Role Selector */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {roles.map(r => (
                            <button
                                key={r.value}
                                type="button"
                                onClick={() => setForm(f => ({ ...f, role: r.value }))}
                                className={`p-4 rounded border text-left transition-all ${form.role === r.value
                                    ? 'border-gold-400 bg-gold-400/5'
                                    : 'border-[#1a1a1a] hover:border-[#333]'
                                    }`}
                            >
                                <div className={`text-sm font-semibold mb-1 ${form.role === r.value ? 'text-gold-400' : 'text-white'}`}>
                                    {r.label}
                                </div>
                                <div className="text-xs text-[#555]">{r.desc}</div>
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="label mb-2 block">Full Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                className="input-field"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div>
                            <label className="label mb-2 block">Email Address</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                className="input-field"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="label mb-2 block">Password</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                className="input-field"
                                placeholder="Min. 8 characters"
                                minLength={8}
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                            {loading ? 'Creating account...' : `Create ${form.role === 'VENDOR' ? 'Vendor' : 'Customer'} Account →`}
                        </button>
                    </form>

                    <div className="divider my-6" />

                    <p className="text-center text-[#555] text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-gold-400 hover:text-gold-500">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}