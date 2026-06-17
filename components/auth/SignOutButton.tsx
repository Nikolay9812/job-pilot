"use client";

import { signOut } from "@/actions/auth";
import { resetPostHogUser } from "@/lib/posthog-client";

export function SignOutButton() {
  return (
    <form action={signOut} className="mt-6">
      <button
        type="submit"
        onClick={resetPostHogUser}
        className="inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium leading-5 text-text-primary transition-colors hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Sign out
      </button>
    </form>
  );
}
