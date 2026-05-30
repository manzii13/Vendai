/** Base URL for uploaded images (works with Vite dev proxy). */
export function getUploadBaseUrl(): string {
    const fromEnv = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '');
    if (fromEnv) return fromEnv;
    if (import.meta.env.DEV) return '';
    return 'http://localhost:5000';
}

export function uploadUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${getUploadBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}
