import { searchJobs, type AdzunaCountry, type AdzunaJob } from "@/lib/adzuna";
import { createInsforgeServer } from "@/lib/insforge-server";
import { capturePostHogServerEvent } from "@/lib/posthog-server";
import { MATCH_THRESHOLD } from "@/lib/utils";
import { fallbackJobMatchScore, scoreJobAgainstProfile } from "@/agent/matcher";
import type { JobMatchScore, JobType, SavedJobSummary } from "@/types/jobs";
import type { ProfileRecord } from "@/types/profile";

type InsforgeServerClient = Awaited<ReturnType<typeof createInsforgeServer>>;

type DiscoverJobsInput = {
  userId: string;
  runId: string;
  jobTitle: string;
  location: string;
  country: AdzunaCountry;
  profile: ProfileRecord;
};

type DiscoverJobsResult =
  | {
      success: true;
      jobsFound: number;
      strongMatches: number;
      savedJobs: SavedJobSummary[];
    }
  | { success: false; error: string };

type JobInsertPayload = {
  user_id: string;
  run_id: string;
  source: "search";
  source_url: string;
  external_apply_url: string;
  title: string;
  company: string;
  location: string | null;
  salary: string | null;
  job_type: JobType;
  about_role: string | null;
  responsibilities: string[];
  requirements: string[];
  nice_to_have: string[];
  benefits: string[];
  about_company: string | null;
  match_score: number;
  match_reason: string;
  matched_skills: string[];
  missing_skills: string[];
  found_at: string;
};

export async function discoverJobs(input: DiscoverJobsInput): Promise<DiscoverJobsResult> {
  const insforge = await createInsforgeServer();

  try {
    const adzunaJobs = await searchJobs(input.jobTitle, input.location, input.country);
    const savedJobs: SavedJobSummary[] = [];

    for (const adzunaJob of adzunaJobs) {
      const matchScore = await scoreAdzunaJob(insforge, input, adzunaJob);
      const savedJob = await saveAdzunaJob(insforge, input, adzunaJob, matchScore);

      if (savedJob) {
        savedJobs.push(savedJob);
        await captureJobFound(input.userId, savedJob.matchScore);
      }
    }

    if (adzunaJobs.length > 0 && savedJobs.length === 0) {
      await logAgent(insforge, input.userId, input.runId, "No Adzuna jobs could be saved.", "error");
      await updateAgentRun(insforge, input.userId, input.runId, "failed", 0);
      return { success: false, error: "We found jobs, but could not save them. Please try again." };
    }

    await updateAgentRun(insforge, input.userId, input.runId, "completed", savedJobs.length);
    await logAgent(
      insforge,
      input.userId,
      input.runId,
      `Found ${savedJobs.length} jobs for ${input.jobTitle}.`,
      "success",
    );

    return {
      success: true,
      jobsFound: savedJobs.length,
      strongMatches: savedJobs.filter((job) => job.matchScore >= MATCH_THRESHOLD).length,
      savedJobs,
    };
  } catch (error) {
    console.error("[agent/adzuna]", error);
    await logAgent(insforge, input.userId, input.runId, "Job discovery failed.", "error");
    await updateAgentRun(insforge, input.userId, input.runId, "failed", 0);
    return { success: false, error: "We could not find jobs right now. Please try again." };
  }
}

async function scoreAdzunaJob(
  insforge: InsforgeServerClient,
  input: DiscoverJobsInput,
  adzunaJob: AdzunaJob,
): Promise<JobMatchScore> {
  const result = await scoreJobAgainstProfile(adzunaJob, input.profile);

  if (result.success) {
    return result.score;
  }

  await logAgent(
    insforge,
    input.userId,
    input.runId,
    `Could not score ${adzunaJob.title} at ${adzunaJob.companyName}. Saved with fallback score.`,
    "warning",
  );

  return fallbackJobMatchScore(result.error);
}

