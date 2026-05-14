import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import type { Product } from '../../types';
import { formatRWF } from '../../utils/currency';

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
        toast.success(`${product.name} added to cart!`);
    };

    return (
        <Link to={`/product/${product.id}`} className="group block">
            <div className="card hover:border-[#2a2a2a] transition-all duration-300 group-hover:-translate-y-1 h-full flex flex-col">

                {/* Image */}
                <div className="aspect-[4/3] bg-[#111] rounded-lg mb-4 overflow-hidden relative">
                    {product.images?.[0] ? (
                        <img
                            src={`http://localhost:5000${product.images[0]}`}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="font-mono text-[10px] text-[#222]">NO IMAGE</span>
                        </div>
                    )}

                    {/* Category badge */}
                    <span className="absolute top-3 left-3 font-mono text-[9px] bg-black/80 border border-[#2a2a2a] text-[#888] px-2 py-1 rounded">
                        {product.category?.toUpperCase()}
                    </span>

                    {/* Stock warning */}
                    {product.stock <= 5 && product.stock > 0 && (
                        <span className="absolute top-3 right-3 font-mono text-[9px] bg-amber-500/20 border border-amber-500/30 text-amber-400 px-2 py-1 rounded">
                            ONLY {product.stock} LEFT
                        </span>
                    )}
                    {product.stock === 0 && (
                        <span className="absolute top-3 right-3 font-mono text-[9px] bg-red-500/20 border border-red-500/30 text-red-400 px-2 py-1 rounded">
                            SOLD OUT
                        </span>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col">
                    <p className="label mb-1">{product.vendor?.storeName}</p>
                    <h3 className="text-white text-sm font-semibold line-clamp-2 mb-2 group-hover:text-gold-400 transition-colors">
                        {product.name}
                    </h3>
                    <p className="text-[#555] text-xs line-clamp-2 mb-3 flex-1">
                        {product.description}
                    </p>

                    {/* Tags */}
                    {product.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                            {product.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="font-mono text-[9px] bg-[#111] border border-[#1a1a1a] text-[#444] px-2 py-0.5 rounded">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Price + Add to cart */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#1a1a1a]">
                        <span className="font-display text-2xl text-gold-400">
                            {formatRWF(product.price)}
                        </span>
                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                            className={`font-mono text-[10px] px-3 py-2 rounded border transition-all ${product.stock === 0 || isVendorOrAdmin
                                    ? 'border-[#1a1a1a] text-[#333] cursor-not-allowed'
                                    : 'border-[#2a2a2a] text-[#888] hover:border-gold-400 hover:text-gold-400'
                                }`}
                        >
                            {product.stock === 0
                                ? 'SOLD OUT'
                                : isVendorOrAdmin
                                    ? 'SELLERS ONLY'
                                    : '+ ADD TO CART'}
                        </button>
                    </div>
                </div>

            </div>
        </Link>
    );
}