import Link from "next/link";
import { Building2, ChevronLeft, ExternalLink } from "lucide-react";
import type { JobDetails } from "@/types/jobs";

type JobHeaderProps = {
  job: JobDetails;
  applyUrl: string | null;
};

export function JobHeader({ job, applyUrl }: JobHeaderProps) {
  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/find-jobs"
        className="inline-flex w-fit items-center gap-2 text-sm font-semibold leading-5 text-text-secondary transition-colors hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back to Jobs
      </Link>

      <section className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-secondary shadow-sm">
            <Building2 className="h-7 w-7 text-text-muted" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold leading-8 text-text-primary">{job.title}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold leading-5 text-text-secondary">
              <span>{job.company}</span>
              <span aria-hidden="true">&middot;</span>
              <span className="rounded-full bg-success-lightest px-3 py-1 text-xs font-semibold leading-4 text-success-foreground">
                {job.matchScore}% Match Score
              </span>
            </div>
          </div>
        </div>

        {applyUrl ? (
          <a
            href={applyUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold leading-5 text-text-primary shadow-card transition-colors hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            View Job Post
          </a>
        ) : null}
      </section>
    </div>
  );
}
