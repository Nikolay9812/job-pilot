import { JobsFoundChart } from "@/components/dashboard/JobsFoundChart";
import { MatchScoreChart } from "@/components/dashboard/MatchScoreChart";
import type { DashboardScoreBucket, DashboardTimeSeriesPoint } from "@/types/dashboard";

type AnalyticsChartsProps = {
  jobsFoundData: DashboardTimeSeriesPoint[];
  matchScoreData: DashboardScoreBucket[];
};

export function AnalyticsCharts({ jobsFoundData, matchScoreData }: AnalyticsChartsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
      <JobsFoundChart data={jobsFoundData} />
      <MatchScoreChart data={matchScoreData} />
    </div>
  );
}
