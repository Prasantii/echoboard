"use client"
import Chip from "./components/chip";
import FeedCard from "./components/feed_card";
import { Feedback } from '../../../constants/app_type';
import { fetchFeeds } from "@/lib/actions/feed";
import { useEffect, useState } from "react";
import { BookOpenText } from "lucide-react";

const sources = [
    { name: 'Slack' },
    { name: 'Email' },
    { name: 'App Store' },
];

const sentiment = [
    { name: "Positive" },
    { name: "Neutral" },
    { name: "Negative" }
];

const status = [
    { name: "Open" },
    { name: "Resolved" }
];
export default function Feed() {
    const [data, setData] = useState<{
        feedback?: Feedback[] | null,
        error?: {
            code: number,
            message: string,
        } | null
    }>({});
    const [params, setParams] = useState<{
        source?: string | undefined,
        sentiment?: string | undefined,
        status?: string | undefined,
    }>({});


    useEffect(() => {
        fetchData();
        console.log("FETCHING DATA", params);
    }, [params])

    const fetchData = async () => {
        const fetched = await fetchFeeds({
            params: params
        });

        setData(fetched);

    }

    const handleSetParams = (
        newParams
            : {
                source?: string | undefined,
                sentiment?: string | undefined,
                status?: string | undefined,

            }) => {
        setParams({ ...params, ...newParams })
        console.log("New Params", params);
    }

    const { feedback, error } = data;

    if (error) {
        return (
            <div className="flex self-center w-full h-full">Error({error.code}) : {error.message}</div>
        );
    }

    return (
        <div className="flex flex-col p-8 gap-6 bg-gray-50">
            {/* Page Title */}
            <h1 className="font-bold text-3xl">Feedback Feed</h1>

            {/* Filter */}
            <div className="flex flex-wrap gap-4 p-2 rounded-md bg-white border border-gray-300">
                <div className="flex flex-col gap-2">
                    <h4 className="text-sm font-medium text-foreground">Source</h4>
                    <div className="flex flex-row gap-1">

                        {[{ name: 'All' }, ...sources].map(({ name }, index) => {
                            const isSelected = name === params.source || (name === 'All' && !params.source);
                            const selectedStyle = isSelected ? 'bg-gray-300 font-medium' : '';
                            const newSource = { source: name === 'All' ? undefined : name }
                            return (
                                <Chip
                                    onClick={() => handleSetParams(newSource)}
                                    key={index}
                                    name={name}
                                    style={selectedStyle} />
                            );
                        })}

                    </div>

                </div>

                <div className="flex flex-col gap-2">
                    <h4 className="text-sm font-medium text-foreground">Sentiment</h4>
                    <div className="flex flex-row gap-1">
                        {[{ name: 'All' }, ...sentiment].map(({ name }, index) => {
                            const isSelected = name.toLowerCase() === params.sentiment?.toLowerCase() || (name === 'All' && !params.sentiment);
                            const selectedStyle = isSelected ? 'bg-gray-300 font-medium' : '';
                            const newSentiment = { sentiment: name === 'All' ? undefined : name.toLowerCase() }
                            return (
                                <Chip
                                    onClick={() => handleSetParams(newSentiment)}
                                    key={index}
                                    name={name}
                                    style={selectedStyle} />
                            );
                        })}

                    </div>

                </div>

                <div className="flex flex-col gap-2">
                    <h4 className="text-sm font-medium text-foreground">Status</h4>
                    <div className="flex flex-row gap-1">
                        {[{ name: 'All' }, ...status].map(({ name }, index) => {
                            const isSelected = name.toLowerCase() === params.status?.toLowerCase() || (name === 'All' && !params.status);
                            const selectedStyle = isSelected ? 'bg-gray-300 font-medium' : '';
                            const newStatus = { status: name === 'All' ? undefined : name.toLowerCase() }
                            return (
                                <Chip
                                    onClick={() => handleSetParams(newStatus)}
                                    key={index}
                                    name={name}
                                    style={selectedStyle} />
                            );
                        })}

                    </div>

                </div>

            </div>

            {/* All Feedbacks */}
            <div className="flex flex-col gap-4">
                <h1 className="font-medium">All Feedbacks</h1>

                {
                    feedback && feedback.length > 0 ? <div className="grid sm: grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.isArray(feedback) && feedback.map((data, index) => {
                            return (
                                <FeedCard key={index} data={data} />
                            );
                        })}

                    </div>
                        :
                        <div className="w-full h-full flex flex-col gap-4 items-center justify-center pt-24 text-gray-400">
                            <BookOpenText size={48} />
                            <p className="flex items-center justify-center  text-sm">No feed is found.</p>
                        </div>
                }

            </div>

        </div>
    );
}

