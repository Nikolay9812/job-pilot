import { Building2, Search } from "lucide-react";

type CompanyResearchProps = {
  company: string;
};

export function CompanyResearch({ company }: CompanyResearchProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      <div className="flex flex-col gap-4 border-b border-border p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-muted">
            <Building2 className="h-4 w-4 text-accent" aria-hidden="true" />
          </span>
          <h2 className="text-lg font-semibold leading-7 text-text-primary">Company Research</h2>
        </div>

        <button
          type="button"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold leading-5 text-accent-foreground shadow-card transition-colors hover:bg-accent-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Research Company
        </button>
      </div>

      <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface-secondary">
          <Building2 className="h-6 w-6 text-text-muted" aria-hidden="true" />
        </span>
        <h3 className="mt-5 text-sm font-semibold leading-5 text-text-primary">No research yet</h3>
        <p className="mt-2 max-w-sm text-sm font-medium leading-6 text-text-muted">
          Click &quot;Research Company&quot; to let the AI browse {company}&apos;s public pages and
          build a dossier.
        </p>
      </div>
    </section>
  );
}
