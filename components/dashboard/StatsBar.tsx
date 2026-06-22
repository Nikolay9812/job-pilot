import { StatCard } from "@/components/dashboard/StatCard";
import type { DashboardStats } from "@/types/dashboard";

type StatsBarProps = {
  stats: DashboardStats;
};

export function StatsBar({ stats }: StatsBarProps) {
  const statCards = [
    {
      label: "Total Jobs Found",
      value: formatCount(stats.totalJobsFound),
      trend: stats.totalJobsTrend,
      helper: stats.totalJobsTrend ? "vs last week" : "All saved jobs",
    },
    {
      label: "Avg. Match Rate",
      value: `${stats.avgMatchRate}%`,
      trend: stats.avgMatchTrend,
      helper: stats.avgMatchTrend ? "vs last week" : "Across all jobs",
    },
    {
      label: "Companies Researched",
      value: formatCount(stats.companiesResearched),
      helper: "Total researched",
    },
    {
      label: "Jobs This Week",
      value: formatCount(stats.jobsThisWeek),
      helper: "New this week",
    },
  ];

  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {statCards.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </section>
  );
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en").format(value);
}
