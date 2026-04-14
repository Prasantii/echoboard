'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Label } from 'recharts';
import { ChartConfig, ChartContainer } from '../../../components/ui/chart';

export default function FeedbackCategories({ data }: { data: any[] }) {
    // Flatten all tags and count them
    const allTags = data.flatMap(f => f.ai_tags || []);
    const tagCounts = allTags.reduce((acc: any, tag: string) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
    }, {});

    console.log(tagCounts);


    // const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f97316', '#06b6d4'];
    const COLORS = ['--color-red-400', '--color-green-400', '--color-amber-400', '--color-pink-400', '--color-blue-400'];

    const chartData = Object.keys(tagCounts).map((tag, index) => ({
        name: tag,
        value: tagCounts[tag],
        fill: `var(${COLORS[index]})`,
    })).slice(0, 5); // Just show top 5

    const chartConfig = Object.keys(tagCounts)
        .slice(0, 5)
        .reduce((acc, tag, index) => ({
            ...acc,
            [tag]: {
                label: tag,
                fill: `var(--primary)`
            }
        }), {}) satisfies ChartConfig; // Just show top 5


    console.log("CONFIG", chartConfig);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Top Feedback Tags</CardTitle>
            </CardHeader>
            <CardContent className="h-75">
                <ChartContainer
                    config={chartConfig}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
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
                                                    Top 5
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 16}
                                                    className="font-normal text-xs fill-muted-foreground"
                                                >
                                                    Tags
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />

                            {/* {chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))} */}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}