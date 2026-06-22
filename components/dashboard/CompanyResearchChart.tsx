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
import type { DashboardTimeSeriesPoint } from "@/types/dashboard";

type CompanyResearchChartProps = {
  data: DashboardTimeSeriesPoint[];
};

export function CompanyResearchChart({ data }: CompanyResearchChartProps) {
  const hasData = data.some((point) => point.value > 0);

  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-card">
      <h2 className="text-xl font-semibold leading-7 text-text-primary">
        Company Research Activity
      </h2>
      {hasData ? (
        <div className="mt-10 h-[330px] w-full">
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
              <Bar dataKey="value" fill="var(--color-info)" radius={[4, 4, 0, 0]} barSize={44} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <ChartEmptyState message="Company research activity will appear here after you research saved jobs." />
      )}
    </section>
  );
}
