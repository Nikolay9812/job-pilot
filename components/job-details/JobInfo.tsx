import { Briefcase, CalendarDays, DollarSign, MapPin } from "lucide-react";
import { formatDateFound, formatJobType } from "@/lib/jobs";
import type { JobDetails } from "@/types/jobs";

type JobInfoProps = {
  job: JobDetails;
};

type InfoCard = {
  label: string;
  value: string;
  Icon: typeof DollarSign;
  iconClassName: string;
};

export function JobInfo({ job }: JobInfoProps) {
  const cards: InfoCard[] = [
    {
      label: "Salary Est.",
      value: job.salary ?? "Not listed",
      Icon: DollarSign,
      iconClassName: "bg-success-lightest text-success",
    },
    {
      label: "Location",
      value: job.location ?? "Not listed",
      Icon: MapPin,
      iconClassName: "bg-info-lightest text-info-medium",
    },
    {
      label: "Job Type",
      value: formatJobType(job.jobType),
      Icon: Briefcase,
      iconClassName: "bg-accent-muted text-accent",
    },
    {
      label: "Date Found",
      value: formatDateFound(job.foundAt),
      Icon: CalendarDays,
      iconClassName: "bg-surface-secondary text-text-secondary",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ label, value, Icon, iconClassName }) => (
        <div
          key={label}
          className="flex min-h-20 items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-card"
        >
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${iconClassName}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-5 text-text-primary">{value}</p>
            <p className="mt-1 text-xs font-semibold uppercase leading-4 text-text-muted">{label}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
