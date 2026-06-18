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
  const ownerAuthPage = path === "/owner/login" || path === "/owner/signup";
  const guestAuthPage = path === "/guest/login" || path === "/guest/signup";
  const isAuthPage = ownerAuthPage || guestAuthPage;
  // The permanent guest portal /guest/<token> is public (the token is the
  // credential) — it must not be gated behind login.
  const guestTokenPage = /^\/guest\/[0-9a-f]{40,}$/i.test(path);
  // Public owner storefront: /owner/<handle> and /owner/<handle>/<slug>
  // Static routes (login, signup, offer) take Next.js precedence so we only
  // need to exempt the dynamic handle pattern here.
  const ownerPublicPage =
    /^\/owner\/[a-z0-9][a-z0-9-]*(\/[a-z0-9][a-z0-9-]*)?$/i.test(path) &&
    !/^\/owner\/(login|signup|offer)(\/|$)/.test(path);

  // Gate the protected areas.
  if (!user && !isAuthPage && !guestTokenPage && !ownerPublicPage) {
    if (path.startsWith("/owner")) return redirectTo(request, "/owner/login");
    if (path.startsWith("/guest")) return redirectTo(request, "/guest/login");
  }

  // Signed in but sitting on an auth page → send to the right home.
  if (user && ownerAuthPage) return redirectTo(request, "/owner");
  if (user && guestAuthPage) return redirectTo(request, "/guest");

  return response;
}

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/owner/:path*", "/guest/:path*"],
};
