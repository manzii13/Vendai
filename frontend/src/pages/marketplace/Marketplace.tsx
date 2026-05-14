import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import type { Product } from '../../types';
import ProductCard from '../../components/ui/ProductCard';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
    { label: 'Newest', value: 'newest' },
    { label: 'Price: Low', value: 'price_asc' },
    { label: 'Price: High', value: 'price_desc' },
];

export default function Marketplace() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [aiIntent, setAiIntent] = useState('');
    const [activeCategory, setActiveCategory] = useState('');
    const [sort, setSort] = useState('newest');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/products/categories');
            setCategories(data.categories);
        } catch (error) {
            console.error('Failed to load categories', error);
        }
    };

    const fetchProducts = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = { page, limit: 12 };
            if (activeCategory) params.category = activeCategory;
            if (search) params.search = search;
            if (priceRange.min) params.minPrice = priceRange.min;
            if (priceRange.max) params.maxPrice = priceRange.max;

            const { data } = await api.get('/products', { params });
            let prods = data.products;

            // Client-side sort
            if (sort === 'price_asc') prods = [...prods].sort((a, b) => a.price - b.price);
            if (sort === 'price_desc') prods = [...prods].sort((a, b) => b.price - a.price);

            setProducts(prods);
            setPagination(data.pagination);
        } catch {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [activeCategory, search, priceRange, sort]);

    useEffect(() => { fetchCategories(); }, []);
    useEffect(() => { fetchProducts(1); }, [fetchProducts]);

    // AI Smart Search
    const handleAISearch = async () => {
        if (!search.trim()) { fetchProducts(1); return; }
        setAiLoading(true);
        setAiIntent('');
        try {
            const { data } = await api.get('/products/ai/smart-search', { params: { q: search } });
            setProducts(data.products);
            setAiIntent(data.meta?.intent || '');
            setPagination({ total: data.products.length, page: 1, pages: 1 });
        } catch {
            toast.error('AI search failed, using regular search');
            fetchProducts(1);
        } finally {
            setAiLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleAISearch();
    };

    const clearFilters = () => {
        setSearch('');
        setActiveCategory('');
        setPriceRange({ min: '', max: '' });
        setSort('newest');
        setAiIntent('');
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">

            {/* Header */}
            <div className="mb-8">
                <div className="label mb-2">// MARKETPLACE</div>
                <div className="flex items-end justify-between flex-wrap gap-4">
                    <h1 className="font-display text-5xl text-white">
                        ALL PRODUCTS<span className="text-gold-400">.</span>
                    </h1>
                    <span className="label text-[#444]">{pagination.total} PRODUCTS FOUND</span>
                </div>
            </div>

            {/* AI Search Bar */}
            <div className="card mb-8">
                <div className="label mb-3">// AI SMART SEARCH</div>
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="input-field pr-10"
                            placeholder='Try: "affordable sneakers" or "electronics under $100"'
                        />
                        {search && (
                            <button
                                onClick={clearFilters}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-white text-sm"
                            >✕</button>
                        )}
                    </div>
                    <button
                        onClick={handleAISearch}
                        disabled={aiLoading}
                        className="flex items-center gap-2 bg-gold-400/10 border border-gold-400/30 text-gold-400 px-5 py-3 rounded text-sm font-semibold hover:bg-gold-400/20 transition-all disabled:opacity-50 whitespace-nowrap"
                    >
                        {aiLoading
                            ? <><span className="w-3 h-3 border border-gold-400 border-t-transparent rounded-full animate-spin" /> Searching...</>
                            : '✦ AI Search'
                        }
                    </button>
                    <button
                        onClick={() => fetchProducts(1)}
                        className="btn-outline px-5 py-3 text-sm"
                    >
                        Search
                    </button>
                </div>

                {/* AI Intent display */}
                {aiIntent && (
                    <div className="mt-3 flex items-center gap-2">
                        <span className="font-mono text-[10px] text-gold-400">AI UNDERSTOOD:</span>
                        <span className="text-[#888] text-xs italic">"{aiIntent}"</span>
                    </div>
                )}
            </div>

            <div className="flex gap-8">

                {/* Sidebar Filters */}
                <aside className="w-56 flex-shrink-0 space-y-6">

                    {/* Categories */}
                    <div>
                        <div className="label mb-3">// CATEGORIES</div>
                        <div className="space-y-1">
                            <button
                                onClick={() => setActiveCategory('')}
                                className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${activeCategory === ''
                                    ? 'bg-gold-400/10 text-gold-400 border border-gold-400/30'
                                    : 'text-[#666] hover:text-white'
                                    }`}
                            >
                                All Categories
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${activeCategory === cat
                                        ? 'bg-gold-400/10 text-gold-400 border border-gold-400/30'
                                        : 'text-[#666] hover:text-white'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div>
                        <div className="label mb-3">// PRICE RANGE</div>
                        <div className="space-y-2">
                            <input
                                type="number"
                                placeholder="Min $"
                                value={priceRange.min}
                                onChange={e => setPriceRange(p => ({ ...p, min: e.target.value }))}
                                className="input-field text-sm py-2"
                            />
                            <input
                                type="number"
                                placeholder="Max $"
                                value={priceRange.max}
                                onChange={e => setPriceRange(p => ({ ...p, max: e.target.value }))}
                                className="input-field text-sm py-2"
                            />
                        </div>
                    </div>

                    {/* Sort */}
                    <div>
                        <div className="label mb-3">// SORT BY</div>
                        <div className="space-y-1">
                            {SORT_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => setSort(opt.value)}
                                    className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${sort === opt.value
                                        ? 'bg-gold-400/10 text-gold-400 border border-gold-400/30'
                                        : 'text-[#666] hover:text-white'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Clear filters */}
                    <button onClick={clearFilters} className="w-full btn-outline text-xs py-2">
                        Clear All Filters
                    </button>

                </aside>

                {/* Product Grid */}
                <div className="flex-1">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(9)].map((_, i) => (
                                <div key={i} className="card animate-pulse">
                                    <div className="aspect-[4/3] bg-[#1a1a1a] rounded-lg mb-4" />
                                    <div className="h-3 bg-[#1a1a1a] rounded w-1/3 mb-2" />
                                    <div className="h-4 bg-[#1a1a1a] rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-[#1a1a1a] rounded w-full mb-4" />
                                    <div className="h-8 bg-[#1a1a1a] rounded" />
                                </div>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <div className="font-display text-6xl text-[#1a1a1a] mb-4">EMPTY</div>
                            <p className="text-[#555] mb-6">No products found matching your search.</p>
                            <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-10">
                                    {[...Array(pagination.pages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => fetchProducts(i + 1)}
                                            className={`w-9 h-9 rounded font-mono text-xs transition-all ${pagination.page === i + 1
                                                ? 'bg-gold-400 text-black font-bold'
                                                : 'border border-[#2a2a2a] text-[#666] hover:border-gold-400 hover:text-gold-400'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}