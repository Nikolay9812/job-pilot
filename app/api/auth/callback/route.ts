import { createAuthActions } from "@insforge/sdk/ssr";
import { NextResponse, type NextRequest } from "next/server";

const CODE_VERIFIER_COOKIE = "insforge_code_verifier";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const code = request.nextUrl.searchParams.get("insforge_code");
  const oauthError = request.nextUrl.searchParams.get("error");

  if (oauthError || !code) {
    if (oauthError) {
      console.error("[api/auth/callback]", oauthError);
    }

    return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
  }

  const codeVerifier = request.cookies.get(CODE_VERIFIER_COOKIE)?.value;

  if (!codeVerifier) {
    return NextResponse.redirect(new URL("/login?error=missing_verifier", request.url));
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  const auth = createAuthActions({
    requestCookies: request.cookies,
    responseCookies: response.cookies,
  });
  const { data, error } = await auth.exchangeOAuthCode(code, codeVerifier);

  if (error || !data?.user) {
    console.error("[api/auth/callback]", error);
    return NextResponse.redirect(new URL("/login?error=exchange_failed", request.url));
  }

  response.cookies.delete(CODE_VERIFIER_COOKIE);

  return response;
}
