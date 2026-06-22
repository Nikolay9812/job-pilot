import { MATCH_THRESHOLD } from "@/lib/utils";
import type {
  JobDetails,
  JobType,
  JobListItem,
  JobListQuery,
  JobsMatchFilter,
  JobsPageInfo,
  JobsSort,
  JobSource,
} from "@/types/jobs";

export const JOBS_PAGE_SIZE = 20;

type SearchParamsRecord = Record<string, string | string[] | undefined>;

export function normalizeJobListQuery(searchParams: SearchParamsRecord): JobListQuery {
  return {
    search: normalizeSearchTerm(readParam(searchParams.q)),
    matchFilter: normalizeMatchFilter(readParam(searchParams.match)),
    sort: normalizeSort(readParam(searchParams.sort)),
    page: normalizePage(readParam(searchParams.page)),
  };
}

export function buildFindJobsHref(query: JobListQuery, page: number): string {
  const params = new URLSearchParams();

  if (query.search) {
    params.set("q", query.search);
  }

  if (query.matchFilter !== "all") {
    params.set("match", query.matchFilter);
  }

  if (query.sort !== "match") {
    params.set("sort", query.sort);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();
  return queryString ? `/find-jobs?${queryString}` : "/find-jobs";
}

export function parseJobListItems(value: unknown): JobListItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(parseJobListItem)
    .filter((job): job is JobListItem => job !== null);
}

export function parseJobDetails(value: unknown): JobDetails | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = readString(value.id);
  const title = readString(value.title);
  const company = readString(value.company);
  const foundAt = readString(value.found_at);
  const matchScore = readNumber(value.match_score);

  if (!id || !title || !company || !foundAt || matchScore === null) {
    return null;
  }

  return {
    id,
    title,
    company,
    salary: readNullableString(value.salary),
    location: readNullableString(value.location),
    jobType: readJobType(value.job_type),
    sourceUrl: readNullableString(value.source_url),
    externalApplyUrl: readNullableString(value.external_apply_url),
    aboutRole: readNullableString(value.about_role),
    responsibilities: readStringArray(value.responsibilities),
    requirements: readStringArray(value.requirements),
    niceToHave: readStringArray(value.nice_to_have),
    benefits: readStringArray(value.benefits),
    aboutCompany: readNullableString(value.about_company),
    matchScore,
    matchReason: readNullableString(value.match_reason),
    matchedSkills: readStringArray(value.matched_skills),
    missingSkills: readStringArray(value.missing_skills),
    foundAt,
  };
}

export function buildJobsPageInfo(totalResults: number, currentPage: number): JobsPageInfo {
  const totalPages = Math.max(1, Math.ceil(totalResults / JOBS_PAGE_SIZE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const fromResult = totalResults === 0 ? 0 : (safeCurrentPage - 1) * JOBS_PAGE_SIZE + 1;
  const toResult = Math.min(safeCurrentPage * JOBS_PAGE_SIZE, totalResults);

  return {
    currentPage: safeCurrentPage,
    pageSize: JOBS_PAGE_SIZE,
    totalResults,
    totalPages,
    fromResult,
    toResult,
  };
}

export function formatJobType(value: JobType | null): string {
  if (value === "fulltime") {
    return "Full-time";
  }

  if (value === "parttime") {
    return "Part-time";
  }

  if (value === "contract") {
    return "Contract";
  }

  return "-";
}

export function formatDateFound(value: string): string {
  const foundAt = new Date(value);

  if (Number.isNaN(foundAt.getTime())) {
    return "Date unavailable";
  }

  const diffMs = foundAt.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  const absoluteMinutes = Math.abs(diffMinutes);

  if (absoluteMinutes < 60) {
    return formatRelativeTime(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  const absoluteHours = Math.abs(diffHours);

  if (absoluteHours < 24) {
    return formatRelativeTime(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  const absoluteDays = Math.abs(diffDays);

  if (absoluteDays < 7) {
    return formatRelativeTime(diffDays, "day");
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(foundAt);
}

export function scoreFilterLabel(filter: JobsMatchFilter): string {
  if (filter === "high") {
    return `High Match (${MATCH_THRESHOLD}%+)`;
  }

  if (filter === "low") {
    return `Low Match (<${MATCH_THRESHOLD}%)`;
  }

  return "All Matches";
}

function parseJobListItem(value: unknown): JobListItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = readString(value.id);
  const title = readString(value.title);
  const company = readString(value.company);
  const foundAt = readString(value.found_at);
  const matchScore = readNumber(value.match_score);

  if (!id || !title || !company || !foundAt || matchScore === null) {
    return null;
  }

  return {
    id,
    title,
    company,
    salary: readNullableString(value.salary),
    source: readJobSource(value.source),
    foundAt,
    matchScore,
  };
}

function normalizeSearchTerm(value: string): string {
  return value
    .replace(/[,%*()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function normalizeMatchFilter(value: string): JobsMatchFilter {
  if (value === "high" || value === "low") {
    return value;
  }

  return "all";
}

function normalizeSort(value: string): JobsSort {
  if (value === "newest" || value === "oldest") {
    return value;
  }

  return "match";
}

function normalizePage(value: string): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function readParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return typeof value === "string" ? value : "";
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readNullableString(value: unknown): string | null {
  const text = readString(value);
  return text ? text : null;
}

function readNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function readJobSource(value: unknown): JobSource {
  return value === "url" ? "url" : "search";
}

function readJobType(value: unknown): JobType | null {
  if (value === "fulltime" || value === "parttime" || value === "contract") {
    return value;
  }

  return null;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(readString).filter((item) => item.length > 0);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit): string {
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(value, unit);
}
