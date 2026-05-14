import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import ImageUploader from '../../components/ui/ImageUploader';

const CATEGORIES = [
    'Electronics', 'Fashion', 'Beauty', 'Home & Living',
    'Food & Drinks', 'Sports', 'Books', 'Health', 'Toys', 'Other'
];

interface FormState {
    name: string;
    description: string;
    price: string;
    stock: string;
    category: string;
    tags: string;
}

export default function AddProduct() {
    const navigate = useNavigate();
    const [form, setForm] = useState<FormState>({
        name: '', description: '', price: '', stock: '', category: '', tags: ''
    });
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    const update = (field: keyof FormState) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
            setForm(f => ({ ...f, [field]: e.target.value }));

    // ✨ AI Generate Description
    const handleAIGenerate = async () => {
        if (!form.name || !form.category) {
            toast.error('Enter a product name and category first');
            return;
        }
        setAiLoading(true);
        try {
            const { data } = await api.post('/products/ai/generate-description', {
                productName: form.name,
                category: form.category,
                keywords: form.tags
            });
            setForm(f => ({
                ...f,
                name: data.title || f.name,
                description: data.description || f.description,
                tags: data.tags?.join(', ') || f.tags
            }));
            toast.success('AI description generated! ✨');
        } catch {
            toast.error('AI generation failed. Check your API key.');
        } finally {
            setAiLoading(false);
        }
    };

    // Submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();


        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('name', form.name);
            fd.append('description', form.description);
            fd.append('price', form.price);
            fd.append('stock', form.stock);
            fd.append('category', form.category);

            const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean);
            fd.append('tags', JSON.stringify(tagsArray));

            images.forEach(img => fd.append('images', img));

            await api.post('/products', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Product listed successfully!');
            navigate('/vendor/products');
        } catch (err: unknown) {
            const message =
                typeof err === 'object' &&
                    err !== null &&
                    'response' in err &&
                    typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
                    ? (err as { response?: { data?: { message?: string } } }).response!.data!.message!
                    : err instanceof Error
                        ? err.message
                        : 'Failed to create product';

            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">

            {/* Header */}
            <div className="mb-10">
                <div className="label mb-2">// VENDOR PORTAL</div>
                <h1 className="font-display text-5xl text-white">
                    ADD PRODUCT<span className="text-gold-400">.</span>
                </h1>
                <p className="text-[#555] text-sm mt-2">
                    List a new product on the marketplace. Use AI to generate descriptions instantly.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid lg:grid-cols-5 gap-8">

                    {/* Left — Images */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card">
                            <div className="label mb-4">// PRODUCT PHOTOS</div>
                            <ImageUploader
                                images={images}
                                previews={previews}
                                onChange={(f, p) => { setImages(f); setPreviews(p); }}
                                max={5}
                            />
                            <p className="font-mono text-[10px] text-[#444] mt-3">
                                FIRST IMAGE WILL BE THE COVER PHOTO
                            </p>
                        </div>

                        {/* Pricing & Stock */}
                        <div className="card space-y-4">
                            <div className="label mb-2">// PRICING & STOCK</div>
                            <div>
                                <label className="label mb-2 block">Price (RWF)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-400 font-mono text-sm">RWF</span>
                                    <input
                                        type="number" min="0" step="0.01"
                                        value={form.price} onChange={update('price')}
                                        className="input-field pl-8"
                                        placeholder="0" required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="label mb-2 block">Stock Quantity</label>
                                <input
                                    type="number" min="0"
                                    value={form.stock} onChange={update('stock')}
                                    className="input-field"
                                    placeholder="0" required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right — Details */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Basic Info */}
                        <div className="card space-y-4">
                            <div className="label mb-2">// PRODUCT DETAILS</div>

                            <div>
                                <label className="label mb-2 block">Category</label>
                                <select
                                    value={form.category} onChange={update('category')}
                                    className="input-field" required
                                >
                                    <option value="">Select a category...</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="label mb-2 block">Product Name</label>
                                <input
                                    type="text"
                                    value={form.name} onChange={update('name')}
                                    className="input-field"
                                    placeholder="e.g. Wireless Noise-Cancelling Headphones"
                                    required
                                />
                            </div>

                            <div>
                                <label className="label mb-2 block">Keywords / Features</label>
                                <input
                                    type="text"
                                    value={form.tags} onChange={update('tags')}
                                    className="input-field"
                                    placeholder="e.g. bluetooth, noise cancelling, 40hr battery"
                                />
                                <p className="font-mono text-[10px] text-[#444] mt-1">
                                    SEPARATE WITH COMMAS · USED FOR AI & SEARCH
                                </p>
                            </div>
                        </div>

                        {/* AI Description */}
                        <div className="card">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="label mb-1">// DESCRIPTION</div>
                                    <p className="text-[#555] text-xs">Write manually or let AI generate it</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAIGenerate}
                                    disabled={aiLoading}
                                    className="flex items-center gap-2 bg-gold-400/10 border border-gold-400/30 text-gold-400 px-4 py-2 rounded text-xs font-semibold hover:bg-gold-400/20 transition-all disabled:opacity-50"
                                >
                                    {aiLoading ? (
                                        <>
                                            <span className="w-3 h-3 border border-gold-400 border-t-transparent rounded-full animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>✦ AI Generate</>
                                    )}
                                </button>
                            </div>

                            <textarea
                                value={form.description} onChange={update('description')}
                                className="input-field resize-none"
                                rows={6}
                                placeholder="Describe your product — or click AI Generate above..."
                                required
                            />
                        </div>

                        {/* Submit */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/vendor/products')}
                                className="btn-outline flex-1"
                            >
                                ← Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary flex-1"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                        Publishing...
                                    </span>
                                ) : 'Publish Product →'}
                            </button>
                        </div>

                    </div>
                </div>
            </form>
        </div>
    );
}