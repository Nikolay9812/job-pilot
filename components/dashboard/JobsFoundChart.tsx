"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { ChartEmptyState } from "@/components/dashboard/ChartEmptyState";
import type { DashboardTimeSeriesPoint } from "@/types/dashboard";

type JobsFoundChartProps = {
  data: DashboardTimeSeriesPoint[];
};

export function JobsFoundChart({ data }: JobsFoundChartProps) {
  const hasData = data.some((point) => point.value > 0);

  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-card">
      <h2 className="text-xl font-semibold leading-7 text-text-primary">Jobs Found Over Time</h2>
      {hasData ? (
        <div className="mt-8 h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 24, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="jobs-found-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-accent-light)" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="var(--color-accent-light)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                interval="preserveStartEnd"
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
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-accent)"
                strokeWidth={3}
                fill="url(#jobs-found-fill)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <ChartEmptyState message="Jobs found over time will appear here after your first job search." />
      )}
    </section>
  );
}
