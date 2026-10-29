"use client";

import { useToastStore } from "@/store/toast.store";
import { Button } from "./button";
import { X } from "lucide-react";
import { motion } from 'framer-motion';

export default function Toast() {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="absolute flex flex-col bottom-8 left-4 w-80 space-y-2 z-100">
            {toasts.map((toast) => {
                const indicatorColor = toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500';
                return (

                    <div key={toast.id} className="relative flex flex-row items-start justify-between pt-3 pb-2 px-4 bg-white rounded-sm border border-gray-200 shadow-lg shadow-gray-300 overflow-hidden">
                        <motion.div
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: 5000 / 1000, ease: "linear" }}
                            className={`absolute top-0 left-0 w-full h-1 ${indicatorColor}`}></motion.div>
                        <div className="flex flex-col gap-2">
                            <p className="flex-1">{toast.message}</p>
                            {toast.button}

                        </div>
                        <Button variant='outline' onClick={() => removeToast(toast.id)}><X /></Button>
                    </div>
                );
            })}
        </div>
    )
}