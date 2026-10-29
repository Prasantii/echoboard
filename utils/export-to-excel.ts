import { Feedback } from '@/constants/app_type';
import { fetchFeeds } from '@/lib/actions/feed';
import { getSentimentLabel } from '@/lib/utils';
import * as XLSX from 'xlsx';

export const exportFeedbackToExcel = async (data?: Feedback[], fileName?: string) => {
    const feedbackData = data || [];
    if (!data || data.length === 0) {
        const { feedback, error } = await fetchFeeds({});

        if (error) {
            throw new Error(`Failed to fetch feedback data: ${error.message}`);
        }

        if (feedback)
            feedbackData.push(...feedback);
    }
    // 1. Map the data to pretty headers
    const worksheetData = feedbackData.map((item) => {
        const sentimentLabel = getSentimentLabel(item?.ai_sentiment_score);
        return {
            "ID": item.id,
            "Feedback Content": item.content,
            "Sentiment": sentimentLabel,
            "Sentiment Score": item.ai_sentiment_score?.toString() || "N/A",
            "Source": item.source,
            "Customer Email": item.customer_email,
            "Status": item.status,
            "Submitted At": item.inserted_at && new Date(item.inserted_at).toLocaleString(),
        };
    });

    // 2. Create a new Workbook and Worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();

    // 3. Append the sheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Feedback");

    // 4. Generate the file and trigger the download
    // 'writeFile' handles the browser download automatically
    XLSX.writeFile(workbook, fileName ?? `EchoBoard_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
};