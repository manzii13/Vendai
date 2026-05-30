export function SearchIcon({ className = 'w-5 h-5' }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
        </svg>
    );
}

export function CartIcon({ className = 'w-5 h-5' }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h15l-1.5 9H7.5L6 6zm0 0L5 3H2M9 20a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
    );
}

export function HeartIcon({ className = 'w-5 h-5' }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
    );
}

export function CategoryInitial({ label, className = '' }: { label: string; className?: string }) {
    const text = label === 'More Categories' ? '…' : label.charAt(0).toUpperCase();
    return (
        <span
            className={`w-6 h-6 rounded-md bg-market-100 text-market-800 text-xs font-bold flex items-center justify-center flex-shrink-0 ${className}`}
            aria-hidden
        >
            {text}
        </span>
    );
}

export function TrustIcon({ name, className = 'w-6 h-6' }: { name: 'shield' | 'support' | 'returns' | 'delivery'; className?: string }) {
    const paths: Record<string, string> = {
        shield: 'M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z',
        support: 'M4 11v2a8 8 0 0016 0v-2M12 19v2M8 11h8',
        returns: 'M4 12h4l2-3 4 6 4-6 2 3h4',
        delivery: 'M3 8h11v8H3V8zm11 2h4l2 3v3h-6v-6z M7 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm10 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
    };
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
        </svg>
    );
}

export function DeliveryPromoIcon({ className = 'w-10 h-10' }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h11v8H3V8zm11 2h4l2 3v3h-6v-6zM7 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm10 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        </svg>
    );
}

export const SIDEBAR_CATEGORIES = [
    { label: 'Home', slug: '' },
    { label: 'Fruits & Vegetables', slug: 'Fruits' },
    { label: 'Dairy & Eggs', slug: 'Dairy' },
    { label: 'Meat & Fish', slug: 'Meat' },
    { label: 'Bakery', slug: 'Bakery' },
    { label: 'Beverages', slug: 'Beverages' },
    { label: 'Snacks & Chips', slug: 'Snacks' },
    { label: 'Grocery & Staples', slug: 'Groceries' },
    { label: 'Personal Care', slug: 'Beauty' },
    { label: 'Home Care', slug: 'Home' },
    { label: 'Baby Care', slug: 'Baby' },
    { label: 'Pet Care', slug: 'Pet' },
    { label: 'More Categories', slug: 'all' },
] as const;

export const QUICK_CATEGORIES = [
    { label: 'Fruits', bg: 'bg-red-100 text-red-800' },
    { label: 'Dairy', bg: 'bg-sky-100 text-sky-800' },
    { label: 'Meat', bg: 'bg-rose-100 text-rose-800' },
    { label: 'Bakery', bg: 'bg-amber-100 text-amber-800' },
    { label: 'Drinks', bg: 'bg-lime-100 text-lime-800' },
    { label: 'Snacks', bg: 'bg-orange-100 text-orange-800' },
    { label: 'Grocery', bg: 'bg-yellow-100 text-yellow-800' },
    { label: 'Care', bg: 'bg-violet-100 text-violet-800' },
] as const;
