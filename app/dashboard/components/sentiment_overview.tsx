
"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { SentimentOverviewData } from '@/constants/app_type';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

const chartConfig = {
    negative: {
        label: "Negative",
        color: "var(--color-red-600)",
    },
    neutral: {
        label: "Neutral",
        color: "var(--color-gray-200)",
    },
    positive: {
        label: "Positive",
        color: "var(--color-green-600)",
    },
} satisfies ChartConfig

export default function SentimentOverview({ data }: { data: SentimentOverviewData[] }) {
    return (
        <Card id='sentiment-overview'>
            <CardHeader>
                <CardTitle>
                    Sentiment Overview
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart accessibilityLayer data={data}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="sentiment"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        {/* <Bar
                            dataKey="resolved"
                            stackId="a"
                            fill="var(--color-resolved)"
                            radius={[0, 0, 4, 4]}
                        /> */}
                        <Bar
                            dataKey="total"
                            // stackId="a"
                            radius={4}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
