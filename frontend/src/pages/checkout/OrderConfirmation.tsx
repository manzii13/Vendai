import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { formatRWF } from '../../utils/currency';

type OrderItem = {
    id: string | number;
    price: number;
    quantity: number;
    product?: {
        name?: string;
        images?: string[];
        vendor?: {
            storeName?: string;
        };
    };
};

type Order = {
    id?: string | number;
    items?: OrderItem[];
    total?: number;
    status?: string;
    shippingAddress?: string;
};

export default function OrderConfirmation() {
    const { id } = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await api.get(`/orders/${id}`);
                setOrder(data.order);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">

            {/* Success Icon */}
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-emerald-400 text-3xl">✓</span>
            </div>

            <div className="label mb-3 text-emerald-400">// ORDER CONFIRMED</div>
            <h1 className="font-display text-6xl text-white mb-4">
                ORDER PLACED<span className="text-gold-400">!</span>
            </h1>
            <p className="text-[#555] mb-2">Thank you for your order.</p>
            <p className="font-mono text-xs text-[#444] mb-10">
                ORDER ID: {order?.id}
            </p>

            {/* Order Details */}
            <div className="card text-left mb-8">
                <div className="label mb-4">// ORDER DETAILS</div>

                <div className="space-y-3 mb-5">
                    {order?.items?.map((item: OrderItem) => (
                        <div key={item.id} className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#111] rounded-lg overflow-hidden flex-shrink-0">
                                {item.product?.images?.[0] ? (
                                    <img
                                        src={`http://localhost:5000${item.product.images[0]}`}
                                        className="w-full h-full object-cover"
                                        alt=""
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#333] text-xs">?</div>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-white text-sm">{item.product?.name}</p>
                                <p className="label">{item.product?.vendor?.storeName}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-display text-lg text-gold-400">{formatRWF(item.price * item.quantity)}</p>
                                <p className="label">x{item.quantity}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="divider mb-4" />

                <div className="flex justify-between items-center mb-3">
                    <span className="label">TOTAL PAID</span>
                    <span className="font-display text-3xl text-gold-400">{formatRWF(order?.total ?? 0)}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="label">STATUS</span>
                    <span className="font-mono text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded">
                        {order?.status}
                    </span>
                </div>

                {order?.shippingAddress && (
                    <div className="mt-4 p-3 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
                        <div className="label mb-1">SHIPPING TO</div>
                        <p className="text-[#777] text-xs">{order.shippingAddress}</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center">
                <Link to="/orders" className="btn-outline px-8 py-3">
                    View All Orders
                </Link>
                <Link to="/marketplace" className="btn-primary px-8 py-3">
                    Continue Shopping →
                </Link>
            </div>

        </div>
    );
}