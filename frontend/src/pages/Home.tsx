import { Link } from 'react-router-dom';

const STATS = [
    { value: '2,400+', label: 'Active vendors' },
    { value: '98K', label: 'Products listed' },
    { value: '99.9%', label: 'Platform uptime' },
    { value: 'AI', label: 'Smart search' },
];

const FEATURES = [
    {
        icon: '✦',
        title: 'AI product search',
        desc: 'Describe what you need in plain language and find the right products across every store.',
    },
    {
        icon: '📊',
        title: 'Vendor analytics',
        desc: 'Real-time sales, stock insights, and AI recommendations to grow your business.',
    },
    {
        icon: '🛒',
        title: 'Unified checkout',
        desc: 'Shop from multiple vendors in one cart with simple order tracking in RWF.',
    },
];

const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Groceries'];

export default function Home() {
    return (
        <div>
            <section className="relative min-h-[88vh] flex items-center overflow-hidden">
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: 'url(/hero-bg0.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <div className="absolute inset-0 z-10 bg-gradient-to-r from-surface-950 via-surface-950/85 to-surface-950/40" />
                <div className="absolute inset-0 z-10 bg-mesh opacity-80" />

                <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-28 w-full">
                    <span className="badge-brand mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse mr-2 inline-block" />
                        Rwanda&apos;s multi-vendor marketplace
                    </span>

                    <h1 className="font-display text-[clamp(2.75rem,8vw,5.5rem)] font-extrabold leading-[1.05] text-white max-w-3xl mb-6">
                        Shop smarter.
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-500">
                            Sell faster.
                        </span>
                    </h1>

                    <p className="text-slate-300 text-lg max-w-xl leading-relaxed mb-10">
                        Discover products from trusted local vendors, manage your store with AI tools, and checkout securely — all in one place.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <Link to="/marketplace" className="btn-primary text-base px-8 py-4">
                            Browse marketplace
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                        <Link to="/register" className="btn-outline text-base px-8 py-4">
                            Open your store
                        </Link>
                    </div>
                </div>
            </section>

            <section className="border-y border-surface-600/40 bg-surface-950/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4 divide-x divide-surface-600/30">
                    {STATS.map((s) => (
                        <div key={s.label} className="stat-pill">
                            <div className="font-display text-3xl md:text-4xl font-bold text-brand-400">{s.value}</div>
                            <div className="text-sm text-slate-500 mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
                <p className="label mb-3">Popular categories</p>
                <div className="flex flex-wrap gap-3">
                    {CATEGORIES.map((cat) => (
                        <Link
                            key={cat}
                            to="/marketplace"
                            className="px-5 py-2.5 rounded-full bg-surface-800 border border-surface-600/50 text-sm font-medium text-slate-300 hover:border-brand-400/40 hover:text-brand-400 transition-all"
                        >
                            {cat}
                        </Link>
                    ))}
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
                <div className="text-center max-w-2xl mx-auto mb-14">
                    <p className="label mb-3">Why VendXX</p>
                    <h2 className="section-title">Built for modern commerce</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {FEATURES.map((f) => (
                        <div key={f.title} className="card-interactive group">
                            <div className="w-12 h-12 rounded-2xl bg-brand-400/10 border border-brand-400/20 flex items-center justify-center text-xl mb-5 group-hover:shadow-glow transition-shadow">
                                {f.icon}
                            </div>
                            <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
                <div className="relative overflow-hidden rounded-3xl border border-brand-400/20 bg-gradient-to-br from-surface-800 to-surface-900 p-10 md:p-14 text-center shadow-glow">
                    <div className="absolute inset-0 bg-mesh opacity-50" />
                    <div className="relative z-10">
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                            Ready to start selling?
                        </h2>
                        <p className="text-slate-400 max-w-md mx-auto mb-8">
                            Join vendors across Rwanda. List products, get approved, and reach customers today.
                        </p>
                        <Link to="/register" className="btn-primary inline-flex">
                            Create vendor account
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
