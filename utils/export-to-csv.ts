import { Feedback } from "@/constants/app_type";
import { getSentimentLabel } from "@/lib/utils";

export const exportFeedbackToCSV = (data: Feedback[], fileName?: string) => {
    if (!data || data.length === 0) return;

    // 1. Define the headers
    const headers = ["ID", "Feedback Content", "Sentiment", "Sentiment Score", "Source", "Customer Email", "Status", "Submitted At"];

    // 2. Map the data to rows
    const rows = data.map(item => {
        const sentimentLabel = getSentimentLabel(item?.ai_sentiment_score);

        return [
            item.id,
            // Escape quotes and wrap content in quotes to handle commas within the text
            `"${(item.content || '').replace(/"/g, '""')}"`,
            sentimentLabel,
            item.ai_sentiment_score?.toString() || "N/A",
            item.source || "",
            item.customer_email || "",
            item.status || "",
            item.inserted_at && new Date(item.inserted_at).toISOString()
        ];
    });

    // 3. Combine headers and rows into a single string
    const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
    ].join("\n");

    // 4. Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.setAttribute("href", url);
    link.setAttribute("download", fileName ?? `EchoBoard_Export_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};