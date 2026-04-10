import { create } from 'zustand'


// State interface
interface UIState {
    isShow: boolean;

    toggle: () => void;
}

export const useSidebar = create<UIState>((set, get) => ({
    isShow: true,

    toggle: () => {
        set({ isShow: !get().isShow });
    },
}));