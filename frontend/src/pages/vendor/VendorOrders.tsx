import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatRWF } from '../../utils/currency';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    product?: {
        name?: string;
        images?: string[];
    };
}

interface VendorOrder {
    id: string;
    status: OrderStatus;
    createdAt: string;
    total: number;
    shippingAddress?: string;
    user?: {
        name?: string;
        email?: string;
    };
    items?: OrderItem[];
}

const STATUS_STYLES: Record<string, string> = {
    PENDING: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    CONFIRMED: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    SHIPPED: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    DELIVERED: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    CANCELLED: 'bg-red-500/10 border-red-500/30 text-red-400',
};

const STATUS_FLOW = [
    { status: 'PENDING', label: 'Waiting', icon: '⏳' },
    { status: 'CONFIRMED', label: 'Confirmed', icon: '✓' },
    { status: 'SHIPPED', label: 'Shipped', icon: '🚚' },
    { status: 'DELIVERED', label: 'Delivered', icon: '✅' },
];

export default function VendorOrders() {
    const [orders, setOrders] = useState<VendorOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await api.get('/orders/vendor/incoming');
                setOrders(data.orders);
            } catch {
                toast.error('Failed to load orders');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const updateStatus = async (orderId: string, status: OrderStatus) => {
        setUpdating(orderId);
        try {
            await api.patch(`/orders/${orderId}/status`, { status });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
            toast.success(
                status === 'CONFIRMED' ? '✓ Order confirmed!' :
                    status === 'SHIPPED' ? '🚚 Marked as shipped!' :
                        status === 'DELIVERED' ? '✅ Order delivered!' :
                            'Order cancelled'
            );
        } catch {
            toast.error('Failed to update order');
        } finally {
            setUpdating(null);
        }
    };

    const filters = ['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

    // Count pending orders
    const pendingCount = orders.filter(o => o.status === 'PENDING').length;

    return (
        <div className="max-w-5xl mx-auto px-6 py-12">

            {/* Header */}
            <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
                <div>
                    <div className="label mb-2">// VENDOR PORTAL</div>
                    <h1 className="font-display text-5xl text-white">
                        INCOMING ORDERS<span className="text-gold-400">.</span>
                    </h1>
                    <p className="text-[#555] text-sm mt-2">
                        Manage and fulfill customer orders
                    </p>
                </div>

                {/* Pending alert */}
                {pendingCount > 0 && (
                    <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-lg">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="font-mono text-[11px] text-amber-400">
                            {pendingCount} ORDER{pendingCount > 1 ? 'S' : ''} NEED CONFIRMATION
                        </span>
                    </div>
                )}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap mb-6">
                {filters.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`font-mono text-[10px] px-3 py-1.5 rounded border transition-all ${filter === f
                            ? 'bg-gold-400/10 border-gold-400/30 text-gold-400'
                            : 'border-[#1a1a1a] text-[#555] hover:text-white'
                            }`}
                    >
                        {f}
                        {f === 'PENDING' && pendingCount > 0 && (
                            <span className="ml-1 bg-amber-400 text-black text-[8px] font-bold px-1 rounded-full">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="card animate-pulse h-40" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="font-display text-6xl text-[#1a1a1a] mb-4">EMPTY</div>
                    <p className="text-[#555]">
                        {filter === 'ALL'
                            ? 'No orders yet. Share your store to get started!'
                            : `No ${filter.toLowerCase()} orders`}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(order => (
                        <div
                            key={order.id}
                            className={`card transition-all ${order.status === 'PENDING'
                                ? 'border-amber-500/30 hover:border-amber-500/50'
                                : 'hover:border-[#2a2a2a]'
                                }`}
                        >
                            {/* Order Header */}
                            <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="label">// ORDER</div>
                                        {order.status === 'PENDING' && (
                                            <span className="font-mono text-[9px] bg-amber-400/10 border border-amber-400/30 text-amber-400 px-2 py-0.5 rounded animate-pulse">
                                                ACTION REQUIRED
                                            </span>
                                        )}
                                    </div>
                                    <p className="font-mono text-xs text-[#555]">{order.id}</p>
                                </div>

                                <div className="text-right">
                                    <p className="font-mono text-[10px] text-[#444]">
                                        {new Date(order.createdAt).toLocaleDateString('en-RW', {
                                            day: 'numeric', month: 'short', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                    <span className={`font-mono text-[10px] px-3 py-1 rounded border mt-1 inline-block ${STATUS_STYLES[order.status]}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            {/* Status Progress Bar */}
                            <div className="flex items-center gap-0 mb-5">
                                {STATUS_FLOW.map((step, i) => {
                                    const stepIndex = STATUS_FLOW.findIndex(s => s.status === order.status);
                                    const isDone = i <= stepIndex;
                                    const isCancelled = order.status === 'CANCELLED';

                                    return (
                                        <div key={step.status} className="flex items-center flex-1">
                                            <div className={`flex flex-col items-center flex-1`}>
                                                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs transition-all ${isCancelled
                                                    ? 'border-red-500/30 text-red-400 bg-red-500/10'
                                                    : isDone
                                                        ? 'border-gold-400 bg-gold-400/20 text-gold-400'
                                                        : 'border-[#2a2a2a] text-[#444]'
                                                    }`}>
                                                    {isCancelled ? '✕' : isDone ? step.icon : '○'}
                                                </div>
                                                <span className={`font-mono text-[8px] mt-1 ${isDone && !isCancelled ? 'text-gold-400' : 'text-[#444]'
                                                    }`}>
                                                    {step.label.toUpperCase()}
                                                </span>
                                            </div>
                                            {i < STATUS_FLOW.length - 1 && (
                                                <div className={`h-0.5 flex-1 mb-4 transition-all ${i < stepIndex && !isCancelled ? 'bg-gold-400' : 'bg-[#1a1a1a]'
                                                    }`} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Customer Info */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="p-3 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
                                    <div className="label mb-1">CUSTOMER</div>
                                    <p className="text-white text-sm font-medium">{order.user?.name}</p>
                                    <p className="font-mono text-[10px] text-[#555]">{order.user?.email}</p>
                                </div>
                                {order.shippingAddress && (
                                    <div className="p-3 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
                                        <div className="label mb-1">SHIP TO</div>
                                        <p className="text-[#777] text-xs line-clamp-2">{order.shippingAddress}</p>
                                    </div>
                                )}
                            </div>

                            {/* Order Items */}
                            <div className="space-y-2 mb-4">
                                <div className="label mb-2">ORDER ITEMS</div>
                                {order.items?.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3 p-3 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
                                        <div className="w-12 h-12 bg-[#111] rounded-lg overflow-hidden flex-shrink-0">
                                            {item.product?.images?.[0] ? (
                                                <img
                                                    src={`http://localhost:5000${item.product.images[0]}`}
                                                    className="w-full h-full object-cover" alt=""
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[#333] text-xs">?</div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white text-sm font-medium">{item.product?.name}</p>
                                            <p className="label">Qty: {item.quantity}</p>
                                        </div>
                                        <span className="font-display text-lg text-gold-400">
                                            {formatRWF(item.price * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Footer — Total + Action Buttons */}
                            <div className="divider pt-4 flex items-center justify-between flex-wrap gap-3">
                                <div>
                                    <span className="label">ORDER TOTAL</span>
                                    <div className="font-display text-3xl text-gold-400 mt-0.5">
                                        {formatRWF(order.total)}
                                    </div>
                                </div>

                                {/*  Action Buttons */}
                                <div className="flex gap-2 flex-wrap">

                                    {/* PENDING → show CONFIRM button prominently */}
                                    {order.status === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => updateStatus(order.id, 'CONFIRMED')}
                                                disabled={updating === order.id}
                                                className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-mono text-[11px] px-5 py-2.5 rounded-lg hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                                            >
                                                {updating === order.id ? (
                                                    <span className="w-3 h-3 border border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                                ) : '✓'}
                                                CONFIRM ORDER
                                            </button>
                                            <button
                                                onClick={() => updateStatus(order.id, 'CANCELLED')}
                                                disabled={updating === order.id}
                                                className="font-mono text-[11px] border border-red-500/30 text-red-400 px-4 py-2.5 rounded-lg hover:bg-red-500/10 transition-all disabled:opacity-50"
                                            >
                                                ✕ CANCEL
                                            </button>
                                        </>
                                    )}

                                    {/* CONFIRMED → show MARK AS SHIPPED */}
                                    {order.status === 'CONFIRMED' && (
                                        <button
                                            onClick={() => updateStatus(order.id, 'SHIPPED')}
                                            disabled={updating === order.id}
                                            className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/40 text-purple-400 font-mono text-[11px] px-5 py-2.5 rounded-lg hover:bg-purple-500/20 transition-all disabled:opacity-50"
                                        >
                                            {updating === order.id ? (
                                                <span className="w-3 h-3 border border-purple-400 border-t-transparent rounded-full animate-spin" />
                                            ) : ''}
                                            MARK AS SHIPPED
                                        </button>
                                    )}

                                    {/* SHIPPED → show MARK AS DELIVERED */}
                                    {order.status === 'SHIPPED' && (
                                        <button
                                            onClick={() => updateStatus(order.id, 'DELIVERED')}
                                            disabled={updating === order.id}
                                            className="flex items-center gap-2 bg-gold-400/10 border border-gold-400/30 text-gold-400 font-mono text-[11px] px-5 py-2.5 rounded-lg hover:bg-gold-400/20 transition-all disabled:opacity-50"
                                        >
                                            {updating === order.id ? (
                                                <span className="w-3 h-3 border border-gold-400 border-t-transparent rounded-full animate-spin" />
                                            ) : '✓'}
                                            MARK AS DELIVERED
                                        </button>
                                    )}

                                    {/* DELIVERED — fulfilled */}
                                    {order.status === 'DELIVERED' && (
                                        <span className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] px-5 py-2.5 rounded-lg">
                                            ORDER FULFILLED
                                        </span>
                                    )}

                                    {/* CANCELLED */}
                                    {order.status === 'CANCELLED' && (
                                        <span className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-[11px] px-5 py-2.5 rounded-lg">
                                            CANCELLED
                                        </span>
                                    )}

                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}