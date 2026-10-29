// import { createClient } from "@/utils/supabase/middleware";
// import { useMutation, useQueryClient } from "@tanstack/react-query";

// export function useImport() {
//      const queryClient = useQueryClient();

//     return useMutation({
//         mutationFn: async (data: any) => {
//             const newData: Feedback[] = [];


//             // 1. Get current user for RLS
//             const { data: { user } } = await supabase.auth.getUser();
//             if (!user) throw new Error("Not authenticated");

//             if (data[0]?.content) {
//                 newData.push(...data);
//             } else {
//                 newData.push(...formatToFeedback(data));
//             }

//             if (newData.length < 1) {
//                 const error = { code: 400, message: "You have to add new data." }
//                 throw new Error(error.message);
//             }
//             // 2. Insert into Supabase
//             const { feedback, error } = await addNewFeed(newData);

//             if (error) throw error;
//             return feedback;
//         },
//         onSuccess: () => {
//             // 3. Refresh the feed automatically
//             queryClient.invalidateQueries({ queryKey: ['feedback'] });
//         },
//     });
// }