import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import ImageUploader from '../../components/ui/ImageUploader';

const CATEGORIES = [
    'Electronics', 'Fashion', 'Beauty', 'Home & Living',
    'Food & Drinks', 'Sports', 'Books', 'Health', 'Toys', 'Other'
];

export default function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '', description: '', price: '', stock: '', category: '', tags: ''
    });
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [newPreviews, setNewPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await api.get(`/products/${id}`);
                const p = data.product;
                setForm({
                    name: p.name,
                    description: p.description,
                    price: String(p.price),
                    stock: String(p.stock),
                    category: p.category,
                    tags: p.tags?.join(', ') || ''
                });
                setExistingImages(p.images || []);
            } catch {
                toast.error('Failed to load product');
                navigate('/vendor/products');
            } finally {
                setFetching(false);
            }
        };
        load();
    }, [id]);

    const update = (field: string) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
            setForm(f => ({ ...f, [field]: e.target.value }));

    const handleAIGenerate = async () => {
        if (!form.name || !form.category) { toast.error('Enter name and category first'); return; }
        setAiLoading(true);
        try {
            const { data } = await api.post('/products/ai/generate-description', {
                productName: form.name, category: form.category, keywords: form.tags
            });
            setForm(f => ({
                ...f,
                name: data.title || f.name,
                description: data.description || f.description,
                tags: data.tags?.join(', ') || f.tags
            }));
            toast.success('AI description updated! ✨');
        } catch {
            toast.error('AI generation failed');
        } finally {
            setAiLoading(false);
        }
    };

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
            newImages.forEach(img => fd.append('images', img));

            await api.put(`/products/${id}`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Product updated!');
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
                        : 'Update failed';

            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="mb-10">
                <div className="label mb-2">// VENDOR PORTAL</div>
                <h1 className="font-display text-5xl text-white">EDIT PRODUCT<span className="text-gold-400">.</span></h1>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid lg:grid-cols-5 gap-8">

                    {/* Left */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Existing Images */}
                        {existingImages.length > 0 && (
                            <div className="card">
                                <div className="label mb-3">// CURRENT PHOTOS</div>
                                <div className="grid grid-cols-3 gap-2">
                                    {existingImages.map((src, i) => (
                                        <div key={i} className="relative aspect-square">
                                            <img src={`http://localhost:5000${src}`} className="w-full h-full object-cover rounded border border-[#1a1a1a]" />
                                            {i === 0 && <span className="absolute top-1 left-1 font-mono text-[8px] bg-gold-400 text-black px-1 rounded">COVER</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* New Images */}
                        <div className="card">
                            <div className="label mb-3">// REPLACE PHOTOS</div>
                            <ImageUploader
                                images={newImages} previews={newPreviews}
                                onChange={(f, p) => { setNewImages(f); setNewPreviews(p); }}
                                max={5}
                            />
                            <p className="font-mono text-[10px] text-[#444] mt-2">
                                UPLOADING NEW PHOTOS WILL REPLACE EXISTING ONES
                            </p>
                        </div>

                        {/* Price & Stock */}
                        <div className="card space-y-4">
                            <div className="label mb-2">// PRICING & STOCK</div>
                            <div>
                                <label className="label mb-2 block">Price (RWF)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-400 font-mono text-sm">RWF</span>
                                    <input type="number" min="0" step="0.01" value={form.price} onChange={update('price')} className="input-field pl-8" placeholder="0" required />
                                </div>
                            </div>
                            <div>
                                <label className="label mb-2 block">Stock</label>
                                <input type="number" min="0" value={form.stock} onChange={update('stock')} className="input-field" required />
                            </div>
                        </div>
                    </div>

                    {/* Right */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="card space-y-4">
                            <div className="label mb-2">// PRODUCT DETAILS</div>
                            <div>
                                <label className="label mb-2 block">Category</label>
                                <select value={form.category} onChange={update('category')} className="input-field" required>
                                    <option value="">Select...</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label mb-2 block">Product Name</label>
                                <input type="text" value={form.name} onChange={update('name')} className="input-field" required />
                            </div>
                            <div>
                                <label className="label mb-2 block">Keywords / Tags</label>
                                <input type="text" value={form.tags} onChange={update('tags')} className="input-field" placeholder="tag1, tag2, tag3" />
                            </div>
                        </div>

                        <div className="card">
                            <div className="flex items-center justify-between mb-4">
                                <div className="label">// DESCRIPTION</div>
                                <button type="button" onClick={handleAIGenerate} disabled={aiLoading}
                                    className="flex items-center gap-2 bg-gold-400/10 border border-gold-400/30 text-gold-400 px-4 py-2 rounded text-xs font-semibold hover:bg-gold-400/20 transition-all disabled:opacity-50">
                                    {aiLoading
                                        ? <><span className="w-3 h-3 border border-gold-400 border-t-transparent rounded-full animate-spin" /> Generating...</>
                                        : '✦ Regenerate with AI'}
                                </button>
                            </div>
                            <textarea value={form.description} onChange={update('description')} className="input-field resize-none" rows={6} required />
                        </div>

                        <div className="flex gap-3">
                            <button type="button" onClick={() => navigate('/vendor/products')} className="btn-outline flex-1">← Cancel</button>
                            <button type="submit" disabled={loading} className="btn-primary flex-1">
                                {loading ? 'Saving...' : 'Save Changes →'}
                            </button>
                        </div>
                    </div>

                </div>
            </form>
        </div>
    );
}