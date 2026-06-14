import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Refreshes the Supabase session on every /owner request and gates the portal:
 * unauthenticated visitors are sent to /owner/login (except the auth pages).
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthPage =
    path === "/owner/login" || path === "/owner/signup";

  if (path.startsWith("/owner") && !isAuthPage && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/owner/login";
    return NextResponse.redirect(url);
  }

  // Already signed in but sitting on an auth page → send to the portal.
  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/owner";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/owner/:path*"],
};
