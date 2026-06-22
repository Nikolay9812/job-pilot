import { Check, Sparkles, X } from "lucide-react";
import type { JobDetails } from "@/types/jobs";

type MatchScoreProps = {
  job: JobDetails;
};

export function MatchScore({ job }: MatchScoreProps) {
  return (
    <>
      <section className="rounded-xl border border-border bg-surface p-6 shadow-card">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success-lightest">
            <Sparkles className="h-4 w-4 text-success" aria-hidden="true" />
          </span>
          <h2 className="text-xs font-semibold uppercase leading-4 text-text-secondary">
            AI Match Reasoning
          </h2>
        </div>
        <p className="mt-6 text-base font-semibold leading-7 text-text-dark">
          {job.matchReason ?? "No AI match reasoning is available for this job yet."}
        </p>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-card">
        <h2 className="text-xs font-semibold uppercase leading-4 text-text-secondary">
          Required Skills vs Your Profile
        </h2>

        <div className="mt-5">
          <p className="text-sm font-semibold leading-5 text-text-muted">You have</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {job.matchedSkills.length > 0 ? (
              job.matchedSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full bg-success-lightest px-3 py-1 text-xs font-semibold leading-4 text-success-foreground"
                >
                  <Check className="h-3 w-3" aria-hidden="true" />
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-sm font-medium leading-5 text-text-muted">
                No matched skills were returned.
              </span>
            )}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold leading-5 text-text-muted">Gap skills</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {job.missingSkills.length > 0 ? (
              job.missingSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full bg-accent-muted px-3 py-1 text-xs font-semibold leading-4 text-accent"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-sm font-medium leading-5 text-text-muted">
                No skill gaps were returned.
              </span>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
