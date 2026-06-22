import Link from "next/link";
import { AlertCircle, Building2, Search } from "lucide-react";
import { JobsPagination } from "@/components/find-jobs/JobsPagination";
import { formatDateFound } from "@/lib/jobs";
import type { JobListItem, JobListQuery, JobsPageInfo } from "@/types/jobs";

type JobsTableProps = {
  jobs: JobListItem[];
  pageInfo: JobsPageInfo;
  query: JobListQuery;
  hasError: boolean;
};

const scoreSegments = Array.from({ length: 20 }, (_value, index) => index);

export function JobsTable({ jobs, pageInfo, query, hasError }: JobsTableProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-secondary">
              <th className="px-12 py-5 text-left text-xs font-semibold uppercase leading-4 text-text-secondary">
                Company
              </th>
              <th className="px-8 py-5 text-left text-xs font-semibold uppercase leading-4 text-text-secondary">
                Role
              </th>
              <th className="px-8 py-5 text-left text-xs font-semibold uppercase leading-4 text-text-secondary">
                Match Score
              </th>
              <th className="px-8 py-5 text-left text-xs font-semibold uppercase leading-4 text-text-secondary">
                Salary Est.
              </th>
              <th className="px-8 py-5 text-left text-xs font-semibold uppercase leading-4 text-text-secondary">
                Date Found
              </th>
            </tr>
          </thead>
          <tbody>
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-b border-border transition-colors last:border-b-0 hover:bg-surface-secondary"
                >
                  <td className="px-12 py-5">
                    <div className="flex items-center gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface-secondary shadow-sm">
                        <Building2 className="h-4 w-4 text-text-secondary" aria-hidden="true" />
                      </span>
                      <Link
                        href={`/find-jobs/${job.id}`}
                        className="text-sm font-semibold leading-5 text-text-primary transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        {job.company}
                      </Link>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <Link
                      href={`/find-jobs/${job.id}`}
                      className="text-sm font-semibold leading-5 text-text-dark transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      {job.title}
                    </Link>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      {renderScoreBar(job.matchScore)}
                      <span className="text-sm font-semibold leading-5 text-text-dark">
                        {job.matchScore}%
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium leading-5 text-text-dark">
                    {job.salary ?? "Not listed"}
                  </td>
                  <td className="px-8 py-5 text-sm font-medium leading-5 text-text-secondary">
                    {formatDateFound(job.foundAt)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-8 py-14">
                  {renderJobsEmptyState(hasError, hasActiveFilters(query))}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <JobsPagination pageInfo={pageInfo} query={query} />
    </section>
  );
}

function scoreFillClass(score: number): string {
  if (score >= 80) {
    return "bg-success";
  }

  if (score >= 60) {
    return "bg-info-medium";
  }

  return "bg-warning";
}

function renderScoreBar(score: number) {
  const filledSegments = Math.round(Math.max(0, Math.min(100, score)) / 5);

  return (
    <span className="flex h-1 w-28 overflow-hidden rounded-full bg-border-light">
      {scoreSegments.map((segment) => (
        <span
          key={segment}
          className={`h-full flex-1 ${segment < filledSegments ? scoreFillClass(score) : ""}`}
        />
      ))}
    </span>
  );
}

function renderJobsEmptyState(hasError: boolean, hasActiveFilters: boolean) {
  if (hasError) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <AlertCircle className="h-6 w-6 text-error" aria-hidden="true" />
        <p className="text-sm font-medium leading-5 text-text-secondary">
          We could not load saved jobs right now. Please refresh and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <Search className="h-6 w-6 text-text-muted" aria-hidden="true" />
      <p className="text-sm font-medium leading-5 text-text-secondary">
        {hasActiveFilters
          ? "No jobs match these filters. Try adjusting your search or match filter."
          : "No saved jobs yet. Run a search above to start your list."}
      </p>
    </div>
  );
}

function hasActiveFilters(query: JobListQuery): boolean {
  return query.search.length > 0 || query.matchFilter !== "all";
}
