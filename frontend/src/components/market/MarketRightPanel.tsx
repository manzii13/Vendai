import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import MarketProductCard from './MarketProductCard';

interface Props {
    bestSellers: Product[];
}

export default function MarketRightPanel({ bestSellers }: Props) {
    return (
        <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0 space-y-4">
            <div className="market-card p-4 bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0 overflow-hidden relative">
                <p className="text-xs font-semibold uppercase tracking-wide opacity-90 mb-1">Weekend sale</p>
                <p className="text-xl font-bold mb-1">Up to 30% off</p>
                <p className="text-sm opacity-90 mb-3">On selected pantry items</p>
                <Link to="/marketplace" className="inline-block bg-white text-purple-700 text-xs font-bold px-4 py-2 rounded-lg hover:bg-purple-50">
                    Shop sale
                </Link>
            </div>

            <div className="market-card p-4 bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-100/80">
                <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1">Exclusive offer</p>
                <p className="text-lg font-bold text-slate-800 mb-1">Free delivery</p>
                <p className="text-xs text-slate-600">On your first order this month</p>
            </div>

            <div className="market-card p-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-slate-800">Best sellers</h2>
                    <Link to="/marketplace" className="text-xs font-semibold text-market-600 hover:text-market-700">
                        View all
                    </Link>
                </div>
                <div>
                    {bestSellers.length === 0 ? (
                        <p className="text-sm text-slate-500 py-4 text-center">No products yet</p>
                    ) : (
                        bestSellers.slice(0, 4).map((p) => (
                            <MarketProductCard key={p.id} product={p} compact />
                        ))
                    )}
                </div>
            </div>
        </aside>
    );
}
