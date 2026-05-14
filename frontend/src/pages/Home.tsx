import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="min-h-screen">

            {/* Hero */}
            <section className="relative min-h-[90vh] flex items-center">

                {/* Background Image */}
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: 'url(/hero-bg0.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}
                />

                {/* Dark overlay so text stays readable */}
                <div className="absolute inset-0 z-10 bg-gradient-to-r from-black via-black/50 to-black/20" />

                {/* Content */}
                <div className="relative z-20 max-w-7xl mx-auto px-6 py-24">
                    <div className="inline-flex items-center gap-2 bg-[#111]/80 border border-[#222] rounded-full px-4 py-2 mb-10">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
                        <span className="font-mono text-[10px] text-gold-400 tracking-widest">
                            WELCOME TO VENDXX..
                        </span>
                    </div>

                    <h1 className="font-display text-[clamp(4rem,10vw,9rem)] leading-none text-white mb-8">
                        SMARTER<br />SHOPPING <span className="text-gold-400">STARTS</span><br />HERE
                    </h1>

                    <p className="text-[#aaa] text-lg max-w-lg leading-relaxed mb-10">
                        Explore, discover, and shop smarter with a new kind of marketplace built for the future.
                    </p>

                    <div className="flex gap-4 flex-wrap">
                        <Link to="/marketplace" className="btn-primary text-base px-8 py-4">
                            Explore Marketplace →
                        </Link>
                        <Link to="/register" className="btn-outline text-base px-8 py-4">
                            Start Your Store
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <div className="border-t border-b border-[#1a1a1a]">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4">
                    {[['2,400+', 'Active Vendors'], ['98K', 'Products Listed'], ['99.9%', 'Uptime'], ['AI', 'Powered Search']].map(([n, l], i) => (
                        <div key={l} className={`py-8 px-6 ${i < 3 ? 'border-r border-[#1a1a1a]' : ''}`}>
                            <div className="font-display text-4xl text-gold-400">{n}</div>
                            <div className="label mt-1">{l}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features */}
            <section className="max-w-7xl mx-auto px-6 py-24">
                <div className="label mb-4"></div>
                <h2 className="section-title mb-16">WHY VENDXX<span className="text-gold-400">?</span></h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        { tag: '01', title: 'AI Product Search', desc: 'Smart search that understands natural language. Find exactly what you need across all vendors.' },
                        { tag: '02', title: 'Vendor Analytics', desc: 'Real-time sales data, AI-powered insights, and revenue tracking for every vendor.' },
                        { tag: '03', title: 'Multi-Vendor Cart', desc: 'Shop from multiple vendors in one cart. Seamless checkout with unified order tracking.' },
                    ].map(f => (
                        <div key={f.tag} className="card group hover:border-[#2a2a2a] transition-colors">
                            <div className="label text-gold-400 mb-4">{f.tag}</div>
                            <h3 className="text-white font-semibold text-lg mb-3">{f.title}</h3>
                            <p className="text-[#555] text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}