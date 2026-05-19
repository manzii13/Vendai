import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { formatRWF } from '../../utils/currency';
import type { Product } from '../../types';

export default function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImg, setActiveImg] = useState(0);
    const [qty, setQty] = useState(1);
    const { addItem, items } = useCartStore();
    const { user } = useAuthStore();

    const inCart = items.find(i => i.product.id === id);
    const isVendorOrAdmin = user?.role === 'VENDOR' || user?.role === 'ADMIN';

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await api.get(`/products/${id}`);
                setProduct(data.product);
            } catch {
                toast.error('Product not found');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        if (isVendorOrAdmin) {
            toast.error('Vendors cannot purchase products');
            return;
        }
        for (let i = 0; i < qty; i++) addItem(product);
        toast.success(`${qty}x ${product.name} added to cart!`);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!product) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="font-display text-5xl text-[#1a1a1a] mb-4">404</div>
            <p className="text-[#555] mb-6">Product not found</p>
            <Link to="/marketplace" className="btn-primary">Back to Marketplace</Link>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-10">
                <Link to="/marketplace" className="label hover:text-gold-400 transition-colors">MARKETPLACE</Link>
                <span className="text-[#333]">/</span>
                <span className="label text-[#444]">{product.category?.toUpperCase()}</span>
                <span className="text-[#333]">/</span>
                <span className="label text-[#666] line-clamp-1">{product.name.toUpperCase()}</span>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">

                {/* Images */}
                <div className="space-y-4">
                    <div className="aspect-square bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl overflow-hidden">
                        {product.images?.[activeImg] ? (
                            <img
                                src={`http://localhost:5000${product.images[activeImg]}`}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="font-mono text-[10px] text-[#222]">NO IMAGE</span>
                            </div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {product.images?.length > 1 && (
                        <div className="flex gap-3">
                            {product.images.map((img: string, i: number) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImg(i)}
                                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${activeImg === i ? 'border-gold-400' : 'border-[#1a1a1a] hover:border-[#333]'
                                        }`}
                                >
                                    <img src={`http://localhost:5000${img}`} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="space-y-6">

                    {/* Category + Store */}
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] bg-[#111] border border-[#1a1a1a] text-[#555] px-3 py-1 rounded">
                            {product.category?.toUpperCase()}
                        </span>
                        <Link
                            to={`/vendors/${product.vendor?.id}`}
                            className="font-mono text-[10px] text-gold-400 hover:text-gold-500 transition-colors"
                        >
                            {product.vendor?.storeName?.toUpperCase()} ↗
                        </Link>
                    </div>

                    <h1 className="font-display text-5xl text-white leading-tight">{product.name}</h1>

                    <div className="font-display text-5xl text-gold-400">{formatRWF(product.price)}</div>

                    <p className="text-[#777] leading-relaxed">{product.description}</p>

                    {/* Tags */}
                    {product.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {product.tags.map((tag: string) => (
                                <span key={tag} className="font-mono text-[10px] bg-[#111] border border-[#1a1a1a] text-[#555] px-3 py-1.5 rounded">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="divider" />

                    {/* Stock */}
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        <span className="font-mono text-xs text-[#666]">
                            {product.stock > 0 ? `${product.stock} IN STOCK` : 'OUT OF STOCK'}
                        </span>
                    </div>

                    {/* Add to Cart Section */}
                    {product.stock > 0 && (
                        <div className="space-y-4">
                            {isVendorOrAdmin ? (
                                /* ✅ Vendor/Admin — blocked message */
                                <div className="p-4 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg text-center">
                                    <p className="font-mono text-[11px] text-[#444]">
                                        {user?.role === 'VENDOR'
                                            ? '// YOU ARE A VENDOR — SWITCH TO A CUSTOMER ACCOUNT TO PURCHASE'
                                            : '// ADMINS CANNOT PURCHASE PRODUCTS'}
                                    </p>
                                </div>
                            ) : (
                                /* ✅ Customer/Guest — show cart controls */
                                <>
                                    <div>
                                        <div className="label mb-2">QUANTITY</div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setQty(q => Math.max(1, q - 1))}
                                                className="w-10 h-10 border border-[#2a2a2a] text-[#888] rounded flex items-center justify-center hover:border-gold-400 hover:text-gold-400 transition-all"
                                            >−</button>
                                            <span className="font-display text-2xl text-white w-8 text-center">{qty}</span>
                                            <button
                                                onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                                                className="w-10 h-10 border border-[#2a2a2a] text-[#888] rounded flex items-center justify-center hover:border-gold-400 hover:text-gold-400 transition-all"
                                            >+</button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleAddToCart}
                                        className="btn-primary w-full py-4 text-base"
                                    >
                                        {inCart
                                            ? `+ Add More to Cart (${inCart.quantity} in cart)`
                                            : 'Add to Cart →'}
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Vendor Info Card */}
                    <div className="card">
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-semibold">{product.vendor?.storeName}</p>
                                {product.vendor?.description && (
                                    <p className="text-[#555] text-xs mt-1 line-clamp-2">{product.vendor.description}</p>
                                )}
                            </div>
                            <Link
                                to={`/vendors/${product.vendor?.id}`}
                                className="font-mono text-[10px] border border-[#2a2a2a] text-[#888] px-3 py-2 rounded hover:border-gold-400 hover:text-gold-400 transition-all"
                            >
                                VIEW STORE ↗
                            </Link>
                        </div>
                    </div>

                </div>
            </div>

            {/* Reviews */}
            {(product.reviews?.length ?? 0) > 0 && (
                <div className="mt-16">
                    <div className="label mb-6">CUSTOMER REVIEWS ({product.reviews?.length ?? 0})</div>
                    <div className="grid md:grid-cols-2 gap-4">
                        {(product.reviews ?? []).map((review: NonNullable<Product['reviews']>[number]) => (
                            <div key={review.id} className="card">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-white text-sm font-semibold">{review.user?.name}</span>
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={i < review.rating ? 'text-gold-400' : 'text-[#333]'}>★</span>
                                        ))}
                                    </div>
                                </div>
                                {review.comment && <p className="text-[#666] text-sm">{review.comment}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}