async function saveAdzunaJob(
  insforge: InsforgeServerClient,
  input: DiscoverJobsInput,
  adzunaJob: AdzunaJob,
  matchScore: JobMatchScore,
): Promise<SavedJobSummary | null> {
  const payload = mapAdzunaJobToRecord(input, adzunaJob, matchScore);
  const { data, error } = await insforge.database
    .from("jobs")
    .insert([payload])
    .select("id")
    .single();

  if (error) {
    console.error("[agent/adzuna]", error);
    await logAgent(
      insforge,
      input.userId,
      input.runId,
      `Could not save ${adzunaJob.title} at ${adzunaJob.companyName}.`,
      "error",
    );
    return null;
  }

  const id = readInsertedId(data);
  if (!id) {
    await logAgent(
      insforge,
      input.userId,
      input.runId,
      `Could not confirm saved job ${adzunaJob.title} at ${adzunaJob.companyName}.`,
      "error",
    );
    return null;
  }

  return {
    id,
    title: adzunaJob.title,
    company: adzunaJob.companyName,
    matchScore: matchScore.matchScore,
  };
}

function mapAdzunaJobToRecord(
  input: DiscoverJobsInput,
  job: AdzunaJob,
  matchScore: JobMatchScore,
): JobInsertPayload {
  return {
    user_id: input.userId,
    run_id: input.runId,
    source: "search",
    source_url: job.redirectUrl,
    external_apply_url: job.redirectUrl,
    title: job.title,
    company: job.companyName,
    location: job.locationName || null,
    salary: formatSalary(job.salaryMin, job.salaryMax),
    job_type: normalizeJobType(job.contractType),
    about_role: job.description || null,
    responsibilities: [],
    requirements: [],
    nice_to_have: [],
    benefits: [],
    about_company: null,
    match_score: matchScore.matchScore,
    match_reason: matchScore.matchReason,
    matched_skills: matchScore.matchedSkills,
    missing_skills: matchScore.missingSkills,
    found_at: new Date().toISOString(),
  };
}

async function updateAgentRun(
  insforge: InsforgeServerClient,
  userId: string,
  runId: string,
  status: "completed" | "failed",
  jobsFound: number,
): Promise<void> {
  const { error } = await insforge.database
    .from("agent_runs")
    .update({
      status,
      jobs_found: jobsFound,
      completed_at: new Date().toISOString(),
    })
    .eq("id", runId)
    .eq("user_id", userId);

  if (error) {
    console.error("[agent/adzuna]", error);
  }
}

async function logAgent(
  insforge: InsforgeServerClient,
  userId: string,
  runId: string,
  message: string,
  level: "info" | "success" | "warning" | "error",
): Promise<void> {
  const { error } = await insforge.database.from("agent_logs").insert([
    {
      user_id: userId,
      run_id: runId,
      message,
      level,
    },
  ]);

  if (error) {
    console.error("[agent/adzuna]", error);
  }
}

async function captureJobFound(userId: string, matchScore: number): Promise<void> {
  try {
    await capturePostHogServerEvent("job_found", {
      userId,
      source: "search",
      matchScore,
    });
  } catch (error) {
    console.error("[agent/adzuna]", error);
  }
}

function normalizeJobType(contractType: string | null): JobType {
  const normalized = contractType?.toLowerCase().replace(/[\s-]/g, "_") ?? "";

  if (normalized.includes("part")) {
    return "parttime";
  }

  if (normalized.includes("contract")) {
    return "contract";
  }

  return "fulltime";
}

function formatSalary(min: number | null, max: number | null): string | null {
  if (min !== null && max !== null) {
    return `$${Math.round(min / 1000)}k - $${Math.round(max / 1000)}k`;
  }

  if (min !== null) {
    return `$${Math.round(min / 1000)}k+`;
  }

  if (max !== null) {
    return `Up to $${Math.round(max / 1000)}k`;
  }

  return null;
}

function readInsertedId(value: unknown): string {
  if (!isRecord(value)) {
    return "";
  }

  return typeof value.id === "string" ? value.id : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
