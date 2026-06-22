import { Activity } from "lucide-react";
import type { DashboardActivityItem, DashboardActivityTone } from "@/types/dashboard";

type RecentActivityProps = {
  activities: DashboardActivityItem[];
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <section className="rounded-xl border border-border bg-surface shadow-card">
      <div className="border-b border-border px-6 py-6">
        <h2 className="text-xl font-semibold leading-7 text-text-primary">Recent Activity</h2>
      </div>
      {activities.length > 0 ? (
        <ol className="px-6 py-7">
          {activities.map((activity, index) => (
            <li key={activity.id} className="flex gap-5">
              <div className="flex w-6 flex-col items-center">
                <span
                  className={`mt-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-surface ${activityOuterClass(activity.tone)}`}
                >
                  <span className={`h-2 w-2 rounded-full ${activityInnerClass(activity.tone)}`} />
                </span>
                {index < activities.length - 1 ? <span className="h-16 w-px bg-border" /> : null}
              </div>
              <div className="pb-7">
                <p className="text-base font-semibold leading-6 text-text-primary">
                  {activity.title}
                </p>
                <p className="mt-1 text-sm font-medium leading-5 text-text-muted">
                  {activity.timestamp}
                </p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 px-6 py-10 text-center">
          <Activity className="h-6 w-6 text-text-muted" aria-hidden="true" />
          <p className="text-sm font-medium leading-5 text-text-secondary">
            No recent job activity yet. Run a search or research a company to fill this feed.
          </p>
        </div>
      )}
    </section>
  );
}

function activityOuterClass(tone: DashboardActivityTone): string {
  if (tone === "info") {
    return "bg-info-light";
  }

  if (tone === "success") {
    return "bg-success-light";
  }

  return "bg-surface-secondary";
}

function activityInnerClass(tone: DashboardActivityTone): string {
  if (tone === "info") {
    return "bg-info";
  }

  if (tone === "success") {
    return "bg-success-alt";
  }

  return "bg-text-muted";
}
