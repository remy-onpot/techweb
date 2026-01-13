import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isRateLimited } from '@/lib/rate-limit'; 

export async function middleware(request: NextRequest) {
  // 1. RATE LIMITING
  if (request.nextUrl.pathname.startsWith('/api') || request.nextUrl.pathname.startsWith('/admin')) {
    if (isRateLimited(request)) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please slow down.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // 2. SETUP RESPONSE
  // We create the response upfront to attach cookies to it later
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 3. INIT SUPABASE CLIENT
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Update the request cookies so the immediate getUser() call sees the new token
          request.cookies.set({
            name,
            value,
            ...options,
          });
          // Update the response cookies so the browser saves them
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // 4. CHECK USER SESSION
  const { data: { user } } = await supabase.auth.getUser();

  // 5. PROTECTED ROUTES: Admin Panel
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 6. AUTH ROUTES: Redirect logged-in users away from login
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