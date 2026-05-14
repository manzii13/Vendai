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

        Array.from(files).slice(0, max - images.length).forEach(file => {
            if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) return;
            newFiles.push(file);
            newPreviews.push(URL.createObjectURL(file));
        });

        onChange([...images, ...newFiles], [...previews, ...newPreviews]);
    };

    const removeImage = (index: number) => {
        const newFiles = images.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        onChange(newFiles, newPreviews);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        processFiles(e.dataTransfer.files);
    };

    return (
        <div className="space-y-3">
            {/* Drop Zone */}
            {images.length < max && (
                <label
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-all ${dragging
                        ? 'border-gold-400 bg-gold-400/5'
                        : 'border-[#2a2a2a] hover:border-[#3a3a3a] bg-[#0d0d0d]'
                        }`}
                >
                    <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={e => processFiles(e.target.files)}
                    />
                    <div className="text-3xl mb-2">🖼</div>
                    <p className="text-[#555] text-sm">
                        Drag & drop or <span className="text-gold-400">browse</span>
                    </p>
                    <p className="font-mono text-[10px] text-[#444] mt-1">
                        JPG, PNG, WEBP · MAX 5MB · UP TO {max} PHOTOS
                    </p>
                </label>
            )}

            {/* Previews */}
            {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                    {previews.map((src, i) => (
                        <div key={i} className="relative group aspect-square">
                            <img
                                src={src}
                                alt={`preview-${i}`}
                                className="w-full h-full object-cover rounded-lg border border-[#1a1a1a]"
                            />
                            {/* Cover badge */}
                            {i === 0 && (
                                <span className="absolute top-2 left-2 font-mono text-[9px] bg-gold-400 text-black px-2 py-0.5 rounded">
                                    COVER
                                </span>
                            )}
                            {/* Remove button */}
                            <button
                                type="button"
                                onClick={() => removeImage(i)}
                                className="absolute top-2 right-2 w-6 h-6 bg-black/80 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}