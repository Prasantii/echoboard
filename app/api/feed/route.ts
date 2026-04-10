import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();

    try {
        // Fetch data from Supabase server-side
        const { data: feedback, error } = await supabase.from('feedback').select('*');

        return NextResponse.json({
            feedback: feedback,
            error: error,
        });

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({
            error: error,
        })
    }

}