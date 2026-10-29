"use client"
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Feedback } from "@/constants/app_type";
import { AppWindow, Bug, Check, Ellipsis, Sparkles, Trash2 } from "lucide-react";
import Chip from "./chip";
import { useDetailPane } from "@/store/detail_pane.store";
import { Button } from '@/components/ui/button';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Label, Pie, PieChart } from 'recharts';
import { useState } from 'react';
import { getSentimentLabel, titleCase } from '@/lib/utils';
import { redirect, useRouter } from 'next/navigation';
import { changeStatus, deleteFeed } from '@/lib/actions/feed';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function FeedCard({ data, onDelete }: { data: Feedback, onDelete?: () => void }) {
    const router = useRouter();
    const [showMenu, setShowMenu] = useState(false);
    const { showPane, detail } = useDetailPane();

    const handleShowDetail = () => {
        showPane({
            title: "Feedback Detail",
            body: <FeedbackDetail feedback={data} />
        });
    }

    return (
        <Card onClick={handleShowDetail} className="relative p-3 rounded-md gap-y-2 h-full">
            <div className="flex flex-row justify-between items-start">
                {getFeedCategory(data.ai_category)}
                {/* <form action={handleOpenAI}> */}
                <input hidden name="id" defaultValue={data.id} />
                <input hidden name="content" defaultValue={data.content} />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="link" className='p-2 h-6'>
                            <Ellipsis className="text-gray-600" size={14} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>Options</DropdownMenuLabel>
                            <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                onDelete!();
                            }} className='text-destructive'>
                                <span><Trash2 /></span>{' '}Delete
                            </DropdownMenuItem>
                        </DropdownMenuGroup>

                    </DropdownMenuContent>
                </DropdownMenu>


                {/* </form> */}

            </div>

            <div className="flex flex-col gap-1 items-start">
                <p className="text-gray-400 text-xs">Source</p>
                <Chip name={data.source ?? ''} />
            </div>

            <div className="flex flex-col gap-1 items-start">
                <p className="text-gray-400 text-xs">Status</p>
                {getStatusChip(data.status ?? "open")}
            </div>


            <div className="flex flex-col gap-1">
                <p className="text-gray-400 text-xs">Content</p>
                <p>{data.content ?? ''}</p>

            </div>

            <div className="flex flex-row justify-between">
                <div className="flex flex-col gap-1">
                    <p className="text-gray-400 text-xs">Urgency</p>
                    {getUrgencyChip(data.ai_urgency)}
                </div>

                <div className="flex flex-col gap-1">
                    <p className="text-gray-400 text-xs">Sentiment</p>
                    <p>{data.ai_sentiment_score}</p>

                </div>
            </div>
        </Card>
    );
}




function FeedbackDetail({ feedback }: { feedback: Feedback }) {
    const { closePane } = useDetailPane();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const notAnalyzed = !feedback.ai_sentiment_score;
    const isResolved = feedback.status === 'resolved';

    const handleAnalyze = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    feedbackId: feedback.id,
                    textContent: feedback.content,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                router.refresh();
                // Success! We need to refresh the data on the screen.
                // Option A (Fastest for sprint): router.refresh() if using Server Components
                // Option B (Portfolio Pro): TanStack Query invalidateQueries()
                // onAnalysisComplete(result.data[0]); // Pass updated data back to parent
            } else {
                alert('Error analyzing: ' + result.error);
            }
        } catch (error) {
            alert('Failed to connect to AI api.');
        } finally {
            closePane();
            setIsLoading(false);
        }
    }

    const handleResolve = async () => {
        setIsLoading(true);
        const { error } = await changeStatus(feedback.id!, isResolved ? 'open' : 'resolved');
        setIsLoading(false);

        if (error) {
            alert(error.message);
            return;
        }

        closePane();
        router.refresh();


    }


    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3">
                <Button variant={isResolved ? 'outline' : 'default'} onClick={handleResolve} disabled={isLoading}>
                    {!isResolved && <Check size={12} />}
                    {!isResolved ? "Resolve" : "Open"}
                </Button>
                {!notAnalyzed && <Button disabled={isLoading} onClick={handleAnalyze}>
                    <Sparkles />Re-Analyze
                </Button>}
                {/* <Button>Resolve</Button> */}
            </div>

            <p>"{feedback.content}"</p>
            <p>Customer E-Mail: {feedback.customer_email ?? '-'}</p>

            {notAnalyzed &&
                <Button disabled={isLoading} onClick={handleAnalyze}>
                    <Sparkles />
                    Analyze
                </Button>

            }

            {(feedback.ai_sentiment_score || feedback.ai_summary) &&
                <Card>
                    <CardHeader>
                        <CardTitle>
                            AI Insights
                        </CardTitle>
                    </CardHeader>

                    <CardContent className='space-y-2'>
                        <Card>
                            <CardContent className='font-medium gap-2'>
                                1. AI Summary
                                <p className='font-normal'>{feedback.ai_summary}</p>
                            </CardContent>
                        </Card>
                        <Card className='flex flex-col gap-1'>
                            <CardContent className='font-medium'>
                                2. AI Sentiment Score
                                <SentimentChart score={feedback.ai_sentiment_score} />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className='flex flex-col font-medium gap-2'>
                                3. Key Tags
                                <div className='flex flex-wrap gap-1'>
                                    {Array.isArray(feedback.ai_tags) && (
                                        feedback.ai_tags.map((tag, index) => {
                                            return (
                                                <Chip key={index} name={tag} />
                                            );
                                        })
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <Card >
                            <CardContent className='font-medium gap-2'>
                                4. Auto Action
                                <div className='font-normal flex flex-wrap gap-2 items-center'>
                                    Suggested Priority : {getUrgencyChip(feedback.ai_urgency)}
                                </div>
                            </CardContent>
                        </Card>
                    </CardContent>

                </Card>}

        </div>
    );

}

