import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
}

interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, role: string) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            loading: false,
            error: null,

            login: async (email, password) => {
                set({ loading: true, error: null });
                try {
                    const { data } = await api.post('/auth/login', { email, password });
                    localStorage.setItem('token', data.token);
                    set({ user: data.user, token: data.token, loading: false });
                } catch (err: unknown) {
                    const error = err as { response?: { data?: { message?: string } } };
                    set({ error: error.response?.data?.message || 'Login failed', loading: false });
                }
            },

            register: async (name, email, password, role) => {
                set({ loading: true, error: null });
                try {
                    const { data } = await api.post('/auth/register', { name, email, password, role });
                    localStorage.setItem('token', data.token);
                    set({ user: data.user, token: data.token, loading: false });
                } catch (err: unknown) {
                    const error = err as { response?: { data?: { message?: string } } };
                    set({ error: error.response?.data?.message || 'Registration failed', loading: false });
                }
            },

            logout: () => {
                localStorage.removeItem('token');
                set({ user: null, token: null });
            },

            clearError: () => set({ error: null }),
        }),
        { name: 'auth-storage', partialize: (s) => ({ user: s.user, token: s.token }) }
    )
);