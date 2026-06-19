import { CircleAlert } from "lucide-react";
import { completionBucket } from "@/lib/profile";

type ProfileAttentionBannerProps = {
  completionPercentage: number;
  missingFields: string[];
};

export function ProfileAttentionBanner({
  completionPercentage,
  missingFields,
}: ProfileAttentionBannerProps) {
  const isComplete = missingFields.length === 0;
  const completion = completionBucket(completionPercentage);

  return (
    <section className={`rounded-xl border bg-surface p-8 shadow-card ${isComplete ? "border-success" : "border-error"}`}>
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CircleAlert className={`h-5 w-5 ${isComplete ? "text-success" : "text-error"}`} aria-hidden="true" />
            <h1 className="text-2xl font-semibold leading-8 text-text-primary">
              {isComplete ? "Profile is ready" : "Profile needs attention"}
            </h1>
          </div>
          <p className="mt-3 max-w-xl text-sm font-medium leading-5 text-text-secondary">
            {isComplete
              ? "Your profile has the context needed for tailored matches and quality resumes."
              : "Complete the missing fields to improve your chance of getting tailored matches and generating quality resumes."}
          </p>
          {missingFields.length > 0 ? (
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
          ) : null}
        </div>

        <div className="flex justify-center md:w-48">
          <div className="profile-completion-ring" data-completion={completion}>
            <span className="text-3xl font-semibold leading-9 text-text-primary">
              {completionPercentage}%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
