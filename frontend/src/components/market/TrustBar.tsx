import { TrustIcon } from './MarketIcons';

const TRUST_ITEMS = [
    { icon: 'shield' as const, title: '100% secure payment', desc: 'Encrypted checkout' },
    { icon: 'support' as const, title: '24/7 customer support', desc: 'We are here to help' },
    { icon: 'returns' as const, title: 'Easy returns', desc: 'Hassle-free policy' },
    { icon: 'delivery' as const, title: 'Fast delivery', desc: 'Same-day in Kigali' },
];

export default function TrustBar() {
    return (
        <section className="market-card mt-6 p-4 sm:p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {TRUST_ITEMS.map((item) => (
                    <div key={item.title} className="flex items-center gap-3">
                        <span className="w-12 h-12 rounded-2xl bg-market-50 text-market-700 flex items-center justify-center flex-shrink-0">
                            <TrustIcon name={item.icon} className="w-6 h-6" />
                        </span>
                        <div>
                            <p className="text-sm font-semibold text-slate-800 leading-tight">{item.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
