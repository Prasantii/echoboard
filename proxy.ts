// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from './utils/supabase/middleware';
// import { createClient } from '@/utils/supabase/middleware' // Need middleware version of client

export async function proxy(request: NextRequest) {
    // 1. Create a Supabase client capable of reading/writing cookies
    const { supabase, response } = createClient(request)

    // 2. Refresh session if it's expired (crucial for security)
    // This function automatically reads the token from the cookie
    const { data: { user } } = await supabase.auth.getUser()

    // 3. Define protected routes (your core app)
    const protectedRoutes = ['/', '/dashboard', '/feed'];
    const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname === route);

    // 4. Protection Logic:

    // If user is NOT logged in and tries to access a protected route
    if (!user && isProtectedRoute) {
        return NextResponse.redirect(new URL('/auth', request.url))
    }

    // If user IS logged in and tries to access login/signup pages
    if (user && (request.nextUrl.pathname === '/auth' || request.nextUrl.pathname === '/signup')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Allow the request to continue normally
    return response
}

export const config = {
    // Matcher allows you to filter Middleware to run on specific paths.
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}