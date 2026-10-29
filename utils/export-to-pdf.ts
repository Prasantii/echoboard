import { Feedback } from '@/constants/app_type';
import { getSentimentLabel } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable, { Color } from 'jspdf-autotable';
import { toPng } from 'html-to-image';
import FeedbackCategories from '../app/dashboard/components/FeedbackCategories';

export const exportFeedbackToPDF = async (data: any[], stats: any,
    { sentimentChartId, feedbackCategoriesId }:
        { sentimentChartId?: string; feedbackCategoriesId?: string }) => {
    const doc = new jsPDF();

    // 1. Setup Branding & Colors
    const primaryColor: Color = [63, 144, 129];
    const grayColor = [107, 114, 128];


    const sentimentChart = sentimentChartId && document.getElementById(sentimentChartId);
    const feedbackCategories = feedbackCategoriesId && document.getElementById(feedbackCategoriesId);


    // 1. Convert the Chart HTML element to a Base64 Image
    const sentimentChartImage = sentimentChart && await toPng(sentimentChart, { quality: 0.95 });
    const feedbackCategoriesImage = feedbackCategories && await toPng(feedbackCategories, { quality: 0.95 });

    // 2. Add Header (Title & Date)
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('EchoBoard Feedback Report', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

    // 3. Add Executive Summary (Stats Boxes)
    doc.setDrawColor(229, 231, 235);
    doc.line(14, 32, 196, 32); // Horizontal line

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Executive Summary', 14, 42);

    doc.setFontSize(11);
    doc.text(`Total Feedbacks: ${stats.total}`, 14, 52);
    doc.text(`Avg. Sentiment: ${stats.avgSentiment.toFixed(2)}/10`, 60, 52);
    doc.text(`Critical Issues: ${stats.totalCriticalIssues}`, 110, 52);

    const sentimentHeight = sentimentChartImage ? 64 : 0;
    const sentimentWidth = sentimentChartImage ? 86 : 0;
    sentimentChartImage && doc.addImage(sentimentChartImage, 'PNG', 14, 60, sentimentWidth, sentimentHeight);

    // const feedbackCategoriesHeight = feedbackCategoriesImage ? 116 : 0;
    const spaceBetweenCharts = sentimentChartImage ? 10 : 0;
    feedbackCategoriesImage && doc.addImage(feedbackCategoriesImage, 'PNG', 14 + sentimentWidth + spaceBetweenCharts, 60, sentimentWidth, sentimentHeight);



    // 4. Generate the Table
    const tableRows = data.map((item, index) => {
        const sentiment = getSentimentLabel(item.ai_sentiment_score);

        return [
            index + 1,
            item.content,
            sentiment,
            item.ai_sentiment_score?.toFixed(2) ?? 'N/A',
            item.ai_category || 'N/A',
            "" + (item.inserted_at ? new Date(item.inserted_at).toLocaleDateString() : 'N/A'),
            // new Date(item.inserted_at ?? '').toLocaleDateString()
        ]
    });

    autoTable(doc, {
        startY: sentimentHeight + 60,
        head: [['#', 'Feedback Content', 'Sentiment', 'Score', 'Category', 'Date']],
        body: tableRows,
        headStyles: { fillColor: primaryColor },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        columnStyles: {
            1: { cellWidth: 80 }, // Content column is wider
        },
        margin: { top: 60 },
    });


    // 5. Save the PDF
    doc.save(`EchoBoard_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};