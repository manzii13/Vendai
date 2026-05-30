import { Link, useLocation } from 'react-router-dom';
import { SIDEBAR_CATEGORIES, CategoryInitial, DeliveryPromoIcon } from './MarketIcons';

interface Props {
    activeCategory?: string;
    onCategorySelect?: (slug: string) => void;
}

export default function MarketSidebar({ activeCategory = '', onCategorySelect }: Props) {
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <aside className="hidden xl:block w-56 flex-shrink-0">
            <nav className="market-card p-3 space-y-0.5">
                {SIDEBAR_CATEGORIES.map((cat) => {
                    const isHomeLink = cat.slug === '';
                    const isActive = isHomeLink
                        ? isHome && !activeCategory
                        : activeCategory === cat.slug || activeCategory === cat.label;

                    if (isHomeLink) {
                        return (
                            <Link
                                key={cat.label}
                                to="/"
                                className={`market-sidebar-link ${isActive ? 'market-sidebar-link-active' : ''}`}
                            >
                                <CategoryInitial label={cat.label} />
                                {cat.label}
                            </Link>
                        );
                    }

                    if (onCategorySelect) {
                        return (
                            <button
                                key={cat.label}
                                type="button"
                                onClick={() => onCategorySelect(cat.slug === 'all' ? '' : cat.slug)}
                                className={`market-sidebar-link w-full ${isActive ? 'market-sidebar-link-active' : ''}`}
                            >
                                <CategoryInitial label={cat.label} />
                                {cat.label}
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={cat.label}
                            to={cat.slug === 'all' ? '/marketplace' : `/marketplace?category=${encodeURIComponent(cat.slug)}`}
                            className={`market-sidebar-link ${isActive ? 'market-sidebar-link-active' : ''}`}
                        >
                            <CategoryInitial label={cat.label} />
                            {cat.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="market-card mt-4 p-4 bg-gradient-to-br from-market-50 to-market-100/80 border-market-200/60">
                <DeliveryPromoIcon className="w-10 h-10 text-market-700 mb-3" />
                <p className="text-sm font-semibold text-slate-800 leading-snug mb-1">
                    Free delivery on orders above RWF 29,000
                </p>
                <p className="text-xs text-slate-500 mb-4">Limited time offer in Kigali</p>
                <Link to="/marketplace" className="market-btn-primary w-full text-center text-sm py-2">
                    Shop now
                </Link>
            </div>
        </aside>
    );
}
