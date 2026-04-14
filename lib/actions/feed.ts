"use server"
import { Feedback } from "@/constants/app_type";
import { createClient } from "@/utils/supabase/server";

export async function fetchFeeds({ params }: {
    params?: {
        source?: string | undefined,
        sentiment?: string | undefined,
        status?: string | undefined,
        query?: string | undefined,
    }
}): Promise<{
    feedback: Feedback[] | null,
    error: {
        code: number,
        message: string,
    } | null
}> {
    try {
        const supabase = await createClient();

        // Fetch data from Supabase server-side
        let query = supabase
            .from('feedback')
            .select('*');

        if (params?.query) query = query.ilike('content', `%${params.query}%`);

        if (params?.status) query = query.eq('status', params.status);
        if (params?.sentiment) {
            if (params.sentiment.toLowerCase() === 'negative') {
                query = query.lt('ai_sentiment_score', 4);
            } else if (params.sentiment.toLowerCase() === 'neutral') {
                query = query.lt('ai_sentiment_score', 7).gte('ai_sentiment_score', 4);

            } else {
                query = query.gte('ai_sentiment_score', 7);

            }

        }
        if (params?.source) query = query.eq('source', params.source);

        const { data: feedback, error } = await query;

        return {
            feedback: feedback,
            error: error && {
                code: Number(error?.code),
                message: error?.message,
            },
        };

    } catch (e) {
        return {
            feedback: [],
            error: {
                code: 500,
                message: "Error fetching data: " + e
            },
        }
    }
}

export async function changeStatus(id: string, status: string) {
    try {
        const supabase = await createClient();

        // Fetch data from Supabase server-side
        const { data: feedback, error } = await supabase
            .from('feedback')
            .update({
                status: status
            })
            .eq('id', id)
            .select();

        if (error) {
            throw Error(error.message);
        }

        return {
            feedback: feedback
        };

    } catch (e) {
        return {
            error: {
                code: 500,
                message: "Error resolving feed: " + e
            },
        }
    }
}

export async function addNewFeed(newData: Feedback[]) {
    try {
        const supabase = await createClient();

        // Fetch data from Supabase server-side
        const { data: feedback, error } = await supabase
            .from('feedback')
            .insert(newData)
            .select();

        if (error) {
            throw Error(error.message);
        }

        return {
            feedback: feedback
        };

    } catch (e) {
        return {
            error: {
                code: 500,
                message: "Error adding feeds: " + e
            },
        }
    }
}

export async function deleteFeed(id: string) {
    try {
        const supabase = await createClient();

        // Fetch data from Supabase server-side
        const { data: feedback, error } = await supabase
            .from('feedback')
            .delete()
            .eq('id', id)
            .select();

        if (error) {
            throw Error(error.message);
        }

        return {
            feedback: feedback
        };

    } catch (e) {
        return {
            error: {
                code: 500,
                message: "Error deleting feed: " + e
            },
        }
    }
}