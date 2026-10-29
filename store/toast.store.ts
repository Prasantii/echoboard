import { create } from "zustand";

interface Toast {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    button?: React.ReactNode,
}


interface ToastState {
    toasts: Toast[];
    addToast: (toast: Toast) => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
    toasts: [],
    addToast: (toast) => {
        set((state) => ({ toasts: [...state.toasts, toast] }))

        setTimeout((delay: number) => {

            return get().removeToast(toast.id);
        }, 5000)
    },
    removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));