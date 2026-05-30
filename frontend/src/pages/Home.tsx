import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { Product } from '../types';
import MarketSidebar from '../components/market/MarketSidebar';
import MarketHero from '../components/market/MarketHero';
import CategoryStrip from '../components/market/CategoryStrip';
import MarketProductCard from '../components/market/MarketProductCard';
import MarketRightPanel from '../components/market/MarketRightPanel';
import TrustBar from '../components/market/TrustBar';
import toast from 'react-hot-toast';

export default function Home() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState('');

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = { page: 1, limit: 12 };
            if (categoryFilter) params.category = categoryFilter;
            const { data } = await api.get('/products', { params });
            setProducts(data.products ?? []);
        } catch {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [categoryFilter]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const topPicks = products.slice(0, 5);
    const bestSellers = [...products].sort((a, b) => (b.reviews?.length ?? 0) - (a.reviews?.length ?? 0));

    return (
        <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <div className="flex gap-4 lg:gap-5">
                <MarketSidebar activeCategory={categoryFilter} onCategorySelect={setCategoryFilter} />

                <div className="flex-1 min-w-0 space-y-5">
                    <MarketHero />
                    <CategoryStrip onSelect={(label) => setCategoryFilter(label)} />

                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900">Top picks for you</h2>
                            <Link
                                to="/marketplace"
                                className="text-sm font-semibold text-market-600 hover:text-market-700"
                            >
                                View all →
                            </Link>
                        </div>

                        {loading ? (
                            <div className="flex gap-4 overflow-hidden">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="market-card min-w-[160px] h-64 animate-pulse bg-slate-100" />
                                ))}
                            </div>
                        ) : topPicks.length === 0 ? (
                            <div className="market-card p-10 text-center">
                                <p className="text-slate-600 mb-4">No products listed yet. Check back soon!</p>
                                <Link to="/register" className="market-btn-primary">
                                    Become a vendor
                                </Link>
                            </div>
                        ) : (
                            <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:overflow-visible">
                                {topPicks.map((product) => (
                                    <MarketProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </section>

                    <TrustBar />
                </div>

                <MarketRightPanel bestSellers={bestSellers.length ? bestSellers : products} />
            </div>
        </div>
    );
}
