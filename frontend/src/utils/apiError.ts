/** Human-readable message from axios-style API errors */
export function getApiErrorMessage(err: unknown, fallback: string): string {
    if (typeof err === 'object' && err !== null && 'code' in err) {
        const code = (err as { code?: string }).code;
        if (code === 'ERR_NETWORK' || code === 'ECONNABORTED') {
            return 'Cannot reach the server. Ensure the backend is running on port 5000 and CORS allows this app URL.';
        }
    }
    if (typeof err === 'object' && err !== null && 'message' in err) {
        const msg = String((err as { message?: string }).message);
        if (msg.includes('Network Error') || msg.includes('CORS')) {
            return 'Connection blocked (often CORS or backend offline). Restart the backend after pulling latest changes.';
        }
    }
    if (typeof err === 'object' && err !== null && 'response' in err) {
        const res = (err as { response?: { status?: number; data?: { message?: string } } }).response;
        if (res?.data?.message && typeof res.data.message === 'string') return res.data.message;
        if (res?.status === 403) {
            return 'Access denied. Sign in with an admin account (demo-admin@vendxx.local after seed).';
        }
        if (res?.status === 401) return 'Session expired or missing token. Sign in again.';
        if (res?.status === 404) {
            return 'Admin API not found. Restart the backend (npm run build && docker compose restart backend).';
        }
    }
    return fallback;
}
