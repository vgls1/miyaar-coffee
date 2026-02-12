import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import api from '@/lib/axios';

interface User {
    id: number;
    email: string;
    name: string;
    role: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
    fetchProfile: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: Cookies.get('token') || null,
            isAuthenticated: !!Cookies.get('token'),

            login: (token: string) => {
                Cookies.set('token', token, { expires: 7 }); // 7 days
                set({ token, isAuthenticated: true });
                // Immediately fetch profile after login
                get().fetchProfile();
            },

            logout: () => {
                Cookies.remove('token');
                set({ user: null, token: null, isAuthenticated: false });
            },

            fetchProfile: async () => {
                try {
                    const { data } = await api.get<User>('/users/profile');
                    set({ user: data });
                } catch (error) {
                    console.error("Failed to fetch profile", error);
                    // If 401, logout
                    get().logout();
                }
            },
            
            updateProfile: async (data: Partial<User>) => {
                 await api.patch('/users/profile', data);
                 // Optimistic update or refetch
                 set((state) => ({
                    user: state.user ? { ...state.user, ...data } : null
                 }));
            }
        }),
        {
            name: 'auth-storage', // name of the item in the storage (must be unique)
            partialize: (state) => ({ user: state.user }), // Only persist user info in localStorage, token is in cookies/state
        }
    )
);
