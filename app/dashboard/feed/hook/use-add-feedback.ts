'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { Feedback } from '@/constants/app_type';
import { addNewFeed } from '@/lib/actions/feed';
import { z } from 'zod';
import { source } from 'framer-motion/client';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


function validateFeedbackData(data: any): Feedback[] {

    const feedbackSchema = z.object({
        content: z.string().min(10, "Feedback must be at least 10 characters"),
        source: z.string(),
    });

    let dataOnly: Feedback[] = [];
    console.log("Raw data received for validation:", typeof (data));
    if (data[0]?.content) {
        dataOnly = data;
    } else {
        dataOnly = data.filter((e: any) => e['ID']?.toString() !== "sample-id").map((e: any) => {
            return {
                content: e['Feedback Content'] || '',
                source: e.Source || '',
                customer_email: e['Customer Email'] || '',
            };
        });
    }

    let error: string[] = [];

    // Inside your useMutation's mutationFn:
    const formattedData = dataOnly.map((row) => {
        const result = feedbackSchema.safeParse({
            content: row.content,
            source: row.source,
        });

        if (!result.success) {
            // You can skip invalid rows or throw an error
            console.warn("Invalid row skipped:", result.error);
            error.push(`Row with content "${row.content}" is invalid: ${result.error.issues[0].message}`);
            // throw new Error(`Validation failed for feedback: ${result.error.issues[0].message}`);
            return null;
        }
        return { ...result.data };
    }).filter(Boolean); // Remove the nulls

    if (error.length > 0) {
        throw new Error(`Validation failed for some rows:\n${error.join('\n')}`);
    }

    return formattedData as Feedback[];
}

export function useAddFeedback() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    return useMutation({
        mutationFn: async (data: any) => {
            const newData: Feedback[] = validateFeedbackData(data);

            // if (data[0]?.content) {
            //     newData.push(...data);
            // } else {
            //     newData.push(...formatToFeedback(data));
            // }

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

function formatToFeedback(data: any): Feedback[] {
    return data.filter((e: any) => e['ID']?.toString() !== "sample-id").map((e: any) => {
        return {
            content: e['Feedback Content'] || '',
            source: e.Source || '',
            customer_email: e['Customer Email'] || '',
        };

    });
}