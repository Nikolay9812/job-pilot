import { ChevronDown, Search } from "lucide-react";

export function FindJobsFilters() {
  return (
    <section className="rounded-xl border border-border bg-surface px-5 py-3 shadow-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <label className="flex min-h-10 flex-1 items-center gap-3">
          <Search className="h-5 w-5 text-info-muted" aria-hidden="true" />
          <input
            type="text"
            placeholder="Filter by company or role..."
            className="w-full bg-transparent text-base font-medium leading-6 text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </label>

        <div className="hidden h-10 w-px bg-border lg:block" />

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-between gap-3 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium leading-5 text-text-dark shadow-card transition-colors hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:min-w-40"
          >
            All Matches
            <ChevronDown className="h-4 w-4 text-text-secondary" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-between gap-3 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium leading-5 text-text-dark shadow-card transition-colors hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:min-w-44"
          >
            Match Score
            <ChevronDown className="h-4 w-4 text-text-secondary" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
