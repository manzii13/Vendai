import { useCartStore } from '../../store/cartStore';
import { Link } from 'react-router-dom';
import { formatRWF } from '../../utils/currency';
import { uploadUrl } from '../../utils/mediaUrl';
import { CartIcon } from '../market/MarketIcons';

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function CartSidebar({ open, onClose }: Props) {
    const { items, removeItem, updateQty, total, count } = useCartStore();
    const itemCount = count();

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                    onClick={onClose}
                    aria-hidden
                />
            )}

            <div
                className={`fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col bg-white border-l border-slate-200 shadow-2xl transition-transform duration-300 ${
                    open ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
                }`}
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Your cart</p>
                        <h2 className="text-2xl font-bold text-slate-900">
                            {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300 rounded-xl transition-all"
                        aria-label="Close cart"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="w-16 h-16 rounded-2xl bg-market-50 border border-market-100 flex items-center justify-center mb-4 text-market-700">
                                <CartIcon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Your cart is empty</h3>
                            <p className="text-sm text-slate-500 mb-6">Add products from the marketplace to get started.</p>
                            <button type="button" onClick={onClose} className="market-btn-primary text-sm px-6 py-3">
                                Browse marketplace
                            </button>
                        </div>
                    ) : (
                        items.map(({ product, quantity }) => (
                            <div
                                key={product.id}
                                className="flex gap-4 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-200 transition-all"
                            >
                                <div className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
                                    {product.images?.[0] ? (
                                        <img
                                            src={uploadUrl(product.images[0])}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-600">
                                            No image
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-slate-900 text-sm font-medium line-clamp-1 mb-0.5">
                                        {product.name}
                                    </p>
                                    <p className="text-xs text-slate-500 mb-3">{product.vendor?.storeName}</p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => updateQty(product.id, quantity - 1)}
                                                className="w-8 h-8 border border-slate-200 text-slate-600 rounded-lg flex items-center justify-center hover:border-market-500 hover:text-market-700 transition-all text-sm"
                                                aria-label="Decrease quantity"
                                            >
                                                −
                                            </button>
                                            <span className="text-sm text-slate-900 w-6 text-center tabular-nums">
                                                {quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => updateQty(product.id, quantity + 1)}
                                                className="w-8 h-8 border border-slate-200 text-slate-600 rounded-lg flex items-center justify-center hover:border-market-500 hover:text-market-700 transition-all text-sm"
                                                aria-label="Increase quantity"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-bold text-market-700 tabular-nums">
                                                {formatRWF(product.price * quantity)}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeItem(product.id)}
                                                className="text-slate-500 hover:text-red-400 transition-colors p-1"
                                                aria-label="Remove item"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-6 border-t border-slate-100 bg-slate-50/80 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-500">Total</span>
                            <span className="text-3xl font-bold text-slate-900 tabular-nums">
                                {formatRWF(total())}
                            </span>
                        </div>

                        <p className="text-xs text-slate-500 text-center">
                            {itemCount} {itemCount === 1 ? 'item' : 'items'} in cart
                        </p>

                        <Link
                            to="/checkout"
                            onClick={onClose}
                            className="market-btn-primary w-full text-center block py-4 text-base"
                        >
                            Proceed to checkout
                        </Link>

                        <button type="button" onClick={onClose} className="market-btn-outline w-full py-3 text-sm">
                            Continue shopping
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
