"use client"
import Chip from "./components/chip";
import FeedCard from "./components/feed_card";
import { AppError, Feedback } from '../../../constants/app_type';
import { addNewFeed, deleteFeed, fetchFeeds } from "@/lib/actions/feed";
import { ChangeEvent, useEffect, useState } from "react";
import { BookOpenText, Loader2Icon, Plus, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDetailPane } from "@/store/detail_pane.store";
import { useRouter } from "next/navigation";
import { useDialog } from "@/store/dialog.store";

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
    const { showPane, detail } = useDetailPane();
    const [isLoading, setIsLoading] = useState(false);
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
        query?: string | undefined,
    }>({});


    useEffect(() => {
        fetchData();
        console.log("FETCHING DATA", params);
    }, [params])

    const fetchData = async () => {
        setIsLoading(true);
        const fetched = await fetchFeeds({
            params: params
        });

        setData(fetched);
        setIsLoading(false);

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
    const handleOnChange = (e: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
        const val = e.target.value;

        setParams({
            ...params,
            query: val,
        });
        console.log("Search", val);
    }

    const handleAddNewFeeds = () => {
        showPane({
            title: "Add New Feeds",
            body: <AddFeedsPane />
        });

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
            <div className="flex flex-row justify-between">
                <h1 className="font-bold text-3xl">Feedback Feed</h1>
                <DialogNoCloseButton />
            </div>

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
                <div className="flex flex-col md:flex-row gap-2">
                    <div className="flex flex-row flex-1 gap-2 bg-white p-2 border border-gray-300 rounded-md">
                        <Input
                            size={16}
                            type="text"
                            onChange={handleOnChange}
                            placeholder="Search" />
                        <button><Search /></button>

                    </div>
                    <div className="flex bg-white p-2 rounded-md border border-gray-300">
                        <Button
                            onClick={handleAddNewFeeds}
                            className="flex grow gap-2 items-center justify-center">
                            <Plus />
                            Add New Feed
                        </Button>

                    </div>

                </div>

                {isLoading ?
                    <LoadingComponent />
                    :
                    (feedback && feedback.length > 0 ?
                        <DataListComponent feedback={feedback} />
                        :
                        <NotFoundMessage />)
                }

            </div>

        </div>
    );
}

function LoadingComponent() {
    return (
        <div className="w-full h-full flex flex-row gap-4 items-center justify-center pt-24 text-gray-400">
            <Loader2Icon size={24} className="animate-spin" />
            <p className="flex items-center justify-center  text-sm">Loading...</p>
        </div>
    );
}

function DataListComponent({ feedback }: { feedback: Feedback[] }) {
    const router = useRouter();
    // const { showDialog } = useDialog();

    useFeedbackRealtime();

    const handleDelete = async ({ id, content }: Feedback) => {
        // showDialog({
        //     title: 'Delete Feed',
        //     body: <div>Are you sure to delete this content "{content}"</div>
        // })

        const { error } = await deleteFeed(id!);
        if (error) {
            return;
        }
        router.refresh();
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.isArray(feedback) && feedback.map((data, index) => {
                return (
                    <FeedCard key={index} data={data} onDelete={() => handleDelete(data)} />
                );
            })}

        </div>
    );

}

'use client'

import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'

export function useFeedbackRealtime() {
    const queryClient = useQueryClient()
    const supabase = createClient()

    useEffect(() => {
        // 1. Create the channel listener
        const channel = supabase
            .channel('realtime-feedback')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT, UPDATE, and DELETE
                    schema: 'public',
                    table: 'feedback',
                },
                (payload) => {
                    console.log('Change received!', payload)
                    // 2. Invalidate the query to trigger a background refetch
                    queryClient.invalidateQueries({ queryKey: ['feedback'] })
                }
            )
            .subscribe()

        // 3. Cleanup on unmount
        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, queryClient])
}


function NotFoundMessage() {
    return (
        <div className="w-full h-full flex flex-col gap-4 items-center justify-center pt-24 text-gray-400">
            <BookOpenText size={48} />
            <p className="flex items-center justify-center  text-sm">No feed is found.</p>
        </div>
    );
}

function AddFeedsPane() {
    const { closePane } = useDetailPane();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<AppError>();
    const [data, setData] = useState<Feedback[]>([]);

    const handleAddForm = () => {
        const id = window.crypto.randomUUID();
        const newData = {
            id: id,
            source: sources[0].name,
            content: '',
        };
        setData([...data, newData]);
    }

    const handleSave = async (e: FormData) => {
        setIsLoading(true);

        if (data.length < 1) {
            const error = { code: 400, message: "No Data Added." }
            setError(error);
            setIsLoading(false);
            return;
        }
        const { error, feedback } = await addNewFeed(
            data.map((e) => {
                return {
                    ...e,
                    id: undefined,
                }
            })
        );
        setIsLoading(false);

        if (error) {
            setError(error);
            return;
        }
        setData([]);
        closePane();
    }

    const handleOnChange = (id: string, feedback: Feedback) => {
        const index = data.findIndex((e) => e.id === id);
        data[index] = {
            ...data[index],
            ...feedback
        };
    }

    const handleOnRemove = (id: string) => {
        const newData = data.filter((e) => e.id === id);
        setData(newData);
    }

    return (
        <form action={handleSave}>
            {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded mb-4">{error.message}</div>}

            <div className="h-full max-h-screen flex flex-col justify-between gap-4">

                {data.map((item, index) => {
                    return (
                        <AddForm key={index}
                            onChange={(e) => handleOnChange(item.id!, e)}
                            onRemove={() => handleOnRemove(item.id!)} />
                    );
                })}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button
                        variant='outline'
                        type='button'
                        onClick={handleAddForm}
                        disabled={isLoading}><Plus />Add Form</Button>
                    <Button
                        variant='default'
                        type='submit'
                        disabled={isLoading}>Save</Button>
                </div>


            </div>
        </form>
    );
}

function AddForm({ onChange, onRemove }: { onChange: (feedback: Feedback) => void, onRemove: () => void }) {
    const [source, setSource] = useState(sources[0].name);

    const handleOnChange = (feedback: Feedback) => {
        if (feedback.source) setSource(feedback.source);
        onChange(feedback);
    }

    return (
        <div className="group flex flex-col gap-2 p-2 border border-gray-300 rounded-md">

            <div className="flex flex-col gap-2">
                <div className="flex flex-row justify-between">
                    <h4 className="text-sm font-medium text-foreground">Source</h4>
                    <Button
                        variant='outline'
                        type='button'
                        onClick={onRemove}
                        className="hidden group-hover:block"><X /></Button>
                </div>
                <div className="flex flex-row gap-1">

                    {sources.map(({ name }, index) => {
                        const isSelected = source === name;
                        const selectedStyle = isSelected ? 'bg-gray-300 font-medium' : '';
                        return (
                            <Chip
                                onClick={() => handleOnChange({ source: name })}
                                key={index}
                                name={name}
                                style={selectedStyle} />
                        );
                    })}

                </div>

            </div>

            <Input
                onChange={(e) => handleOnChange({ content: e.target.value })}
                placeholder="Enter Content"
                required
            />
            <Input
                onChange={(e) => handleOnChange({ customer_email: e.target.value })}
                placeholder="Enter Customer E-Mail Address"
                type="email"
                required
            />

        </div>
    );
}

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export function DialogNoCloseButton() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">No Close Button</Button>
            </DialogTrigger>
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>No Close Button</DialogTitle>
                    <DialogDescription>
                        This dialog doesn&apos;t have a close button in the top-right
                        corner.
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}
