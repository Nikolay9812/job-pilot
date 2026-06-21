import { Search, Sparkles } from "lucide-react";

export function SearchControls() {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-card">
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase leading-5 text-text-secondary">
            Job Title
          </span>
          <span className="flex min-h-12 items-center gap-3 rounded-md border border-border bg-surface px-4 py-2 shadow-sm">
            <Search className="h-5 w-5 text-info-muted" aria-hidden="true" />
            <input
              type="text"
              placeholder="Frontend Engineer"
              className="w-full bg-transparent text-base font-medium leading-6 text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase leading-5 text-text-secondary">
            Location
          </span>
          <span className="flex min-h-12 items-center rounded-md border border-border bg-surface px-4 py-2 shadow-sm">
            <input
              type="text"
              placeholder="Remote, New York..."
              className="w-full bg-transparent text-base font-medium leading-6 text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </span>
        </label>

        <button
          type="button"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-accent px-6 py-3 text-base font-semibold leading-6 text-accent-foreground shadow-card transition-colors hover:bg-accent-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Search className="h-5 w-5" aria-hidden="true" />
          Find Jobs
        </button>
      </div>

      <div className="mt-5 flex min-h-12 items-center gap-3 rounded-md border border-success-light bg-success-lightest px-4 py-3">
        <Sparkles className="h-5 w-5 text-success-alt" aria-hidden="true" />
        <p className="text-base font-semibold leading-6 text-success-darker">
          Found 8 jobs and saved 4 strong matches.
        </p>
      </div>
    </section>
  );
}
