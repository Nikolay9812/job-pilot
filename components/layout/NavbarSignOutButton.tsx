"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/actions/auth";
import { resetPostHogUser } from "@/lib/posthog-client";

export function NavbarSignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        onClick={resetPostHogUser}
        className="inline-flex items-center gap-2 text-sm font-semibold leading-5 text-text-secondary transition-colors hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Sign out
      </button>
    </form>
  );
}
