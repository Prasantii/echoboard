// utils/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    // We use createBrowserClient because this code runs in the user's browser.
    // It automatically looks for the Supabase cookies set by your Middleware.
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
    )
}