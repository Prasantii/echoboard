// app/api/analyze/route.ts
import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'; // Use the server client we made Day 1

// Initialize Groq client, pointing it to Groq's endpoint
const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(request: Request) {
    const supabase = await createClient();

    // 1. Parse incoming data (feedbackId and the raw content text)
    const { feedbackId, textContent } = await request.json();

    if (!feedbackId || !textContent) {
        return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    try {
        // 2. The AI Magic: Call Groq with a structured prompt
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are an expert customer feedback analyst. Your task is to analyze the provided feedback and return a structured JSON object.
          The JSON object MUST contain exactly these keys:
          - "ai_category" : (Categorize the content to "BUG" or "FEATURE")
          - "ai_sentiment_score": (A float number between 0.0 and 10.0, where 0 is extremely negative and 10 is extremely positive)
          - "ai_summary": (A 1-sentence concise summary of the main point)
          - "ai_tags": (An array of 2-3 colorful strings categorized like 'Bug', 'UI/UX', 'Feature Request', 'Mobile', etc.)
          - "ai_urgency": (The urgency based on the feedback, categorize based on Low (General feedback, praise, or minor UI suggestions), Medium (UX friction, feature requests, or performance issues), and High (Bugs, blockers, billing issues, or security concerns).)

          Do NOT include any markdown formatting, backticks, or extra text. Only return valid JSON.`
                },
                {
                    role: "user",
                    content: textContent,
                },
            ],
            // Use Llama 3 8B (fastest, cheapest, good enough for this task)
            model: "openai/gpt-oss-120b",
            temperature: 0.1, // Keeps responses predictable and structured
            stream: false,
        });

        console.log("RESPONSE AI", chatCompletion);

        // 3. Parse and Validate the AI Response
        const rawAiResponse = chatCompletion.choices[0]?.message?.content;

        if (!rawAiResponse) {
            throw new Error("No response from AI");
        }

        const aiData = JSON.parse(rawAiResponse); // Should be valid JSON now

        // 4. Save to Database: Update the specific feedback entry in Supabase
        const { data, error } = await supabase
            .from('feedback')
            .update({
                ai_category: aiData.ai_category,
                ai_sentiment_score: aiData.ai_sentiment_score,
                ai_summary: aiData.ai_summary,
                ai_tags: aiData.ai_tags,
                ai_urgency: aiData.ai_urgency,
            })
            .eq('id', feedbackId)
            .select();

        if (error) throw error;

        return NextResponse.json({ message: 'Analysis complete', data });

    } catch (error) {
        console.error('AI Analysis Error:', error);
        return NextResponse.json({ error: 'Failed to analyze feedback' }, { status: 500 });
    }
}