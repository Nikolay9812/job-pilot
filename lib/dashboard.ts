import { createInsforgeServer } from "@/lib/insforge-server";
import { formatDateFound } from "@/lib/jobs";
import { queryPostHogHogql } from "@/lib/posthog-server";
import type {
  DashboardActivityItem,
  DashboardActivityTone,
  DashboardAnalyticsData,
  DashboardScoreBucket,
  DashboardStats,
  DashboardTimeSeriesPoint,
  DashboardTrend,
} from "@/types/dashboard";

type JobsCountOptions = {
  from?: string;
  to?: string;
  onlyResearched?: boolean;
};

type AgentRunActivityRow = {
  id: string;
  status: string;
  job_title_searched: string | null;
  jobs_found: number | null;
  completed_at: string | null;
  created_at: string | null;
};

type CompanyResearchActivityRow = {
  id: string;
  company: string | null;
  updated_at: string | null;
  created_at: string | null;
};

type PostHogEventName = "job_found" | "company_researched";

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

export async function loadRecentDashboardActivity(userId: string): Promise<DashboardActivityItem[]> {
  try {
    const insforge = await createInsforgeServer();
    const [agentRuns, companyResearchJobs] = await Promise.all([
      loadAgentRunActivity(insforge, userId),
      loadCompanyResearchActivity(insforge, userId),
    ]);

    return [...agentRuns, ...companyResearchJobs]
      .sort((first, second) => readTimestamp(second.occurredAt) - readTimestamp(first.occurredAt))
      .slice(0, 5);
  } catch (error) {
    console.error("[dashboard/activity]", error);
    return [];
  }
}

