import {
  updateSession,
  type CookieOptions,
  type CookieStore,
} from "@insforge/sdk/ssr/middleware";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/profile", "/find-jobs"];

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function createRequestCookieStore(request: NextRequest): CookieStore {
  function set(name: string, value: string, options?: CookieOptions): unknown;
  function set(options: { name: string; value: string } & CookieOptions): unknown;
  function set(
    nameOrOptions: string | ({ name: string; value: string } & CookieOptions),
    value?: string,
  ): unknown {
    if (typeof nameOrOptions === "string" && typeof value === "string") {
      request.cookies.set(nameOrOptions, value);
      return undefined;
    }

    if (typeof nameOrOptions !== "string") {
      request.cookies.set({
        name: nameOrOptions.name,
        value: nameOrOptions.value,
      });
    }

    return undefined;
  }

  return {
    get: (name: string) => request.cookies.get(name),
    set,
    delete: (nameOrOptions) => {
      if (typeof nameOrOptions === "string") {
        request.cookies.delete(nameOrOptions);
        return;
      }

      request.cookies.delete(nameOrOptions.name);
    },
  };
}

function withUpdatedCookies(redirectResponse: NextResponse, response: NextResponse): NextResponse {
  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next({ request });
  const result = await updateSession({
    requestCookies: createRequestCookieStore(request),
    responseCookies: response.cookies,
  });
  const isAuthenticated = Boolean(result.accessToken);
  const { pathname } = request.nextUrl;

  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return withUpdatedCookies(NextResponse.redirect(loginUrl), response);
  }

  if ((pathname === "/" || pathname === "/login") && isAuthenticated) {
    return withUpdatedCookies(
      NextResponse.redirect(new URL("/dashboard", request.url)),
      response,
    );
  }

  return response;
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*", "/profile/:path*", "/find-jobs/:path*"],
};
