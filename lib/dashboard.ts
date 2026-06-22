import { createInsforgeServer } from "@/lib/insforge-server";
import type { DashboardStats, DashboardTrend } from "@/types/dashboard";

type JobsCountOptions = {
  from?: string;
  to?: string;
  onlyResearched?: boolean;
};

type InsforgeServer = Awaited<ReturnType<typeof createInsforgeServer>>;

const emptyDashboardStats: DashboardStats = {
  totalJobsFound: 0,
  avgMatchRate: 0,
  companiesResearched: 0,
  jobsThisWeek: 0,
  totalJobsTrend: null,
  avgMatchTrend: null,
};

export async function loadDashboardStats(userId: string): Promise<DashboardStats> {
  try {
    const insforge = await createInsforgeServer();
    const now = new Date();
    const currentWeekStart = daysAgo(now, 7).toISOString();
    const previousWeekStart = daysAgo(now, 14).toISOString();
    const currentWeekEnd = now.toISOString();

    const [
      totalJobsFound,
      jobsThisWeek,
      jobsPreviousWeek,
      companiesResearched,
      allMatchScores,
      currentWeekMatchScores,
      previousWeekMatchScores,
    ] = await Promise.all([
      countJobs(insforge, userId),
      countJobs(insforge, userId, { from: currentWeekStart, to: currentWeekEnd }),
      countJobs(insforge, userId, { from: previousWeekStart, to: currentWeekStart }),
      countJobs(insforge, userId, { onlyResearched: true }),
      loadMatchScores(insforge, userId),
      loadMatchScores(insforge, userId, { from: currentWeekStart, to: currentWeekEnd }),
      loadMatchScores(insforge, userId, { from: previousWeekStart, to: currentWeekStart }),
    ]);

    const avgMatchRate = averageScore(allMatchScores);
    const currentWeekAvgMatchRate = averageScore(currentWeekMatchScores);
    const previousWeekAvgMatchRate = averageScore(previousWeekMatchScores);

    return {
      totalJobsFound,
      avgMatchRate,
      companiesResearched,
      jobsThisWeek,
      totalJobsTrend: buildPercentTrend(jobsThisWeek, jobsPreviousWeek),
      avgMatchTrend: buildPointTrend(currentWeekAvgMatchRate, previousWeekAvgMatchRate),
    };
  } catch (error) {
    console.error("[dashboard/stats]", error);
    return emptyDashboardStats;
  }
}

async function countJobs(
  insforge: InsforgeServer,
  userId: string,
  options: JobsCountOptions = {},
): Promise<number> {
  let query = insforge.database
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (options.from) {
    query = query.gte("found_at", options.from);
  }

  if (options.to) {
    query = query.lt("found_at", options.to);
  }

  if (options.onlyResearched) {
    query = query.not("company_research", "is", null);
  }

  const { error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return typeof count === "number" ? count : 0;
}

async function loadMatchScores(
  insforge: InsforgeServer,
  userId: string,
  options: JobsCountOptions = {},
): Promise<number[]> {
  let query = insforge.database.from("jobs").select("match_score").eq("user_id", userId);

  if (options.from) {
    query = query.gte("found_at", options.from);
  }

  if (options.to) {
    query = query.lt("found_at", options.to);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(readMatchScore).filter((score): score is number => score !== null);
}

function averageScore(scores: number[]): number {
  if (scores.length === 0) {
    return 0;
  }

  const total = scores.reduce((sum, score) => sum + score, 0);
  return Math.round(total / scores.length);
}

function buildPercentTrend(current: number, previous: number): DashboardTrend | null {
  if (previous <= 0 || current === previous) {
    return null;
  }

  const change = Math.round(((current - previous) / previous) * 100);
  return {
    label: formatSignedValue(change, "%"),
    tone: change >= 0 ? "positive" : "negative",
  };
}

function buildPointTrend(current: number, previous: number): DashboardTrend | null {
  if (previous <= 0 || current === previous) {
    return null;
  }

  const change = current - previous;
  return {
    label: formatSignedValue(change, "%"),
    tone: change >= 0 ? "positive" : "negative",
  };
}

function readMatchScore(value: unknown): number | null {
  if (!isRecord(value) || typeof value.match_score !== "number" || !Number.isFinite(value.match_score)) {
    return null;
  }

  return Math.max(0, Math.min(100, Math.round(value.match_score)));
}

function formatSignedValue(value: number, suffix: string): string {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value}${suffix}`;
}

function daysAgo(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() - days);
  return nextDate;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
