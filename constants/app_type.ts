export type Feedback = {
    id: string,
    content: string,
    source?: string | undefined,
    status?: string | undefined,
    customer_email?: string | undefined,
    ai_category?: string | undefined,
    ai_summary?: string | undefined,
    ai_sentiment_score?: number | undefined,
    ai_tags?: string[] | undefined,
    ai_urgency?: string | undefined,
}

export type SentimentOverviewData = {
    sentiment: string,
    resolved?: number,
    open?: number,
    fill: string,
    total: number,
}