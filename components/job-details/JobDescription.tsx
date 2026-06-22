import { FileText } from "lucide-react";
import type { JobDetails } from "@/types/jobs";

type JobDescriptionProps = {
  job: JobDetails;
};

type JobSection = {
  title: string;
  items: string[];
};

export function JobDescription({ job }: JobDescriptionProps) {
  const sections: JobSection[] = [
    { title: "Responsibilities", items: job.responsibilities },
    { title: "Requirements", items: job.requirements },
    { title: "Nice to Have", items: job.niceToHave },
    { title: "Benefits", items: job.benefits },
  ].filter((section) => section.items.length > 0);

  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-card">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary">
          <FileText className="h-4 w-4 text-text-secondary" aria-hidden="true" />
        </span>
        <h2 className="text-lg font-semibold leading-7 text-text-primary">Job Description</h2>
      </div>

      <div className="mt-6 space-y-6 text-sm font-semibold leading-6 text-text-dark">
        <p>{job.aboutRole ?? "No job description is available for this listing yet."}</p>

        {job.aboutCompany ? (
          <div>
            <h3 className="text-sm font-semibold leading-5 text-text-primary">About the Company</h3>
            <p className="mt-2">{job.aboutCompany}</p>
          </div>
        ) : null}

        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="text-sm font-semibold leading-5 text-text-primary">{section.title}</h3>
            <ul className="mt-2 list-inside list-disc space-y-1 text-text-dark">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
