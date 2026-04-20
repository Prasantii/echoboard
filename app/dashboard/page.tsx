"use client"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { fetchFeeds } from '@/lib/actions/feed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, LucideChartBarDecreasing, MessageSquare, TriangleAlert } from 'lucide-react';
import SentimentOverview from "./components/sentiment_overview";
import FeedbackCategories from "./components/FeedbackCategories";
import { useFeedbackStat } from "./feed/hook/use-feedback-stat";

// This is a Next.js Server Component (Async by default)
export default function Index() {
    const { data, isPending, error } = useFeedbackStat();
    const totalFeedback = data?.totalFeedback ?? 0;
    const sentimentData = data?.sentimentData ?? [];
    const avgSentiment = data?.avgSentiment ?? 0;
    const totalCriticalIssues = data?.totalCriticalIssues ?? 0;
    const feedback = data?.feedback ?? [];

    // Fetch data from Supabase server-side
    // const { feedback, error } = await fetchFeeds({});

    if (isPending) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="p-10 text-red-500">Error loading dashboard. Check console.</div>;
    }

    return (
        <div className="flex-1 flex flex-col gap-8 items-center p-8 m-4">
            <header className="w-full max-w-7xl flex justify-between items-center pb-8 border-b">
                <h1 className="text-4xl font-bold text-slate-900">EchoBoard</h1>
                {/* We will add Auth button here on Day 5 */}
            </header>

            <main className="w-full max-w-7xl">
                <div className='flex flex-col mb-6'>
                    <h2 className="text-2xl font-semibold">Product Insights</h2>
                    <p>Analysis of customer feedback across all channels.</p>

                </div>

                <div className='flex flex-col gap-4'>
                    {/* Feedback Summary */}
                    <div className='grid lg:grid-cols-3 gap-4'>
                        <SummaryCard
                            icon={<MessageSquare />}
                            title='Total Feedback'
                            subtitle='Total Entries'
                            total={totalFeedback.toString()} />

                        <SummaryCard
                            color="bg-green-500/20"
                            icon={<Heart fill='var(--color-green-500)' color='transparent' />}
                            title='Avg. Sentiment'
                            subtitle='Satisfaction Score'
                            total={`${avgSentiment}/10`} />

                        <SummaryCard
                            color="bg-red-500/20"
                            icon={<TriangleAlert color='red' />}
                            title='Critical Issues'
                            subtitle='Urgent Action Required'
                            total={totalCriticalIssues.toString()} />
                    </div>

                    <div className='grid lg:grid-cols-2 gap-4'>
                        {/* Sentiment Overview */}
                        <SentimentOverview data={sentimentData} />

                        {/* Feedback Categories */}
                        <FeedbackCategories data={feedback!} />

                    </div>


                </div>


            </main>
        </div>
    );
}

function SummaryCard({ color: bgColor, icon, total, title, subtitle }:
    {
        color?: string,
        icon?: React.ReactNode,
        total: string,
        title: string,
        subtitle: string,
    }) {
    return (
        <Card>
            <CardHeader className='inline-flex items-center gap-2'>
                {icon && <div className={`${bgColor ?? 'bg-gray-300/30'} rounded-lg w-8 aspect-square p-1 flex items-center justify-center`}>
                    {icon}
                </div>}
                <CardTitle>{title}</CardTitle>
            </CardHeader>

            <CardContent className='ml-12'>
                <p className='text-3xl font-bold'>{total}</p>
                <p className=' text-gray-500'>{subtitle}</p>
            </CardContent>

        </Card>
    );
}
