import { JobsFoundChart } from "@/components/dashboard/JobsFoundChart";
import { MatchScoreChart } from "@/components/dashboard/MatchScoreChart";

export function AnalyticsCharts() {
  return (
    <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
      <JobsFoundChart />
      <MatchScoreChart />
    </div>
  );
}
