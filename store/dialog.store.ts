import { create } from 'zustand';


interface DialogDetail {
    title: string,
    body?: React.ReactNode,
}

interface UIState {
    isShow: boolean;
    detail: DialogDetail;

    showDialog: (detail: DialogDetail) => void;
    closeDialog: () => void;
}

export const useDialog = create<UIState>((set, get) => ({
    isShow: false,
    detail: {
        title: "Dialog"
    },

    showDialog: (detail) => set({ isShow: true, detail: detail }),
    closeDialog: () => set({ isShow: false, detail: undefined })
}));
