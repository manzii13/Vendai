import { useState } from 'react';

interface Props {
    images: File[];
    previews: string[];
    onChange: (files: File[], previews: string[]) => void;
    max?: number;
}

export default function ImageUploader({ images, previews, onChange, max = 5 }: Props) {
    const [dragging, setDragging] = useState(false);

    const processFiles = (files: FileList | null) => {
        if (!files) return;
        const newFiles: File[] = [];
        const newPreviews: string[] = [];

        Array.from(files)
            .slice(0, max - images.length)
            .forEach((file) => {
                if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) return;
                newFiles.push(file);
                newPreviews.push(URL.createObjectURL(file));
            });

        onChange([...images, ...newFiles], [...previews, ...newPreviews]);
    };

    const removeImage = (index: number) => {
        onChange(
            images.filter((_, i) => i !== index),
            previews.filter((_, i) => i !== index)
        );
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        processFiles(e.dataTransfer.files);
    };

    return (
        <div className="space-y-3">
            {images.length < max && (
                <label
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                        dragging
                            ? 'border-market-500 bg-market-50'
                            : 'border-slate-300 hover:border-market-400 bg-slate-50'
                    }`}
                >
                    <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => processFiles(e.target.files)}
                    />
                    <svg
                        className="w-10 h-10 text-slate-400 mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        aria-hidden
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                    <p className="text-slate-700 text-sm">
                        Drag and drop or <span className="text-market-700 font-semibold">browse</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        JPG, PNG, WEBP · max 5MB · up to {max} photos
                    </p>
                </label>
            )}

            {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                    {previews.map((src, i) => (
                        <div key={i} className="relative group aspect-square">
                            <img
                                src={src}
                                alt={`Preview ${i + 1}`}
                                className="w-full h-full object-cover rounded-xl border border-slate-200"
                            />
                            {i === 0 && (
                                <span className="absolute top-2 left-2 text-[10px] font-bold uppercase bg-market-600 text-white px-2 py-0.5 rounded-md">
                                    Cover
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={() => removeImage(i)}
                                className="absolute top-2 right-2 w-7 h-7 bg-slate-900/80 text-white rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                aria-label="Remove image"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
