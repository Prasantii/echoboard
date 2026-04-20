'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { Feedback } from '@/constants/app_type';
import { addNewFeed } from '@/lib/actions/feed';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useAddFeedback() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    return useMutation({
        mutationFn: async (newData: Feedback[]) => {

            // 1. Get current user for RLS
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            if (newData.length < 1) {
                const error = { code: 400, message: "You have to add new data." }
                throw new Error(error.message);
            }

            // 2. Insert into Supabase
            const { feedback, error } = await addNewFeed(newData);

            if (error) throw error;
            return feedback;
        },
        onSuccess: () => {
            // 3. Refresh the feed automatically
            queryClient.invalidateQueries({ queryKey: ['feedback'] });
        },
    });
}