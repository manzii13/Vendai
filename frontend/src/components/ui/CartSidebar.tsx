import { useCartStore } from '../../store/cartStore';
import { Link } from 'react-router-dom';
import { formatRWF } from '../../utils/currency';

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function CartSidebar({ open, onClose }: Props) {
    const { items, removeItem, updateQty, total, count } = useCartStore();

    return (
        <>
            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col transition-transform duration-300 ${open
                    ? 'translate-x-0 pointer-events-auto'
                    : 'translate-x-full pointer-events-none'
                    }`}
            >

                {/* Background Image with overlay */}
                <div className="absolute inset-0 z-0">
                    <div
                        style={{
                            backgroundImage: 'url(/hero-bg3.jpg)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                        }}
                        className="absolute inset-0"
                    />
                    {/* Dark overlay so content stays readable */}
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
                </div>

                {/* Border */}
                <div className="absolute inset-0 border-l border-surface-600/50 pointer-events-none z-10" />

                {/* Header */}
                <div className="relative z-20 flex items-center justify-between p-6 border-b border-[#ffffff08]">
                    <div>

                        <div className="font-display text-2xl text-white">
                            {count()} ITEM{count() !== 1 ? 'S' : ''}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center text-[#555] hover:text-white border border-[#1a1a1a] hover:border-[#333] rounded transition-all"
                    >
                        ✕
                    </button>
                </div>

                {/* Items */}
                <div className="relative z-20 flex-1 overflow-y-auto p-6 space-y-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            {/* Empty cart illustration */}
                            <div className="w-20 h-20 border-2 border-dashed border-[#2a2a2a] rounded-full flex items-center justify-center mb-4">
                                <span className="text-3xl">🛒</span>
                            </div>
                            <div className="font-display text-4xl text-[#1a1a1a] mb-3">EMPTY</div>
                            <p className="text-[#555] text-sm mb-6">Your cart is empty</p>
                            <button onClick={onClose} className="btn-primary text-sm px-6 py-3">
                                Browse Marketplace →
                            </button>
                        </div>
                    ) : (
                        items.map(({ product, quantity }) => (
                            <div
                                key={product.id}
                                className="flex gap-4 p-3 bg-black/40 border border-[#ffffff08] rounded-lg backdrop-blur-sm hover:border-[#ffffff15] transition-all"
                            >
                                {/* Image */}
                                <div className="w-20 h-20 bg-[#111] rounded-lg overflow-hidden flex-shrink-0 border border-[#1a1a1a]">
                                    {product.images?.[0] ? (
                                        <img
                                            src={`http://localhost:5000${product.images[0]}`}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="font-mono text-[8px] text-[#333]">NO IMG</span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-medium line-clamp-1 mb-0.5">
                                        {product.name}
                                    </p>
                                    <p className="label mb-3">{product.vendor?.storeName}</p>

                                    <div className="flex items-center justify-between">
                                        {/* Qty controls */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateQty(product.id, quantity - 1)}
                                                className="w-6 h-6 border border-[#2a2a2a] text-[#888] rounded flex items-center justify-center hover:border-gold-400 hover:text-gold-400 transition-all text-xs"
                                            >−</button>
                                            <span className="font-mono text-sm text-white w-4 text-center">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQty(product.id, quantity + 1)}
                                                className="w-6 h-6 border border-[#2a2a2a] text-[#888] rounded flex items-center justify-center hover:border-gold-400 hover:text-gold-400 transition-all text-xs"
                                            >+</button>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="font-display text-lg text-gold-400">
                                                {formatRWF(product.price * quantity)}
                                            </span>
                                            <button
                                                onClick={() => removeItem(product.id)}
                                                className="text-[#333] hover:text-red-400 transition-colors text-xs w-5 h-5 flex items-center justify-center"
                                            >✕</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="relative z-20 p-6 border-t border-[#ffffff08] bg-black/40 backdrop-blur-sm space-y-4">

                        {/* Total */}
                        <div className="flex justify-between items-center">
                            <span className="label">TOTAL</span>
                            <span className="font-display text-3xl text-white">
                                {formatRWF(total())}
                            </span>
                        </div>

                        {/* Item count summary */}
                        <div className="flex justify-between items-center">
                            <span className="font-mono text-[10px] text-[#444]">
                                {count()} ITEM{count() !== 1 ? 'S' : ''} IN CART
                            </span>
                            <span className="font-mono text-[10px] text-emerald-400">
                                FREE SHIPPING
                            </span>
                        </div>

                        <Link
                            to="/checkout"
                            onClick={onClose}
                            className="btn-primary w-full text-center block py-4 text-base"
                        >
                            Proceed to Checkout →
                        </Link>

                        <button
                            onClick={onClose}
                            className="btn-outline w-full py-3 text-sm"
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}

            </div>
        </>
    );
}