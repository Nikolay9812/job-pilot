import { StatCard } from "@/components/dashboard/StatCard";

const stats = [
  {
    label: "Total Jobs Found",
    value: "284",
    trend: "+12%",
    helper: "vs last week",
  },
  {
    label: "Avg. Match Rate",
    value: "82%",
    trend: "+3%",
    helper: "vs last week",
  },
  {
    label: "Companies Researched",
    value: "35",
    helper: "Total researched",
  },
  {
    label: "Jobs This Week",
    value: "28",
    helper: "New this week",
  },
];

export function StatsBar() {
  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </section>
  );
}
