"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import { buildFindJobsHref, scoreFilterLabel } from "@/lib/jobs";
import type { JobListQuery, JobsMatchFilter, JobsSort } from "@/types/jobs";

type FindJobsFiltersProps = {
  query: JobListQuery;
};

export function FindJobsFilters({ query }: FindJobsFiltersProps) {
  const router = useRouter();

  function updateQuery(nextQuery: JobListQuery): void {
    router.replace(buildFindJobsHref(nextQuery, 1), { scroll: false });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = readText(formData.get("search"));
    updateQuery({ ...query, search, page: 1 });
  }

  function handleMatchFilterChange(value: string): void {
    updateQuery({ ...query, matchFilter: readMatchFilter(value), page: 1 });
  }

  function handleSortChange(value: string): void {
    updateQuery({ ...query, sort: readSort(value), page: 1 });
  }

  return (
    <section className="rounded-xl border border-border bg-surface px-5 py-3 shadow-card">
      <form
        key={query.search}
        className="flex flex-col gap-4 lg:flex-row lg:items-center"
        onSubmit={handleSubmit}
      >
        <label className="flex min-h-10 flex-1 items-center gap-3">
          <Search className="h-5 w-5 text-info-muted" aria-hidden="true" />
          <span className="sr-only">Filter by company or role</span>
          <input
            name="search"
            type="text"
            placeholder="Filter by company or role..."
            defaultValue={query.search}
            className="w-full bg-transparent text-base font-medium leading-6 text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </label>

        <div className="hidden h-10 w-px bg-border lg:block" />

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative">
            <span className="sr-only">Match filter</span>
            <select
              value={query.matchFilter}
              onChange={(event) => handleMatchFilterChange(event.target.value)}
              className="inline-flex min-h-10 w-full appearance-none rounded-md border border-border bg-surface px-4 py-2 pr-10 text-sm font-medium leading-5 text-text-dark shadow-card transition-colors hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:min-w-44"
            >
              <option value="all">{scoreFilterLabel("all")}</option>
              <option value="high">{scoreFilterLabel("high")}</option>
              <option value="low">{scoreFilterLabel("low")}</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
              aria-hidden="true"
            />
          </label>
          <label className="relative">
            <span className="sr-only">Sort jobs</span>
            <select
              value={query.sort}
              onChange={(event) => handleSortChange(event.target.value)}
              className="inline-flex min-h-10 w-full appearance-none rounded-md border border-border bg-surface px-4 py-2 pr-10 text-sm font-medium leading-5 text-text-dark shadow-card transition-colors hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:min-w-44"
            >
              <option value="match">Match Score</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
              aria-hidden="true"
            />
          </label>
        </div>
      </form>
    </section>
  );
}

function readMatchFilter(value: string): JobsMatchFilter {
  if (value === "high" || value === "low") {
    return value;
  }

  return "all";
}

function readSort(value: string): JobsSort {
  if (value === "newest" || value === "oldest") {
    return value;
  }

  return "match";
}

function readText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}
