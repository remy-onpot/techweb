import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isRateLimited } from '@/lib/rate-limit'; // Keep your rate limiter!

export async function middleware(request: NextRequest) {
  // 1. RATE LIMITING (First line of defense)
  if (request.nextUrl.pathname.startsWith('/api') || request.nextUrl.pathname.startsWith('/admin')) {
    if (isRateLimited(request)) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please slow down.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // 2. SETUP RESPONSE (Required for Cookie handling)
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 3. INIT SUPABASE CLIENT (The Modern Way)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // 4. CHECK USER SESSION
  // getUser() is safer than getSession() in middleware
  const { data: { user } } = await supabase.auth.getUser();

  // 5. PROTECTED ROUTES: Admin Panel
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 6. AUTH ROUTES: Kick logged-in users out of /login
  if (request.nextUrl.pathname.startsWith('/login')) {
    if (user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/admin/inventory';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*', 
    '/login', 
    '/api/:path*'
  ],
};