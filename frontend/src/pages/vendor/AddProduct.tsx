import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import ImageUploader from '../../components/ui/ImageUploader';

const CATEGORIES = [
    'Electronics',
    'Fashion',
    'Beauty',
    'Home & Living',
    'Food & Drinks',
    'Sports',
    'Books',
    'Health',
    'Toys',
    'Other',
];

interface FormState {
    name: string;
    description: string;
    price: string;
    stock: string;
    category: string;
    tags: string;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2">
            {children}
        </label>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-4">
            {children}
        </h2>
    );
}

export default function AddProduct() {
    const navigate = useNavigate();

    const [form, setForm] = useState<FormState>({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        tags: '',
    });

    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    const update =
        (field: keyof FormState) =>
            (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
                setForm((prev) => ({ ...prev, [field]: e.target.value }));
            };

    const handleAIGenerate = async () => {
        if (!form.name || !form.category) {
            toast.error('Enter product name and category first');
            return;
        }

        setAiLoading(true);
        try {
            const { data } = await api.post('/products/ai/generate-description', {
                productName: form.name,
                category: form.category,
                keywords: form.tags,
            });

            setForm((prev) => ({
                ...prev,
                name: data.title || prev.name,
                description: data.description || prev.description,
                tags: data.tags?.join(', ') || prev.tags,
            }));

            toast.success('AI description generated');
        } catch (error) {
            console.error(error);
            toast.error('AI generation failed');
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (images.length === 0) {
            toast.error('Please upload at least one image');
            return;
        }

        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('name', form.name);
            fd.append('description', form.description);
            fd.append('price', form.price);
            fd.append('stock', form.stock);
            fd.append('category', form.category);

            const tagsArray = form.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean);
            fd.append('tags', JSON.stringify(tagsArray));
            images.forEach((image) => fd.append('images', image));

            await api.post('/products', fd);
            toast.success('Product published successfully');
            navigate('/vendor/products');
        } catch (err: unknown) {
            console.error('CREATE PRODUCT ERROR:', err);
            let message = 'Failed to create product';
            if (typeof err === 'object' && err !== null && 'response' in err) {
                const errorResponse = err as { response?: { data?: { message?: string } } };
                if (errorResponse.response?.data?.message) {
                    message = errorResponse.response.data.message;
                }
            } else if (err instanceof Error) {
                message = err.message;
            }
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-wide text-market-700 mb-1">Vendor</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Add product</h1>
                <p className="text-slate-600 text-sm mt-1">
                    List a new product on the marketplace. Use AI to generate descriptions instantly.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="market-card p-5 sm:p-6">
                            <SectionTitle>Product photos</SectionTitle>
                            <ImageUploader
                                images={images}
                                previews={previews}
                                onChange={(files, previewUrls) => {
                                    setImages(files);
                                    setPreviews(previewUrls);
                                }}
                                max={5}
                            />
                            <p className="text-xs text-slate-500 mt-3">
                                First image will be the cover photo.
                            </p>
                        </div>

                        <div className="market-card p-5 sm:p-6 space-y-4">
                            <SectionTitle>Pricing and stock</SectionTitle>

                            <div>
                                <FieldLabel>Price (RWF)</FieldLabel>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-market-700 text-sm font-semibold">
                                        RWF
                                    </span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.price}
                                        onChange={update('price')}
                                        className="market-input pl-14"
                                        placeholder="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <FieldLabel>Stock quantity</FieldLabel>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.stock}
                                    onChange={update('stock')}
                                    className="market-input"
                                    placeholder="0"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3 space-y-6">
                        <div className="market-card p-5 sm:p-6 space-y-4">
                            <SectionTitle>Product details</SectionTitle>

                            <div>
                                <FieldLabel>Category</FieldLabel>
                                <select
                                    value={form.category}
                                    onChange={update('category')}
                                    className="market-input"
                                    required
                                >
                                    <option value="">Select a category...</option>
                                    {CATEGORIES.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <FieldLabel>Product name</FieldLabel>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={update('name')}
                                    className="market-input"
                                    placeholder="e.g. Wireless headphones"
                                    required
                                />
                            </div>

                            <div>
                                <FieldLabel>Keywords / features</FieldLabel>
                                <input
                                    type="text"
                                    value={form.tags}
                                    onChange={update('tags')}
                                    className="market-input"
                                    placeholder="bluetooth, wireless, premium"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Separate with commas. Used for AI and search.
                                </p>
                            </div>
                        </div>

                        <div className="market-card p-5 sm:p-6">
                            <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                                <div>
                                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                                        Description
                                    </h2>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Write manually or let AI generate it
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAIGenerate}
                                    disabled={aiLoading}
                                    className="market-btn-outline text-sm py-2 shrink-0 disabled:opacity-50"
                                >
                                    {aiLoading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-3 h-3 border-2 border-market-600 border-t-transparent rounded-full animate-spin" />
                                            Generating...
                                        </span>
                                    ) : (
                                        'AI generate'
                                    )}
                                </button>
                            </div>

                            <textarea
                                value={form.description}
                                onChange={update('description')}
                                className="market-input resize-none min-h-[160px]"
                                rows={6}
                                placeholder="Describe your product..."
                                required
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/vendor/products')}
                                className="market-btn-outline flex-1 py-3"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="market-btn-primary flex-1 py-3 disabled:opacity-50"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Publishing...
                                    </span>
                                ) : (
                                    'Publish product'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
