import { GitBranch, Globe, ShieldCheck } from "lucide-react";

import { startOAuth } from "@/actions/auth";

type LoginCardProps = {
  errorMessage: string | null;
};

export function LoginCard({ errorMessage }: LoginCardProps) {
  return (
    <div className="grid w-full max-w-5xl overflow-hidden rounded-xl border border-border bg-surface shadow-card lg:grid-cols-2">
      <div className="landing-hero-glow flex min-h-[440px] flex-col justify-between border-b border-border p-8 sm:p-10 lg:border-b-0 lg:border-r">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium leading-4 text-text-secondary shadow-card">
            <ShieldCheck aria-hidden className="h-4 w-4 text-accent" />
            OAuth secured by InsForge
          </div>
          <h1 className="mt-8 max-w-xl text-5xl font-semibold leading-none text-text-slate sm:text-6xl lg:text-7xl">
            Sign in and let the agent prep your next application.
          </h1>
          <p className="mt-6 max-w-lg text-base font-normal leading-7 text-text-secondary sm:text-lg">
            Connect with Google or GitHub to start building your profile,
            matching jobs, and creating tailored application materials.
          </p>
        </div>

        <p className="mt-10 text-sm font-medium leading-5 text-text-secondary">
          New users are routed to profile setup after sign-in.
        </p>
      </div>

      <div className="flex flex-col justify-center p-8 sm:p-10">
        <div>
          <p className="text-sm font-medium leading-5 text-text-secondary">
            Welcome to
          </p>
          <h2 className="mt-2 text-3xl font-semibold leading-9 text-text-primary">
            JobPilot
          </h2>
          <p className="mt-3 text-sm font-normal leading-6 text-text-secondary">
            Choose your preferred provider to continue.
          </p>
        </div>

        {errorMessage ? (
          <div className="mt-6 rounded-md border border-error bg-surface px-4 py-3 text-sm font-medium leading-5 text-error">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-8 grid gap-3">
          <form action={startOAuth}>
            <input type="hidden" name="provider" value="google" />
            <button
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium leading-5 text-text-primary transition-colors hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Globe aria-hidden className="h-5 w-5 text-accent" />
              Continue with Google
            </button>
          </form>
          <form action={startOAuth}>
            <input type="hidden" name="provider" value="github" />
            <button
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium leading-5 text-text-primary transition-colors hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <GitBranch aria-hidden className="h-5 w-5 text-text-primary" />
              Continue with GitHub
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
