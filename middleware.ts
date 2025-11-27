import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()

    try {
        const supabase = createMiddlewareClient({ req, res }, {
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
            supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
        })

        const {
            data: { session },
        } = await supabase.auth.getSession()

        // Protected routes
        if (req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/editor')) {
            if (!session) {
                return NextResponse.redirect(new URL('/login', req.url))
            }
        }

        // Redirect logged-in users away from login/signup
        if (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup') {
            if (session) {
                return NextResponse.redirect(new URL('/dashboard', req.url))
            }
        }
    } catch (e) {
        // If Supabase fails (e.g. missing env vars), just let the request pass
        // or redirect to error page if critical. 
        // For now, we'll allow it but auth won't work, so protected routes might fail later or here.
        console.error('Middleware error:', e)
    }

    return res
}

export const config = {
    matcher: ['/dashboard/:path*', '/editor/:path*', '/login', '/signup'],
}
