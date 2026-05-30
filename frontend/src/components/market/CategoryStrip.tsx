import { Link } from 'react-router-dom';
import { QUICK_CATEGORIES } from './MarketIcons';

interface Props {
    onSelect?: (label: string) => void;
}

export default function CategoryStrip({ onSelect }: Props) {
    return (
        <div className="flex gap-3 overflow-x-auto pb-1">
            {QUICK_CATEGORIES.map((cat) => {
                const inner = (
                    <>
                        <span
                            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${cat.bg} flex items-center justify-center text-lg font-bold shadow-sm`}
                        >
                            {cat.label.charAt(0)}
                        </span>
                        <span className="text-xs font-medium text-slate-700 mt-2">{cat.label}</span>
                    </>
                );

                if (onSelect) {
                    return (
                        <button
                            key={cat.label}
                            type="button"
                            onClick={() => onSelect(cat.label)}
                            className="flex flex-col items-center flex-shrink-0 hover:opacity-80 transition-opacity"
                        >
                            {inner}
                        </button>
                    );
                }

                return (
                    <Link
                        key={cat.label}
                        to={`/marketplace?category=${encodeURIComponent(cat.label)}`}
                        className="flex flex-col items-center flex-shrink-0 hover:opacity-80 transition-opacity"
                    >
                        {inner}
                    </Link>
                );
            })}
        </div>
    );
}
