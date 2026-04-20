'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { Feedback } from '@/constants/app_type';
import { addNewFeed, fetchFeeds } from '@/lib/actions/feed';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useFeedbackStat() {
    const queryClient = useQueryClient();
    const supabase = createClient();

    return useMutation({
        mutationFn: async () => {

            // 1. Get current user for RLS
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { feedback, error } = await fetchFeeds({});

            console.log("FED", feedback);

            if (error) throw error;

            const totalFeedback = feedback?.length ?? 0;

            // Sentiments
            let totalSentiment = 0;
            let totalPositive = {
                resolved: 0,
                total: 0,
            }
            let totalNegative = {
                resolved: 0,
                total: 0,
            };
            let totalNeutral = {
                resolved: 0,
                total: 0,
            }

            feedback?.map((e) => {
                const score = e.ai_sentiment_score ?? 0;
                totalSentiment += score;
                if (e.ai_sentiment_score) {
                    if (score < 4) {
                        totalNegative.total++;
                        if (e.status?.toLowerCase() === 'resolved') {
                            totalNegative.resolved++;
                        }
                    } else if (score < 8) {
                        totalNeutral.total++;
                        if (e.status?.toLowerCase() === 'resolved') {
                            totalNeutral.resolved++;
                        }

                    } else {
                        totalPositive.total++;
                        if (e.status?.toLowerCase() === 'resolved') {
                            totalPositive.resolved++;
                        }
                    }
                }
            })
            const avgSentiment = totalSentiment / totalFeedback;
            const totalNotAnalyzed = totalFeedback - (totalNegative.total + totalNeutral.total + totalPositive.total);
            const sentimentData = [
                {
                    sentiment: 'negative', total: totalNegative.total,
                    fill: "var(--color-red-400)",
                },
                {
                    sentiment: 'neutral', total: totalNeutral.total,
                    fill: "var(--color-gray-300)",
                },
                {
                    sentiment: 'positive', total: totalPositive.total,
                    fill: "var(--color-green-400)",
                },
                {
                    sentiment: 'N/A', total: 0, open: totalNotAnalyzed,
                    fill: "var(--color-gray-600)",

                }
            ]


            // Issues
            const totalCriticalIssues = feedback?.filter((e) => !e.ai_urgency || (e.ai_urgency ?? '').toLowerCase() == 'high').length ?? 0;





            return { totalFeedback, totalCriticalIssues, avgSentiment, sentimentData, feedback };
        },
        onSuccess: () => {
            // 3. Refresh the feed automatically
            queryClient.invalidateQueries({ queryKey: ['feedback-stat'] });
        },
    });
}