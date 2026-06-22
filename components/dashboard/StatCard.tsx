import type { DashboardTrend } from "@/types/dashboard";

type StatCardProps = {
  label: string;
  value: string;
  helper: string;
  trend?: DashboardTrend | null;
};

export function StatCard({ label, value, helper, trend }: StatCardProps) {
  return (
    <article className="rounded-xl border border-border bg-surface p-6 shadow-card">
      <p className="text-sm font-semibold leading-5 text-text-secondary">{label}</p>
      <p className="mt-2 text-4xl font-semibold leading-10 text-text-primary">{value}</p>
      <div className="mt-4 flex items-center gap-3">
        {trend ? (
          <span
            className={`rounded-sm px-2 py-1 text-xs font-semibold leading-4 ${trendClass(trend.tone)}`}
          >
            {trend.label}
          </span>
        ) : null}
        <p className="text-sm font-medium leading-5 text-text-muted">{helper}</p>
      </div>
    </article>
  );
}

function trendClass(tone: DashboardTrend["tone"]): string {
  if (tone === "negative") {
    return "bg-surface-secondary text-error";
  }

  return "bg-success-lightest text-success-darker";
}
