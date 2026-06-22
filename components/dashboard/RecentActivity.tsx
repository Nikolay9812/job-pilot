type ActivityTone = "accent" | "info" | "success";

type ActivityItem = {
  title: string;
  timestamp: string;
  tone: ActivityTone;
};

const activities: ActivityItem[] = [
  {
    title: "Found 8 jobs for Frontend Engineer",
    timestamp: "10 mins ago",
    tone: "accent",
  },
  {
    title: "Researched Stripe",
    timestamp: "1 hour ago",
    tone: "info",
  },
  {
    title: "Found 12 jobs for React Developer",
    timestamp: "2 hours ago",
    tone: "success",
  },
  {
    title: "Researched Vercel",
    timestamp: "Yesterday",
    tone: "accent",
  },
  {
    title: "Found 10 jobs for Full Stack Engineer",
    timestamp: "Yesterday",
    tone: "success",
  },
];

export function RecentActivity() {
  return (
    <section className="rounded-xl border border-border bg-surface shadow-card">
      <div className="border-b border-border px-6 py-6">
        <h2 className="text-xl font-semibold leading-7 text-text-primary">Recent Activity</h2>
      </div>
      <ol className="px-6 py-7">
        {activities.map((activity, index) => (
          <li key={`${activity.title}-${activity.timestamp}`} className="flex gap-5">
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
    </section>
  );
}

function activityOuterClass(tone: ActivityTone): string {
  if (tone === "info") {
    return "bg-info-light";
  }

  if (tone === "success") {
    return "bg-success-light";
  }

  return "bg-accent-light";
}

function activityInnerClass(tone: ActivityTone): string {
  if (tone === "info") {
    return "bg-info";
  }

  if (tone === "success") {
    return "bg-success-alt";
  }

  return "bg-accent";
}
