import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import type { Product } from '../../types';
import { formatRWF } from '../../utils/currency';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

interface Props { product: Product; }

export default function ProductCard({ product }: Props) {
    const { addItem } = useCartStore();
    const { user } = useAuthStore();
    const isVendorOrAdmin = user?.role === 'VENDOR' || user?.role === 'ADMIN';

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isVendorOrAdmin) {
            toast.error('Vendors cannot add to cart');
            return;
        }
        addItem(product);
        toast.success(`${product.name} added to cart`);
    };

    return (
        <Link to={`/product/${product.id}`} className="group block h-full">
            <article className="card-interactive h-full flex flex-col overflow-hidden p-0">
                <div className="aspect-[4/3] bg-surface-900 overflow-hidden relative">
                    {product.images?.[0] ? (
                        <img
                            src={`${API_BASE}${product.images[0]}`}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-surface-700/30">
                            <span className="text-slate-600 text-xs font-medium">No image</span>
                        </div>
                    )}
                    <span className="absolute top-3 left-3 badge-muted backdrop-blur-md">
                        {product.category}
                    </span>
                    {product.stock <= 5 && product.stock > 0 && (
                        <span className="absolute top-3 right-3 badge bg-amber-500/20 text-amber-300 border-amber-500/30">
                            Only {product.stock} left
                        </span>
                    )}
                    {product.stock === 0 && (
                        <span className="absolute top-3 right-3 badge bg-red-500/20 text-red-300 border-red-500/30">
                            Sold out
                        </span>
                    )}
                </div>

                <div className="p-4 flex-1 flex flex-col">
                    <p className="text-xs font-medium text-brand-400/90 mb-1 truncate">
                        {product.vendor?.storeName}
                    </p>
                    <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 mb-2 group-hover:text-brand-300 transition-colors">
                        {product.name}
                    </h3>
                    <p className="text-slate-500 text-xs line-clamp-2 mb-3 flex-1">
                        {product.description}
                    </p>

                    {product.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {product.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-surface-700/80 text-slate-500">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-surface-600/40">
                        <span className="font-display text-xl font-bold text-brand-400">
                            {formatRWF(product.price)}
                        </span>
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={product.stock === 0 || isVendorOrAdmin}
                            className={`text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
                                product.stock === 0 || isVendorOrAdmin
                                    ? 'bg-surface-700 text-slate-600 cursor-not-allowed'
                                    : 'bg-brand-400/15 text-brand-400 border border-brand-400/30 hover:bg-brand-400 hover:text-surface-950'
                            }`}
                        >
                            {product.stock === 0 ? 'Sold out' : isVendorOrAdmin ? '—' : 'Add'}
                        </button>
                    </div>
                </div>
            </article>
        </Link>
    );
}

