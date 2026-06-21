export type AdzunaCountry = "us" | "gb" | "ca" | "au";

export type AdzunaJob = {
  id: string;
  title: string;
  companyName: string;
  locationName: string;
  description: string;
  redirectUrl: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryIsPredicted: boolean;
  contractType: string | null;
  created: string;
};

export async function searchJobs(
  jobTitle: string,
  location: string,
  country: AdzunaCountry = "us",
): Promise<AdzunaJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    throw new Error("Adzuna credentials are not configured.");
  }

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    what: jobTitle,
    category: "it-jobs",
    results_per_page: "10",
    "content-type": "application/json",
  });

  const cleanLocation = location.trim();
  if (cleanLocation) {
    params.set("where", cleanLocation);
  }

  const response = await fetch(
    `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`,
  );

  if (!response.ok) {
    throw new Error(`Adzuna API error: ${response.status}`);
  }

  const data: unknown = await response.json();
  return parseAdzunaJobs(data);
}

export function detectAdzunaCountry(location: string): AdzunaCountry {
  const normalized = location.toLowerCase();
  const tokens = normalized
    .split(/[^a-z]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  if (
    containsAny(normalized, ["united kingdom", "london", "manchester", "birmingham", "edinburgh", "glasgow", "england", "scotland", "wales"]) ||
    tokens.includes("uk")
  ) {
    return "gb";
  }

  if (
    containsAny(normalized, ["canada", "toronto", "vancouver", "montreal", "ottawa", "calgary"]) ||
    tokens.includes("ca")
  ) {
    return "ca";
  }

  if (
    containsAny(normalized, ["australia", "sydney", "melbourne", "brisbane", "perth", "adelaide"]) ||
    tokens.includes("au")
  ) {
    return "au";
  }

  return "us";
}

function parseAdzunaJobs(value: unknown): AdzunaJob[] {
  if (!isRecord(value) || !Array.isArray(value.results)) {
    return [];
  }

  return value.results.map(parseAdzunaJob).filter((job): job is AdzunaJob => job !== null);
}

function parseAdzunaJob(value: unknown): AdzunaJob | null {
  if (!isRecord(value)) {
    return null;
  }

  const title = readString(value.title);
  const company = isRecord(value.company) ? value.company : {};
  const location = isRecord(value.location) ? value.location : {};
  const companyName = readString(company.display_name);
  const locationName = readString(location.display_name);
  const redirectUrl = readString(value.redirect_url);

  if (!title || !companyName || !redirectUrl) {
    return null;
  }

  return {
    id: readString(value.id),
    title,
    companyName,
    locationName,
    description: readString(value.description),
    redirectUrl,
    salaryMin: readNullableNumber(value.salary_min),
    salaryMax: readNullableNumber(value.salary_max),
    salaryIsPredicted: readString(value.salary_is_predicted) === "1",
    contractType: readNullableString(value.contract_type),
    created: readString(value.created),
  };
}

function containsAny(value: string, needles: string[]): boolean {
  return needles.some((needle) => value.includes(needle));
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readNullableString(value: unknown): string | null {
  const text = readString(value);
  return text || null;
}

function readNullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
