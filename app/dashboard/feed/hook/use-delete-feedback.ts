import { deleteFeed } from "@/lib/actions/feed";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useDeleteFeedback() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await deleteFeed(id);
            console.log("ERRR", error);
            if (error) throw error;
        },

        onMutate: async (id) => {
            // 1. Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['feedback'] });

            // 2. Snapshot the previous value (for rollback)
            const previousFeedback = queryClient.getQueryData(['feedback']);

            // 3. Optimistically update the cache by removing the item
            queryClient.setQueryData(['feedback'], (old: any) =>
                old?.filter((item: any) => item.id !== id)
            );

            // 4. Return the context object with the snapshotted value
            return { previousFeedback };
        },

        // If the mutation fails, use the context we returned above
        onError: (err, id, context) => {
            queryClient.setQueryData(['feedback'], context?.previousFeedback);
            console.error("Delete failed, rolling back!", err);
        },

        // Always refetch after error or success to keep server in sync
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['feedback'] });
        },
    });
}