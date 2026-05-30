import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SLIDES = [
    {
        title: 'Fresh groceries delivered to you',
        subtitle: 'Farm-fresh produce, dairy, and pantry staples from trusted local vendors.',
        cta: 'Shop now',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
        bg: 'from-market-100 via-market-50 to-white',
    },
    {
        title: 'Weekend deals on everyday essentials',
        subtitle: 'Save on snacks, beverages, and household favorites this week only.',
        cta: 'View deals',
        image: 'https://images.unsplash.com/photo-1606787366850-de633012b45c?w=800&q=80',
        bg: 'from-emerald-100 via-market-50 to-white',
    },
];

export default function MarketHero() {
    const [active, setActive] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setActive((i) => (i + 1) % SLIDES.length), 6000);
        return () => clearInterval(id);
    }, []);

    const slide = SLIDES[active];

    return (
        <section className={`market-card overflow-hidden bg-gradient-to-r ${slide.bg} relative min-h-[220px] sm:min-h-[260px]`}>
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8 relative z-10">
                <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-2 capitalize">
                        {slide.title}
                    </h1>
                    <p className="text-sm sm:text-base text-slate-600 max-w-md mb-5">{slide.subtitle}</p>
                    <Link to="/marketplace" className="market-btn-primary inline-flex px-6">
                        {slide.cta}
                    </Link>
                </div>
                <div className="w-full sm:w-48 md:w-56 flex-shrink-0">
                    <img
                        src={slide.image}
                        alt=""
                        className="w-full h-40 sm:h-44 object-cover rounded-2xl shadow-md"
                    />
                </div>
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {SLIDES.map((_, i) => (
                    <button
                        key={i}
                        type="button"
                        aria-label={`Slide ${i + 1}`}
                        onClick={() => setActive(i)}
                        className={`h-2 rounded-full transition-all ${
                            i === active ? 'w-6 bg-market-600' : 'w-2 bg-market-300'
                        }`}
                    />
                ))}
            </div>
        </section>
    );
}
