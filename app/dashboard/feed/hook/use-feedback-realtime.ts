"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { useEffect } from 'react';

export function useFeedbackRealtime() {
    const queryClient = useQueryClient()
    const supabase = createClient()

    useEffect(() => {
        // 1. Create the channel listener
        const channel = supabase
            .channel('realtime-feedback')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT, UPDATE, and DELETE
                    schema: 'public',
                    table: 'feedback',
                },
                (payload) => {
                    console.log('Change received!', payload)
                    // 2. Invalidate the query to trigger a background refetch
                    queryClient.invalidateQueries({ queryKey: ['feedback'] })
                }
            )
            .subscribe()

        // 3. Cleanup on unmount
        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, queryClient])
}