export async function loadDashboardAnalytics(userId: string): Promise<DashboardAnalyticsData> {
  const now = new Date();

  try {
    const [jobFoundResponse, companyResearchResponse] = await Promise.all([
      queryPostHogHogql(
        buildPostHogEventsQuery("job_found", userId, 30),
        "JobPilot dashboard job_found events",
      ),
      queryPostHogHogql(
        buildPostHogEventsQuery("company_researched", userId, 7),
        "JobPilot dashboard company_researched events",
      ),
    ]);

    if (!jobFoundResponse || !companyResearchResponse) {
      return buildEmptyDashboardAnalytics(now);
    }

    const jobFoundRows = readHogqlResultRows(jobFoundResponse);
    const companyResearchRows = readHogqlResultRows(companyResearchResponse);

    return {
      jobsFoundData: buildTimeSeries(jobFoundRows, 30, now, formatShortDateLabel),
      matchScoreData: buildMatchScoreBuckets(jobFoundRows),
      companyResearchData: buildTimeSeries(companyResearchRows, 7, now, formatWeekdayLabel),
    };
  } catch (error) {
    console.error("[dashboard/analytics]", error);
    return buildEmptyDashboardAnalytics(now);
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

async function loadAgentRunActivity(
  insforge: InsforgeServer,
  userId: string,
): Promise<DashboardActivityItem[]> {
  const { data, error } = await insforge.database
    .from("agent_runs")
    .select("id,status,job_title_searched,jobs_found,completed_at,created_at")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map(parseAgentRunActivity)
    .filter((activity): activity is DashboardActivityItem => activity !== null);
}

async function loadCompanyResearchActivity(
  insforge: InsforgeServer,
  userId: string,
): Promise<DashboardActivityItem[]> {
  const { data, error } = await insforge.database
    .from("jobs")
    .select("id,company,updated_at,created_at")
    .eq("user_id", userId)
    .not("company_research", "is", null)
    .order("updated_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map(parseCompanyResearchActivity)
    .filter((activity): activity is DashboardActivityItem => activity !== null);
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

function parseAgentRunActivity(value: unknown): DashboardActivityItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const row: AgentRunActivityRow = {
    id: readString(value.id),
    status: readString(value.status),
    job_title_searched: readNullableString(value.job_title_searched),
    jobs_found: readNullableNumber(value.jobs_found),
    completed_at: readNullableString(value.completed_at),
    created_at: readNullableString(value.created_at),
  };

  const occurredAt = row.completed_at ?? row.created_at;

  if (!row.id || row.status !== "completed" || !occurredAt) {
    return null;
  }

  const jobsFound = Math.max(0, row.jobs_found ?? 0);
  const jobLabel = jobsFound === 1 ? "job" : "jobs";
  const searchedTitle = row.job_title_searched ? ` for ${row.job_title_searched}` : "";

  return buildActivityItem({
    id: `agent-run-${row.id}`,
    title: `Found ${jobsFound} ${jobLabel}${searchedTitle}`,
    occurredAt,
    tone: "success",
  });
}

function parseCompanyResearchActivity(value: unknown): DashboardActivityItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const row: CompanyResearchActivityRow = {
    id: readString(value.id),
    company: readNullableString(value.company),
    updated_at: readNullableString(value.updated_at),
    created_at: readNullableString(value.created_at),
  };
  const occurredAt = row.updated_at ?? row.created_at;

  if (!row.id || !row.company || !occurredAt) {
    return null;
  }

  return buildActivityItem({
    id: `company-research-${row.id}`,
    title: `Researched ${row.company}`,
    occurredAt,
    tone: "info",
  });
}

function buildActivityItem(input: {
  id: string;
  title: string;
  occurredAt: string;
  tone: DashboardActivityTone;
}): DashboardActivityItem {
  return {
    id: input.id,
    title: input.title,
    timestamp: formatDateFound(input.occurredAt),
    occurredAt: input.occurredAt,
    tone: input.tone,
  };
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readNullableString(value: unknown): string | null {
  const text = readString(value);
  return text ? text : null;
}

function readNullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? Math.round(value) : null;
}

function readHogqlResultRows(value: unknown): Record<string, unknown>[] {
  if (!isRecord(value) || !Array.isArray(value.results)) {
    return [];
  }

  const columns = Array.isArray(value.columns) ? value.columns.map(readString) : [];

  return value.results
    .map((row) => normalizeHogqlResultRow(row, columns))
    .filter((row): row is Record<string, unknown> => row !== null);
}

function normalizeHogqlResultRow(
  row: unknown,
  columns: string[],
): Record<string, unknown> | null {
  if (isRecord(row)) {
    return row;
  }

  if (!Array.isArray(row) || columns.length === 0) {
    return null;
  }

  const normalized: Record<string, unknown> = {};

  columns.forEach((column, index) => {
    if (column) {
      normalized[column] = row[index];
    }
  });

  return normalized;
}

function buildPostHogEventsQuery(
  eventName: PostHogEventName,
  userId: string,
  days: number,
): string {
  return `
SELECT timestamp, properties
FROM events
WHERE event = '${eventName}'
  AND distinct_id = '${escapeHogqlString(userId)}'
  AND timestamp >= now() - INTERVAL ${days} DAY
ORDER BY timestamp ASC
LIMIT 10000`;
}

function buildEmptyDashboardAnalytics(now: Date): DashboardAnalyticsData {
  return {
    jobsFoundData: buildTimeSeries([], 30, now, formatShortDateLabel),
    matchScoreData: buildMatchScoreBuckets([]),
    companyResearchData: buildTimeSeries([], 7, now, formatWeekdayLabel),
  };
}

function buildTimeSeries(
  rows: Record<string, unknown>[],
  days: number,
  now: Date,
  formatLabel: (date: Date) => string,
): DashboardTimeSeriesPoint[] {
  const countsByDate = new Map<string, number>();
  const range = buildDateRange(days, now, formatLabel);

  range.forEach((point) => {
    countsByDate.set(point.date, 0);
  });

  rows.forEach((row) => {
    const timestamp = readNullableString(row.timestamp);
    const date = timestamp ? toDateKey(new Date(timestamp)) : null;

    if (!date || !countsByDate.has(date)) {
      return;
    }

    countsByDate.set(date, (countsByDate.get(date) ?? 0) + 1);
  });

  return range.map((point) => ({
    ...point,
    value: countsByDate.get(point.date) ?? 0,
  }));
}

function buildDateRange(
  days: number,
  now: Date,
  formatLabel: (date: Date) => string,
): DashboardTimeSeriesPoint[] {
  return Array.from({ length: days }, (_, index) => {
    const date = daysAgo(now, days - index - 1);

    return {
      date: toDateKey(date),
      label: formatLabel(date),
      value: 0,
    };
  });
}

function buildMatchScoreBuckets(rows: Record<string, unknown>[]): DashboardScoreBucket[] {
  const buckets = [
    { label: "50-60%", min: 50, max: 60, value: 0 },
    { label: "60-70%", min: 60, max: 70, value: 0 },
    { label: "70-80%", min: 70, max: 80, value: 0 },
    { label: "80-90%", min: 80, max: 90, value: 0 },
    { label: "90-100%", min: 90, max: 101, value: 0 },
  ];

  rows.forEach((row) => {
    const score = readMatchScoreFromProperties(row.properties);

    if (score === null) {
      return;
    }

    const bucket = buckets.find((candidate) => score >= candidate.min && score < candidate.max);

    if (bucket) {
      bucket.value += 1;
    }
  });

  return buckets.map((bucket) => ({
    label: bucket.label,
    value: bucket.value,
  }));
}

function readMatchScoreFromProperties(value: unknown): number | null {
  if (!isRecord(value)) {
    return null;
  }

  const score = readNumberLike(value.matchScore);

  if (score === null) {
    return null;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function readNumberLike(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function readTimestamp(value: string): number {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
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

function toDateKey(date: Date): string {
  if (!Number.isFinite(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function formatShortDateLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatWeekdayLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function escapeHogqlString(value: string): string {
  return value.replace(/'/g, "''");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
