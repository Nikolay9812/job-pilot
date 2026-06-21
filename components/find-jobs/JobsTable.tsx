import { Building2 } from "lucide-react";
import { JobsPagination } from "@/components/find-jobs/JobsPagination";

type JobMatch = {
  company: string;
  role: string;
  matchScore: number;
  scoreWidthClass: string;
  salary: string;
  dateFound: string;
};

const jobs: JobMatch[] = [
  {
    company: "Vercel",
    role: "Senior Frontend Engineer",
    matchScore: 94,
    scoreWidthClass: "w-[94%]",
    salary: "$160k - $200k",
    dateFound: "2 hours ago",
  },
  {
    company: "Stripe",
    role: "Staff UI Engineer",
    matchScore: 88,
    scoreWidthClass: "w-[88%]",
    salary: "$180k - $240k",
    dateFound: "Yesterday",
  },
  {
    company: "Linear",
    role: "Product Engineer",
    matchScore: 96,
    scoreWidthClass: "w-[96%]",
    salary: "$150k - $190k",
    dateFound: "Yesterday",
  },
  {
    company: "Notion",
    role: "Frontend Developer",
    matchScore: 72,
    scoreWidthClass: "w-[72%]",
    salary: "$130k - $170k",
    dateFound: "2 days ago",
  },
  {
    company: "OpenAI",
    role: "Design Engineer",
    matchScore: 91,
    scoreWidthClass: "w-[91%]",
    salary: "$200k - $280k",
    dateFound: "3 days ago",
  },
  {
    company: "Figma",
    role: "Software Engineer, Editor",
    matchScore: 85,
    scoreWidthClass: "w-[85%]",
    salary: "$170k - $220k",
    dateFound: "4 days ago",
  },
];

export function JobsTable() {
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
            {jobs.map((job) => (
              <tr
                key={`${job.company}-${job.role}`}
                className="border-b border-border transition-colors last:border-b-0 hover:bg-surface-secondary"
              >
                <td className="px-12 py-5">
                  <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface-secondary shadow-sm">
                      <Building2 className="h-4 w-4 text-text-secondary" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-semibold leading-5 text-text-primary">
                      {job.company}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm font-semibold leading-5 text-text-dark">
                  {job.role}
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <span className="h-1 w-28 rounded-full bg-border-light">
                      <span
                        className={`block h-full rounded-full ${job.scoreWidthClass} ${scoreFillClass(job.matchScore)}`}
                      />
                    </span>
                    <span className="text-sm font-semibold leading-5 text-text-dark">
                      {job.matchScore}%
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm font-medium leading-5 text-text-dark">
                  {job.salary}
                </td>
                <td className="px-8 py-5 text-sm font-medium leading-5 text-text-secondary">
                  {job.dateFound}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <JobsPagination />
    </section>
  );
}

function scoreFillClass(score: number): string {
  if (score >= 90) {
    return "bg-success";
  }

  if (score >= 80) {
    return "bg-info-medium";
  }

  return "bg-warning";
}
