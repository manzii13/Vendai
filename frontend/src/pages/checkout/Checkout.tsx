import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { formatRWF } from '../../utils/currency';

interface ShippingForm {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
}

type PaymentMethod = 'MOMO' | 'BANK' | 'CASH';

const PAYMENT_OPTIONS = [
    {
        id: 'MOMO' as PaymentMethod,
        label: 'MTN MoMo',
        icon: '📱',
        desc: 'Pay via MTN Mobile Money',
        color: 'border-yellow-500/40 bg-yellow-500/5',
        activeColor: 'border-yellow-400 bg-yellow-400/10',
        badge: 'INSTANT',
        badgeColor: 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400',
    },
    {
        id: 'BANK' as PaymentMethod,
        label: 'Bank Transfer',
        icon: '🏦',
        desc: 'Transfer via BK, Equity or Airtel',
        color: 'border-blue-500/40 bg-blue-500/5',
        activeColor: 'border-blue-400 bg-blue-400/10',
        badge: '1-2 HRS',
        badgeColor: 'bg-blue-400/10 border-blue-400/30 text-blue-400',
    },
    {
        id: 'CASH' as PaymentMethod,
        label: 'Cash on Delivery',
        icon: '💵',
        desc: 'Pay when your order arrives',
        color: 'border-emerald-500/40 bg-emerald-500/5',
        activeColor: 'border-emerald-400 bg-emerald-400/10',
        badge: 'ON ARRIVAL',
        badgeColor: 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400',
    },
];

const PAYMENT_INSTRUCTIONS: Record<PaymentMethod, React.ReactNode> = {
    MOMO: (
        <div className="space-y-3">
            <div className="label text-yellow-400 mb-3">// MTN MOMO INSTRUCTIONS</div>
            {[
                { step: '01', text: 'Dial *182# on your MTN line' },
                { step: '02', text: 'Select "Transfer Money" → "To Mobile"' },
                { step: '03', text: 'Enter number: 078 XXX XXXX (VendAIX)' },
                { step: '04', text: `Enter amount: ${' '}` },
                { step: '05', text: 'Use your Order ID as reference' },
                { step: '06', text: 'Enter your MoMo PIN to confirm' },
            ].map(i => (
                <div key={i.step} className="flex gap-3 items-start">
                    <span className="font-display text-yellow-400 text-lg w-8 flex-shrink-0">{i.step}</span>
                    <p className="text-[#aaa] text-sm">{i.text}</p>
                </div>
            ))}
            <div className="mt-3 p-3 bg-yellow-400/5 border border-yellow-400/20 rounded-lg">
                <p className="font-mono text-[10px] text-yellow-400">⚡ YOUR ORDER WILL BE CONFIRMED WITHIN 30 MINUTES AFTER PAYMENT</p>
            </div>
        </div>
    ),
    BANK: (
        <div className="space-y-3">
            <div className="label text-blue-400 mb-3">// BANK TRANSFER DETAILS</div>
            {[
                { label: 'Bank Name', value: 'Bank of Kigali (BK)' },
                { label: 'Account Name', value: 'VendAIX Ltd' },
                { label: 'Account Number', value: '00040-XXXXXXXX' },
                { label: 'Branch', value: 'Kigali City Branch' },
                { label: 'SWIFT Code', value: 'BKIGRWRW' },
            ].map(row => (
                <div key={row.label} className="flex justify-between items-center p-2 bg-[#0a0a0a] rounded border border-[#1a1a1a]">
                    <span className="font-mono text-[10px] text-[#555]">{row.label.toUpperCase()}</span>
                    <span className="text-white text-xs font-semibold">{row.value}</span>
                </div>
            ))}
            <div className="mt-3 p-3 bg-blue-400/5 border border-blue-400/20 rounded-lg">
                <p className="font-mono text-[10px] text-blue-400">⚡ USE YOUR ORDER ID AS PAYMENT REFERENCE. ORDER CONFIRMED WITHIN 1-2 HRS.</p>
            </div>
        </div>
    ),
    CASH: (
        <div className="space-y-3">
            <div className="label text-emerald-400 mb-3">// CASH ON DELIVERY</div>
            {[
                { step: '01', text: 'Place your order and wait for confirmation' },
                { step: '02', text: 'Vendor will contact you to arrange delivery' },
                { step: '03', text: 'Prepare exact amount in RWF on delivery' },
                { step: '04', text: 'Pay the delivery person upon receiving' },
            ].map(i => (
                <div key={i.step} className="flex gap-3 items-start">
                    <span className="font-display text-emerald-400 text-lg w-8 flex-shrink-0">{i.step}</span>
                    <p className="text-[#aaa] text-sm">{i.text}</p>
                </div>
            ))}
            <div className="mt-3 p-3 bg-emerald-400/5 border border-emerald-400/20 rounded-lg">
                <p className="font-mono text-[10px] text-emerald-400">✓ NO ADVANCE PAYMENT REQUIRED. PAY ON ARRIVAL.</p>
            </div>
        </div>
    ),
};

