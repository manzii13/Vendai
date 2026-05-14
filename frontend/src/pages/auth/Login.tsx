import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

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
        <div className="min-h-screen flex">

            {/* Left Panel */}
            {/* Left Panel */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 border-r border-[#1a1a1a] relative overflow-hidden">

                {/* Background Image */}
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: 'url(/hero-bg2.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />

                {/* Content — must be z-20 to sit above overlay */}
                <div className="relative z-20 font-display text-3xl tracking-widest text-white">
                    VEND<span className="text-gold-400">X</span>X
                </div>

                <div className="relative z-20">

                    <h1 className="font-display text-7xl text-white leading-none mb-6">
                        YOUR<br />STORE<br />AWAITS<span className="text-gold-400">.</span>
                    </h1>
                    <p className="text-[#aaa] text-sm leading-relaxed max-w-sm">
                        Sign in to manage your store, track orders, and access AI-powered insights for your business.
                    </p>
                </div>

                <div className="relative z-20 flex gap-8">
                    {[['2,400+', 'Active Vendors'], ['98K', 'Products'], ['99.9%', 'Uptime']].map(([n, l]) => (
                        <div key={l}>
                            <div className="font-display text-2xl text-gold-400">{n}</div>
                            <div className="label">{l}</div>
                        </div>
                    ))}
                </div>

            </div>

            {/* Right Panel — Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="label mb-2"></div>
                    <h2 className="font-display text-4xl text-white mb-8">WELCOME BACK</h2>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded text-sm mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="label mb-2 block">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="input-field"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="label mb-2 block">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="input-field"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                            {loading ? 'Signing in...' : 'Sign In →'}
                        </button>
                    </form>

                    <div className="divider my-6" />

                    <p className="text-center text-[#555] text-sm">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-gold-400 hover:text-gold-500">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}