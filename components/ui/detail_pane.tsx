// components/detail-pane.tsx
'use client';

import { useState } from 'react';
// import { useUIStore } from '@/store/useUIStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
// import { formatDistanceToNow } from 'date-fns'; // useful for dates (npm install date-fns)
import { Inbox, BrainCircuit, BotMessageSquare, Mail, MessageSquareText, ThumbsUp, ThumbsDown, AlertCircle, LucideX } from 'lucide-react';
import { useDetailPane } from '@/store/detail_pane.store';

export function DetailPane() {
    const { isShow, detail, closePane } = useDetailPane();
    const visibilityStyle = isShow ? "shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.05)] animate-slide-in" : "animate-slide-out";

    const handleHidePane = () => {
        closePane();
    }

    return (
        <div className={`absolute z-10 flex flex-col sha gap-4 p-4 h-full bg-white right-0 top-0 border border-l-gray-200 opacity-0 ${visibilityStyle}`}>

            <div className='flex flex-row justify-between'>
                <h1 className='font-medium'>{detail?.title ?? "Detail"}</h1>
                <button onClick={handleHidePane} className=''><LucideX size={24} /></button>
            </div>

            <hr />

            <div className='text-sm overflow-auto'>
                {detail?.body}
            </div>

        </div>
    );
}