import { create } from 'zustand'

type User = {
    id: string | null;
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
    id: validToken ? storedId : null,
    token: validToken ? storedToken : null,
    setToken: (token) => {
        localStorage.setItem('access_token', token);
        set({ token });
    },
    setId: (id) => {
        localStorage.setItem('id', id);
        set({ id });
    },
    clearToken: () => {
        localStorage.removeItem('access_token');
        set({ token: null });
    },
    clearId: () => {
        localStorage.removeItem('id');
        set({ id: null });
    }
}));