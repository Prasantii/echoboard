// store/useUIStore.ts
import React from 'react';
import { create } from 'zustand'

interface PaneDetail {
    title: string | undefined,
    body?: React.ReactNode | undefined,
}

// State interface
interface UIState {
    isShow: boolean;
    detail: PaneDetail;

    showPane: (detail: PaneDetail) => void;
    closePane: () => void;
}

export const useDetailPane = create<UIState>((set, get) => ({
    isShow: false,
    detail: {
        title: "Detail Pane Title",
    },

    showPane: (detail) => {
        if (get().isShow) {
            set({ isShow: false })
            setTimeout(() => {
                set({ isShow: true, detail: detail },)
            }, 50)

        } else {
            set({ isShow: true, detail: detail });
        }
    },
    closePane: () => set({ isShow: false })
}));