function getFeedCategory(category: string | undefined) {
    const catName = category?.toUpperCase();
    var cat: { name: string, icon?: React.ReactNode | undefined, style: string } | undefined;
    if (catName === "BUG") {
        cat = {
            name: catName,
            icon: <Bug size={12} />,
            style: 'text-destructive bg-destructive/20'
        }

    } else if (catName === "FEATURE") {
        cat = {
            name: catName,
            icon: <AppWindow size={12} />,
            style: 'text-green-600 bg-green-600/20'
        }
    } else {
        cat = {
            name: "Not Analyzed",
            style: 'text-muted bg-muted/20'
        }
    }

    return (
        <div className={`inline-flex gap-2 font-bold text-md`}>
            {cat.icon && <div className={`p-1 rounded-sm ${cat.style}`}>
                {cat.icon}
            </div>}
            {titleCase(catName ?? '')}
        </div>
    );
}

function getUrgencyChip(urgency: string | undefined) {
    var color = 'bg-muted';
    const urge = urgency?.toLowerCase();

    if (urge === 'low') {
        color = 'bg-green-600 border-0';
    } else if (urge === 'medium') {
        color = 'bg-amber-400 border-0';
    } else if (urge === 'high') {
        color = 'bg-destructive border-0';
    }

    return (
        <Chip
            name={urgency ?? 'Not Analyzed'}
            style={`w-fit ${color} ${urgency ? 'text-white' : 'text-gray-500'}`} />
    );
}

function getStatusChip(status: string | "resolved" | "open") {
    var style = 'bg-muted text-gray-600 border-gray-600';

    if (status.toLowerCase() === 'resolved') {
        style = 'bg-green-300/20 text-green-600 border-green-600';


    }

    return (
        <Chip name={titleCase(status) ?? ''} style={`w-fit font-medium border ${style}`} >

        </Chip>
    );
}


function SentimentChart({ score }: { score: number | undefined }) {
    const sentimentLabel = getSentimentLabel(score);

    if (sentimentLabel === "N/A") return;
    var range = "positive";
    var color = "primary";

    if (sentimentLabel === "NEGATIVE") {
        range = 'negative';
        color = 'destructive'
    } else if (sentimentLabel === "NEUTRAL") {
        range = 'neutral';
        color = 'gray';
    }


    const chartData = [
        { browser: "sentiment", score: score, fill: "var(--color-sentiment)" },
        { browser: "remaining", score: 10 - (score ?? 0), fill: "var(--color-remaining)" },
    ]
    const chartConfig = {
        score: {
            label: "Score",
        },
        sentiment: {
            label: "Sentiment",
            color: `var(--${color})`,
        },
        remaining: {
            label: "",
            color: "var(--muted)",
        },

    } satisfies ChartConfig;

    return (
        <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-30 min-h-20"
        >
            <PieChart>
                {/* <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                /> */}
                <Pie
                    data={chartData}
                    dataKey="score"
                    nameKey="browser"
                    innerRadius={36}
                    strokeWidth={1}
                >
                    <Label
                        content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                return (
                                    <text
                                        x={viewBox.cx}
                                        y={viewBox.cy}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                    >
                                        <tspan
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            className="fill-foreground text-lg font-bold"
                                        >
                                            {score}/10
                                        </tspan>
                                        <tspan
                                            x={viewBox.cx}
                                            y={(viewBox.cy || 0) + 16}
                                            className="font-normal text-xs fill-muted-foreground"
                                        >
                                            {range}
                                        </tspan>
                                    </text>
                                )
                            }
                        }}
                    />
                </Pie>
            </PieChart>
        </ChartContainer>
    );
}