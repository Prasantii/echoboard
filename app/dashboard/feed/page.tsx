"use client"
import Chip from "./components/chip";
import FeedCard from "./components/feed_card";
import { Feedback } from '../../../constants/app_type';
import { fetchFeeds, } from "@/lib/actions/feed";
import React, { ChangeEvent, useState } from "react";
import { AlertCircle, BookOpenText, ChevronDown, Import, Loader2Icon, Plus, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDetailPane } from "@/store/detail_pane.store";
import { useDialog } from "@/store/dialog.store";
import useDeleteFeedback from "./hook/use-delete-feedback";
import { useQuery } from "@tanstack/react-query";
import { useFeedbackRealtime } from "./hook/use-feedback-realtime";
import { useAddFeedback } from "./hook/use-add-feedback";
import { AnimatePresence, motion } from "framer-motion";
import { ImportButton } from "./components/import_button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { exportFeedbackToExcel } from "@/utils/export-to-excel";
import LoadingComponent from "./components/loading";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { p } from "framer-motion/client";
import { useToastStore } from "@/store/toast.store";
import { exportFeedbackToCSV } from "@/utils/export-to-csv";
import { ImportButtonCsv } from "./components/import_button_csv";

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
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentPage = Number(searchParams.get('page')) || 1;
    const pageSize = 5;

    const { showPane, detail } = useDetailPane();
    // const [isLoading, setIsLoading] = useState(false);
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
        page?: number | undefined,
        pageSize?: number | undefined,
    }>({
        page: currentPage,
        pageSize: pageSize,
    });

    useFeedbackRealtime();

    const { data: feedbacks, isLoading, error } = useQuery({
        queryKey: ['feedback', params], // This is the ID for the cache
        queryFn: async () => {
            const { feedback, error, total } = await fetchFeeds({
                params: params,
            });

            if (error) throw error
            return { feedback, total };
        },
    });

    const feedback = feedbacks?.feedback;

    const handleSetParams = (
        newParams
            : {
                source?: string | undefined,
                sentiment?: string | undefined,
                status?: string | undefined,
                query?: string | undefined,
                page?: number | undefined,
                pageSize?: number | undefined,
            }) => {
        if (newParams.page === undefined) newParams.page = 1;
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

    const handleExport = () => {
        exportFeedbackToExcel();
    }

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', pageNumber.toString());
        handleSetParams({ page: Number(pageNumber) });
        return `${pathname}?${params.toString()}`;
    };

    const handlePageChange = (newPage: number) => {
        router.push(createPageURL(newPage));
    };

    // const { feedback, error } = data;

    if (error) {
        if (error.message === "Requested range not satisfiable") {
            createPageURL(1);
            return null;
        }
        return (
            <div className="flex flex-col items-center justify-center w-full h-full gap-4">
                <AlertCircle size={48} className="text-destructive" />
                <p className="text-xs font-medium text-destructive text-center">
                    Error({error.name}){'\n'}{error.message}
                </p>
            </div>
        );
    }

    const pagination = {
        total: feedbacks?.total || feedback?.length || 0,
        page: params.page!,
        pageSize: params.pageSize!,
        from: ((params.page! - 1) * params.pageSize!) + 1,
        to: Math.min((params.page! * params.pageSize!), feedbacks?.total ?? 0),
        hasPrevious: params.page && params.page > 1,
        hasNext: params.page && feedbacks?.total ? (params.page * params.pageSize!) < feedbacks.total : false
    }


    return (
        <div className="flex flex-col p-8 gap-6 bg-gray-50">
            {/* Page Title */}
            <div className="flex flex-row justify-between">
                <h1 className="flex-1 font-bold text-3xl">Feedback Feed</h1>
                {feedback && ((feedback.length ?? 0) > 0) &&
                    <ExportMenuDropdown feedback={feedback} />
                }
                {/* // <Button onClick={handleExport}>
                //     Export Excel
                // </Button>} */}

            </div>
            <ImportButton />

            {/* Filter */}
            <div className="flex flex-wrap gap-4 p-2 rounded-md bg-white border border-gray-300">
                <div className="flex flex-col gap-2">
                    <h4 className="text-sm font-medium text-foreground">Source</h4>
                    <div className="flex flex-wrap gap-1">

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
                    <div className="flex flex-wrap gap-1">
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
                    <div className="flex flex-wrap gap-1">
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

                {/* Search and Add Data */}
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
                        <AddMenuDropdown
                            handleManualAdd={handleAddNewFeeds}
                        />
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-row gap-2 items-center text-xs text-gray-400">
                        Items per page
                        <span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant='outline' size='sm' className="flex gap-1 text-gray-800">
                                        {params.pageSize} <span className="ml-1"><ChevronDown /></span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuGroup>
                                        {[5, 10, 20, 50].map((size) => (
                                            <DropdownMenuItem
                                                key={size}
                                                onSelect={(e) => {
                                                    e.stopPropagation();
                                                    handleSetParams({ pageSize: size });
                                                }}
                                            >
                                                {size}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuGroup>

                                </DropdownMenuContent>
                            </DropdownMenu>
                        </span>
                        | {pagination.from}-{pagination.to} of {pagination.total}
                    </div>
                    <div className="flex flex-row items-center gap-4">
                        <Button
                            onClick={() => handlePageChange((params.page ?? 1) - 1)}
                            variant='outline'
                            disabled={!pagination.hasPrevious}>Prev</Button>
                        <span className="text-sm text-gray-800">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant='outline' size='sm' className="flex gap-1 text-gray-800 pl-4">
                                        {params.page} <span className="ml-1"><ChevronDown /></span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuGroup>
                                        {Array.from({ length: Math.ceil(pagination.total / pagination.pageSize) }, (_, i) => i + 1).map((pageNum) => (
                                            <DropdownMenuItem
                                                key={pageNum}
                                                onSelect={(e) => {
                                                    e.stopPropagation();
                                                    handlePageChange(pageNum);
                                                }}
                                            >
                                                {pageNum}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuGroup>

                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* {[params.page! - 2, params.page! - 1, params.page!, params.page! + 1, params.page! + 2].map((pageNum) => {
                                if (pageNum < 1 || (pagination.total && pageNum > Math.ceil(pagination.total / pagination.pageSize))) {
                                    return null; // Skip invalid page numbers
                                }
                                const isCurrent = pageNum === params.page;
                                const pageStyle = isCurrent ? 'bg-gray-300 font-medium' : 'hover:bg-gray-200';
                                return (
                                    <Button
                                        key={pageNum}
                                        variant='link'
                                        size='sm'
                                        className={pageStyle}
                                        onClick={() => handleSetParams({ page: pageNum })}
                                    >{pageNum}</Button>
                                );
                            })} */}

                            {/* {pagination.hasPrevious && "..."}
                            {' ' + params.page! + ' '}
                            {pagination.hasNext && "..."} */}

                        </span>
                        <Button
                            onClick={() => handlePageChange((params.page ?? 1) + 1)}
                            variant='outline'
                            disabled={!pagination.hasNext}>Next</Button>

                    </div>
                </div>

                {isLoading ?
                    <LoadingComponent />
                    :
                    (feedback && Array.isArray(feedback) && feedback.length > 0 ?
                        <DataListComponent feedback={feedback} />
                        :
                        <NotFoundMessage />)
                }

            </div>

        </div>
    );
}

function ExportMenuDropdown({ feedback }: { feedback: Feedback[] }) {

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImport = () => {
        fileInputRef.current?.click();
    }

    const handleExportToExcel = () => {
        exportFeedbackToExcel(feedback);
    }

    const handleExportToCsv = () => {
        exportFeedbackToCSV(feedback);
    }

    return (
        <>
            <ImportButton ref={fileInputRef} />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button>
                        Export Data
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Export</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={(e) => {
                            e.stopPropagation();
                            handleExportToExcel();
                        }} >
                            Export to Excel
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => {
                            e.stopPropagation();
                            handleExportToCsv();
                        }}>
                            Export to CSV
                        </DropdownMenuItem>
                    </DropdownMenuGroup>

                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}

function AddMenuDropdown({ handleManualAdd }: {
    handleManualAdd?: () => void,
}) {

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const fileCsvInputRef = React.useRef<HTMLInputElement>(null);

    const handleImportFromExcel = () => {
        fileInputRef.current?.click();
    }
    const handleImportFromCsv = () => {
        fileInputRef.current?.click();
    }

    const handleDownload = () => {
        exportFeedbackToExcel([{
            id: 'sample-id',
            content: 'This is a sample feedback content.',
            source: 'Email',
            status: 'Open',
        }],
            "EchoBoard_Sample_Feedback.xlsx");
    }

    return (
        <>
            <ImportButton ref={fileInputRef} />
            <ImportButtonCsv ref={fileCsvInputRef} />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        className="flex grow gap-2 items-center justify-center">
                        <Plus />
                        Add New Feed
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuGroup>
                        <DropdownMenuItem onSelect={(e) => {
                            e.stopPropagation();
                            handleManualAdd && handleManualAdd();
                        }} >
                            Add Manually
                        </DropdownMenuItem>
                        <DropdownMenuLabel>Import</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={(e) => {
                            handleImportFromExcel();
                            e.stopPropagation();
                        }}>
                            Import Excel
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => {
                            handleImportFromCsv();
                            e.stopPropagation();
                        }}>
                            Import CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => {
                            e.stopPropagation();
                            handleDownload && handleDownload();
                        }}>
                            Download Excel
                        </DropdownMenuItem>

                    </DropdownMenuGroup>

                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}


function DataListComponent({ feedback }: { feedback: Feedback[] }) {
    const deleteMutation = useDeleteFeedback();
    const { showDialog, closeDialog } = useDialog();


    const deleteAlert = async ({ id, content }: Feedback) => {
        showDialog({
            title: 'Delete Feed',
            message: `Are you sure you want to delete this content?\n"${content}"`,
            confirmButton: (
                <Button
                    variant='destructive'
                    onClick={() => handleDelete(id!)}>
                    Delete
                </Button>)
        })
    }

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id);
        closeDialog();
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence
            >
                {Array.isArray(feedback) && feedback.map((data, index) => {
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            layout // This handles smooth sliding when items move
                        >
                            <FeedCard data={data} onDelete={() => deleteAlert(data)} />
                        </motion.div>
                    );
                })}

            </AnimatePresence>

        </div>
    );

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
    const { mutate, isPending, error, isError } = useAddFeedback();
    const { addToast } = useToastStore();

    const { closePane } = useDetailPane();
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
        mutate(data, {
            onSuccess: () => closePane(),
            onError: (e) => {
                addToast({
                    id: window.crypto.randomUUID(),
                    message: e.message,
                    type: 'error',
                });
            }
        });
    }

    console.log("PENDING", isPending);

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
                            data={item}
                            onChange={(e) => handleOnChange(item.id!, e)}
                            onRemove={() => handleOnRemove(item.id!)} />
                    );
                })}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button
                        variant='outline'
                        type='button'
                        onClick={handleAddForm}
                        disabled={isPending}><Plus />Add Form</Button>
                    <Button
                        variant='default'
                        type='submit'
                        disabled={isPending}>{isPending ? 'Saving..' : 'Save'}</Button>
                </div>


            </div>
        </form>
    );
}

function AddForm({ data, onChange, onRemove }: { data?: Feedback, onChange: (feedback: Feedback) => void, onRemove: () => void }) {
    const [source, setSource] = useState(data?.source ?? sources[0].name);
    const [content, setContent] = useState(data?.content ?? '');
    const [mail, setMail] = useState(data?.customer_email ?? '');

    const handleOnChange = (feedback: Feedback) => {
        if (feedback.source) setSource(feedback.source);
        if (feedback.content) setContent(feedback.content);
        if (feedback.customer_email) setMail(feedback.customer_email);
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
                        className="hidden group-hover:flex h-5 w-5 items-center justify-center"><X size={4} /></Button>
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
                value={content}
                required
            />
            <Input
                onChange={(e) => handleOnChange({ customer_email: e.target.value })}
                placeholder="Enter Customer E-Mail Address"
                type="email"
                value={mail}
                required
            />

        </div>
    );
}
