const pageNumbers = ["1", "2", "3", "...", "8"];

export function JobsPagination() {
  return (
    <div className="flex flex-col gap-4 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium leading-5 text-text-secondary">
        Showing <span className="font-semibold text-text-dark">1</span> to{" "}
        <span className="font-semibold text-text-dark">6</span> of{" "}
        <span className="font-semibold text-text-dark">24</span> results
      </p>

      <nav className="flex flex-wrap items-center gap-2" aria-label="Pagination">
        <button
          type="button"
          disabled
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold leading-5 text-text-muted shadow-card"
        >
          Previous
        </button>
        {pageNumbers.map((page) =>
          page === "..." ? (
            <span
              key={page}
              className="inline-flex min-h-10 items-center justify-center px-2 text-sm font-semibold leading-5 text-text-muted"
            >
              {page}
            </span>
          ) : (
            <button
              key={page}
              type="button"
              className={`inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-semibold leading-5 shadow-card transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                page === "1"
                  ? "bg-accent-muted text-accent"
                  : "bg-surface text-text-dark hover:bg-surface-secondary"
              }`}
            >
              {page}
            </button>
          ),
        )}
        <button
          type="button"
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold leading-5 text-text-dark shadow-card transition-colors hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Next
        </button>
      </nav>
    </div>
  );
}
