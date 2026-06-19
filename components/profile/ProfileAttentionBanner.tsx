import { CircleAlert } from "lucide-react";

const missingFields = ["PHONE", "LOCATION", "EDUCATION"];

export function ProfileAttentionBanner() {
  return (
    <section className="rounded-xl border border-error bg-surface p-8 shadow-card">
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CircleAlert className="h-5 w-5 text-error" aria-hidden="true" />
            <h1 className="text-2xl font-semibold leading-8 text-text-primary">
              Profile needs attention
            </h1>
          </div>
          <p className="mt-3 max-w-xl text-sm font-medium leading-5 text-text-secondary">
            Complete the missing fields to improve your chance of getting tailored matches
            and generating quality resumes.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {missingFields.map((field) => (
              <span
                key={field}
                className="rounded-sm bg-accent-muted px-2 py-1 text-xs font-semibold leading-4 text-error"
              >
                {field}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-center md:w-48">
          <div className="profile-completion-ring">
            <span className="text-3xl font-semibold leading-9 text-text-primary">70%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
