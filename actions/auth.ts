"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthActions } from "@insforge/sdk/ssr";

type OAuthProvider = "google" | "github";

const OAUTH_PROVIDERS: OAuthProvider[] = ["google", "github"];
const CODE_VERIFIER_COOKIE = "insforge_code_verifier";

function isOAuthProvider(value: FormDataEntryValue | null): value is OAuthProvider {
  return typeof value === "string" && OAUTH_PROVIDERS.includes(value as OAuthProvider);
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function startOAuth(formData: FormData): Promise<void> {
  const provider = formData.get("provider");

  if (!isOAuthProvider(provider)) {
    redirect("/login?error=provider_unavailable");
  }

  const cookieStore = await cookies();
  const auth = createAuthActions({ cookies: cookieStore });
  const { data, error } = await auth.signInWithOAuth(provider, {
    redirectTo: new URL("/api/auth/callback", getAppUrl()).toString(),
    additionalParams: provider === "google" ? { prompt: "select_account" } : undefined,
    skipBrowserRedirect: true,
  });

  if (error || !data.url || !data.codeVerifier) {
    console.error("[actions/auth]", error);
    redirect("/login?error=oauth_start_failed");
  }

  cookieStore.set(CODE_VERIFIER_COOKIE, data.codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  redirect(data.url);
}

export async function signOut(): Promise<void> {
  const cookieStore = await cookies();
  const auth = createAuthActions({ cookies: cookieStore });
  const { error } = await auth.signOut();

  if (error) {
    console.error("[actions/auth]", error);
  }

  redirect("/login");
}
