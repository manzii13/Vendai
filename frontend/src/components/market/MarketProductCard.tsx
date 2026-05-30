import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import type { Product } from '../../types';
import { formatRWF } from '../../utils/currency';
import { CartIcon } from './MarketIcons';
import { uploadUrl } from '../../utils/mediaUrl';

function avgRating(product: Product): { score: string; count: number } {
    const reviews = product.reviews ?? [];
    if (reviews.length === 0) return { score: '4.5', count: 0 };
    const sum = reviews.reduce((a, r) => a + r.rating, 0);
    return { score: (sum / reviews.length).toFixed(1), count: reviews.length };
}

interface Props {
    product: Product;
    compact?: boolean;
}

export default function MarketProductCard({ product, compact = false }: Props) {
    const { addItem } = useCartStore();
    const { user } = useAuthStore();
    const isVendorOrAdmin = user?.role === 'VENDOR' || user?.role === 'ADMIN';
    const { score, count } = avgRating(product);
    const imgSrc = product.images?.[0] ? uploadUrl(product.images[0]) : null;

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isVendorOrAdmin) {
            toast.error('Vendors cannot add to cart');
            return;
        }
        if (product.stock === 0) return;
        addItem(product);
        toast.success(`${product.name} added to cart`);
    };

    if (compact) {
        return (
            <div className="flex gap-3 items-center py-2.5 border-b border-slate-100 last:border-0">
                <Link to={`/product/${product.id}`} className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden">
                        {imgSrc ? (
                            <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">—</div>
                        )}
                    </div>
                </Link>
                <div className="flex-1 min-w-0">
                    <Link to={`/product/${product.id}`} className="text-sm font-semibold text-slate-800 hover:text-market-700 line-clamp-1">
                        {product.name}
                    </Link>
                    <p className="text-xs text-slate-500">{product.category}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm font-bold text-market-700">{formatRWF(product.price)}</span>
                        <span className="text-xs text-amber-600">★ {score}</span>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleAdd}
                    disabled={product.stock === 0 || isVendorOrAdmin}
                    className="w-9 h-9 rounded-lg bg-market-600 text-white flex items-center justify-center hover:bg-market-700 disabled:opacity-40 flex-shrink-0"
                    aria-label="Add to cart"
                >
                    <CartIcon className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <article className="market-card p-3 flex flex-col h-full min-w-[160px] max-w-[200px] flex-shrink-0 sm:min-w-0 sm:max-w-none">
            <Link to={`/product/${product.id}`} className="block">
                <div className="aspect-square rounded-xl bg-slate-50 overflow-hidden mb-3">
                    {imgSrc ? (
                        <img src={imgSrc} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No image</div>
                    )}
                </div>
                <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug mb-0.5">{product.name}</h3>
                <p className="text-xs text-slate-500 mb-1">{product.category}</p>
                <p className="text-base font-bold text-market-700 mb-1">{formatRWF(product.price)}</p>
                <p className="text-xs text-amber-600 mb-3">
                    ★ {score}
                    {count > 0 && <span className="text-slate-400"> ({count})</span>}
                </p>
            </Link>
            <button
                type="button"
                onClick={handleAdd}
                disabled={product.stock === 0 || isVendorOrAdmin}
                className="market-btn-outline w-full mt-auto text-xs py-2 disabled:opacity-40"
            >
                <CartIcon className="w-4 h-4" />
                Add to cart
            </button>
        </article>
    );
}
