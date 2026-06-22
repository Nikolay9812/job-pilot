"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { ChartEmptyState } from "@/components/dashboard/ChartEmptyState";
import type { DashboardScoreBucket } from "@/types/dashboard";

type MatchScoreChartProps = {
  data: DashboardScoreBucket[];
};

export function MatchScoreChart({ data }: MatchScoreChartProps) {
  const hasData = data.some((bucket) => bucket.value > 0);

  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-card">
      <h2 className="text-xl font-semibold leading-7 text-text-primary">Match Score Distribution</h2>
      {hasData ? (
        <div className="mt-8 h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 24, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ className: "fill-chart-axis text-xs font-medium" }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ className: "fill-chart-axis text-xs font-normal" }}
                width={42}
              />
              <Bar dataKey="value" fill="var(--color-success)" radius={[4, 4, 0, 0]} barSize={34} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <ChartEmptyState message="Match score distribution will appear after matched jobs are saved." />
      )}
    </section>
  );
}
