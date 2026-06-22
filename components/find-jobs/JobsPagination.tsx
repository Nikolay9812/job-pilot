import Link from "next/link";
import { buildFindJobsHref } from "@/lib/jobs";
import type { JobListQuery, JobsPageInfo } from "@/types/jobs";

type JobsPaginationProps = {
  pageInfo: JobsPageInfo;
  query: JobListQuery;
};

export function JobsPagination({ pageInfo, query }: JobsPaginationProps) {
  const pageNumbers = buildPageNumbers(pageInfo.currentPage, pageInfo.totalPages);
  const hasPreviousPage = pageInfo.currentPage > 1;
  const hasNextPage = pageInfo.currentPage < pageInfo.totalPages;

  return (
    <div className="flex flex-col gap-4 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium leading-5 text-text-secondary">
        Showing <span className="font-semibold text-text-dark">{pageInfo.fromResult}</span> to{" "}
        <span className="font-semibold text-text-dark">{pageInfo.toResult}</span> of{" "}
        <span className="font-semibold text-text-dark">{pageInfo.totalResults}</span> results
      </p>

      <nav className="flex flex-wrap items-center gap-2" aria-label="Pagination">
        {hasPreviousPage ? (
          <Link
            href={buildFindJobsHref(query, pageInfo.currentPage - 1)}
            scroll={false}
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold leading-5 text-text-dark shadow-card transition-colors hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Previous
          </Link>
        ) : (
          <span className="inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold leading-5 text-text-muted shadow-card">
            Previous
          </span>
        )}
        {pageNumbers.map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex min-h-10 items-center justify-center px-2 text-sm font-semibold leading-5 text-text-muted"
            >
              {page}
            </span>
          ) : (
            <Link
              key={page}
              href={buildFindJobsHref(query, page)}
              scroll={false}
              aria-current={page === pageInfo.currentPage ? "page" : undefined}
              className={`inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-semibold leading-5 shadow-card transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                page === pageInfo.currentPage
                  ? "bg-accent-muted text-accent"
                  : "bg-surface text-text-dark hover:bg-surface-secondary"
              }`}
            >
              {page}
            </Link>
          ),
        )}
        {hasNextPage ? (
          <Link
            href={buildFindJobsHref(query, pageInfo.currentPage + 1)}
            scroll={false}
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold leading-5 text-text-dark shadow-card transition-colors hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Next
          </Link>
        ) : (
          <span className="inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold leading-5 text-text-muted shadow-card">
            Next
          </span>
        )}
      </nav>
    </div>
  );
}

function buildPageNumbers(currentPage: number, totalPages: number): Array<number | "..."> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_value, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}
