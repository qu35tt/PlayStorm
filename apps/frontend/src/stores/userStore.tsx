import { create } from 'zustand'

type User = {
    userId: string | null;
    token: string | null;
    setId: (id: string) => void;
    setToken: (token: string) => void;
    clearToken: () => void;
    clearId: () => void;
}

const storedToken = localStorage.getItem('access_token');
const storedId = localStorage.getItem('id');
const validToken = true;

export const useUserStore = create<User>((set) => ({
    userId: validToken ? storedId : null,
    token: validToken ? storedToken : null,
    setToken: (token) => {
        localStorage.setItem('access_token', token);
        set({ token });
    },
    setId: (id) => {
        localStorage.setItem('id', id);
        set({ userId: id });
    },
    clearToken: () => {
        localStorage.removeItem('access_token');
        set({ token: null });
    },
    clearId: () => {
        localStorage.removeItem('id');
        set({ userId: null });
    }
}));