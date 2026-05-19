import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { Product } from '../../types';
import { formatRWF } from '../../utils/currency';

export default function MyProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products/vendor/mine');
            setProducts(data.products);
        } catch {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success('Product deleted');
            setProducts(p => p.filter(x => x.id !== id));
        } catch {
            toast.error('Failed to delete product');
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">

            {/* Header */}
            <div className="flex items-end justify-between mb-10">
                <div>
                    
                    <h1 className="font-display text-5xl text-white">
                        MY PRODUCTS<span className="text-gold-400">.</span>
                    </h1>
                </div>
                <Link to="/vendor/products/add" className="btn-primary">
                    + Add Product
                </Link>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="card animate-pulse">
                            <div className="aspect-video bg-[#1a1a1a] rounded mb-4" />
                            <div className="h-4 bg-[#1a1a1a] rounded w-3/4 mb-2" />
                            <div className="h-3 bg-[#1a1a1a] rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="font-display text-6xl text-[#1a1a1a] mb-4">EMPTY</div>
                    <p className="text-[#555] mb-8">You haven't listed any products yet.</p>
                    <Link to="/vendor/products/add" className="btn-primary">
                        List Your First Product →
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map(product => (
                        <div key={product.id} className="card group hover:border-[#2a2a2a] transition-all">

                            {/* Image */}
                            <div className="aspect-video bg-[#111] rounded-lg mb-4 overflow-hidden relative">
                                {product.images[0] ? (
                                    <img
                                        src={`http://localhost:5000${product.images[0]}`}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="font-mono text-[10px] text-[#333]">NO IMAGE</span>
                                    </div>
                                )}
                                {/* Stock badge */}
                                <span className={`absolute top-2 right-2 font-mono text-[9px] px-2 py-1 rounded ${product.stock > 10
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : product.stock > 0
                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    }`}>
                                    {product.stock > 0 ? `${product.stock} IN STOCK` : 'OUT OF STOCK'}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="label mb-1">{product.category}</div>
                            <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">{product.name}</h3>
                            <p className="text-[#555] text-xs line-clamp-2 mb-4">{product.description}</p>

                            {/* Tags */}
                            {product.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {product.tags.slice(0, 3).map(tag => (
                                        <span key={tag} className="font-mono text-[9px] bg-[#111] border border-[#1a1a1a] text-[#555] px-2 py-0.5 rounded">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Price + Actions */}
                            <div className="divider pt-4 flex items-center justify-between">
                                <span className="font-display text-2xl text-gold-400">
                                    {formatRWF(product.price)}
                                </span>
                                <div className="flex gap-2">
                                    <Link
                                        to={`/vendor/products/edit/${product.id}`}
                                        className="font-mono text-[10px] border border-[#2a2a2a] text-[#888] px-3 py-1.5 rounded hover:border-gold-400 hover:text-gold-400 transition-all"
                                    >
                                        EDIT
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(product.id, product.name)}
                                        className="font-mono text-[10px] border border-[#2a2a2a] text-[#888] px-3 py-1.5 rounded hover:border-red-500 hover:text-red-400 transition-all"
                                    >
                                        DELETE
                                    </button>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}