export default function Checkout() {
    const { items, total, clearCart } = useCartStore();
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MOMO');
    const [form, setForm] = useState<ShippingForm>({
        fullName: user?.name || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        country: 'Rwanda',
    });

    const update = (field: keyof ShippingForm) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
            setForm(f => ({ ...f, [field]: e.target.value }));

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
                <div className="font-display text-6xl text-[#1a1a1a] mb-4">EMPTY</div>
                <p className="text-[#555] mb-8">Your cart is empty. Add some products first!</p>
                <Link to="/marketplace" className="btn-primary">Browse Marketplace →</Link>
            </div>
        );
    }

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) { navigate('/login'); return; }

        setLoading(true);
        try {
            const shippingAddress = `${form.fullName}, ${form.address}, ${form.city}, ${form.country} | Phone: ${form.phone}`;

            const orderItems = items.map(i => ({
                productId: i.product.id,
                quantity: i.quantity
            }));

            const { data } = await api.post('/orders', {
                items: orderItems,
                shippingAddress: shippingAddress,
                paymentMethod: paymentMethod,
            });

            clearCart();
            toast.success('Order placed successfully! 🎉');
            navigate(`/orders/${data.order.id}/confirmation`);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">

            {/* Header */}
            <div className="mb-10">
                <div className="label mb-2">// CHECKOUT</div>
                <h1 className="font-display text-5xl text-white">
                    COMPLETE ORDER<span className="text-gold-400">.</span>
                </h1>
            </div>

            <form onSubmit={handlePlaceOrder}>
                <div className="grid lg:grid-cols-5 gap-8">

                    {/* Left */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Shipping */}
                        <div className="card">
                            <div className="label mb-5">// SHIPPING INFORMATION</div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="label mb-2 block">Full Name</label>
                                    <input type="text" value={form.fullName} onChange={update('fullName')}
                                        className="input-field" placeholder="John Doe" required />
                                </div>
                                <div>
                                    <label className="label mb-2 block">Email</label>
                                    <input type="email" value={form.email} onChange={update('email')}
                                        className="input-field" placeholder="you@email.com" required />
                                </div>
                                <div>
                                    <label className="label mb-2 block">Phone</label>
                                    <input type="tel" value={form.phone} onChange={update('phone')}
                                        className="input-field" placeholder="+250 7XX XXX XXX" required />
                                </div>
                                <div className="col-span-2">
                                    <label className="label mb-2 block">Street Address</label>
                                    <input type="text" value={form.address} onChange={update('address')}
                                        className="input-field" placeholder="KG 123 St, House No. 4" required />
                                </div>
                                <div>
                                    <label className="label mb-2 block">City</label>
                                    <input type="text" value={form.city} onChange={update('city')}
                                        className="input-field" placeholder="Kigali" required />
                                </div>
                                <div>
                                    <label className="label mb-2 block">Country</label>
                                    <select value={form.country} onChange={update('country')} className="input-field">
                                        {['Rwanda', 'Kenya', 'Uganda', 'Tanzania', 'Burundi', 'DRC', 'Nigeria', 'Ghana', 'South Africa', 'Other'].map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Selector */}
                        <div className="card">
                            <div className="flex items-center gap-3 mb-5">
                                <span className="text-gold-400 text-lg">💳</span>
                                <div className="label text-gold-400">// PAYMENT METHOD</div>
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                {PAYMENT_OPTIONS.map(opt => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setPaymentMethod(opt.id)}
                                        className={`p-4 rounded-lg border-2 text-left transition-all ${paymentMethod === opt.id ? opt.activeColor : opt.color + ' hover:opacity-80'
                                            }`}
                                    >
                                        <div className="text-2xl mb-2">{opt.icon}</div>
                                        <div className="text-white text-xs font-semibold mb-1">{opt.label}</div>
                                        <div className="text-[#666] text-[10px] mb-2">{opt.desc}</div>
                                        <span className={`font-mono text-[9px] px-2 py-0.5 rounded border ${opt.badgeColor}`}>
                                            {opt.badge}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Instructions for selected method */}
                            <div className="p-4 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
                                {PAYMENT_INSTRUCTIONS[paymentMethod]}
                            </div>
                        </div>

                    </div>

                    {/* Right — Order Summary */}
                    <div className="lg:col-span-2">
                        <div className="card sticky top-24">
                            <div className="label mb-5">// ORDER SUMMARY</div>

                            {/* Items */}
                            <div className="space-y-3 mb-5 max-h-72 overflow-y-auto pr-1">
                                {items.map(({ product, quantity }) => (
                                    <div key={product.id} className="flex gap-3">
                                        <div className="w-14 h-14 bg-[#111] rounded-lg overflow-hidden flex-shrink-0">
                                            {product.images?.[0] ? (
                                                <img src={`http://localhost:5000${product.images[0]}`}
                                                    alt={product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="text-[#333] text-xs">?</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-xs font-medium line-clamp-1">{product.name}</p>
                                            <p className="label mt-0.5">{product.vendor?.storeName}</p>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="font-mono text-[10px] text-[#555]">x{quantity}</span>
                                                <span className="font-display text-base text-gold-400">
                                                    {formatRWF(product.price * quantity)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="divider mb-4" />

                            {/* Totals */}
                            <div className="space-y-2 mb-5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#555]">Subtotal</span>
                                    <span className="text-white">{formatRWF(total())}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#555]">Shipping</span>
                                    <span className="text-emerald-400 font-mono text-xs">FREE</span>
                                </div>

                                {/* Selected payment method badge */}
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#555]">Payment</span>
                                    <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${PAYMENT_OPTIONS.find(o => o.id === paymentMethod)?.badgeColor
                                        }`}>
                                        {PAYMENT_OPTIONS.find(o => o.id === paymentMethod)?.label.toUpperCase()}
                                    </span>
                                </div>

                                <div className="divider my-2" />
                                <div className="flex justify-between">
                                    <span className="label">TOTAL</span>
                                    <span className="font-display text-3xl text-gold-400">
                                        {formatRWF(total())}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-4 text-base"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                        Placing Order...
                                    </span>
                                ) : `Place Order — ${formatRWF(total())} →`}
                            </button>

                            <Link to="/marketplace" className="btn-outline w-full py-3 text-sm text-center block mt-3">
                                ← Continue Shopping
                            </Link>
                        </div>
                    </div>

                </div>
            </form>
        </div>
    );
}