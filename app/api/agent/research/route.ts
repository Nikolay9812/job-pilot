import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { researchCompany } from "@/agent/research";
import { createInsforgeServer } from "@/lib/insforge-server";
import { parseJobDetails } from "@/lib/jobs";
import { parseProfileRecord } from "@/lib/profile";
import { capturePostHogServerEvent } from "@/lib/posthog-server";
import type { JobDetails, ResearchCompanyResponse } from "@/types/jobs";
import type { ProfileRecord } from "@/types/profile";

export const runtime = "nodejs";

type ResearchRequest = {
  jobId: string;
};

const JOB_DETAILS_COLUMNS = [
  "id",
  "title",
  "company",
  "salary",
  "location",
  "job_type",
  "source_url",
  "external_apply_url",
  "about_role",
  "responsibilities",
  "requirements",
  "nice_to_have",
  "benefits",
  "about_company",
  "match_score",
  "match_reason",
  "matched_skills",
  "missing_skills",
  "company_research",
  "found_at",
].join(",");

export async function POST(request: NextRequest): Promise<NextResponse<ResearchCompanyResponse>> {
  try {
    const body = await readRequestBody(request);
    const researchRequest = parseResearchRequest(body);

    if (!researchRequest) {
      return NextResponse.json(
        { success: false, error: "Choose a saved job before researching the company." },
        { status: 400 },
      );
    }

    const insforge = await createInsforgeServer();
    const { data: userData, error: userError } = await insforge.auth.getCurrentUser();

    if (userError || !userData.user) {
      return NextResponse.json(
        { success: false, error: "Please sign in again before researching this company." },
        { status: 401 },
      );
    }

    const userId = userData.user.id;
    const [job, profileResult] = await Promise.all([
      loadJobDetails(researchRequest.jobId, userId),
      loadProfile(userId),
    ]);

    if (!job) {
      return NextResponse.json(
        { success: false, error: "We could not find that saved job." },
        { status: 404 },
      );
    }

    if (!profileResult.success) {
      return NextResponse.json(
        { success: false, error: profileResult.error },
        { status: profileResult.status },
      );
    }

    const result = await researchCompany({
      userId,
      job,
      profile: profileResult.profile,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 },
      );
    }

    const { error: updateError } = await insforge.database
      .from("jobs")
      .update({ company_research: result.dossier })
      .eq("id", job.id)
      .eq("user_id", userId);

    if (updateError) {
      console.error("[agent/research]", updateError);
      return NextResponse.json(
        { success: false, error: "We created the research, but could not save it. Please try again." },
        { status: 500 },
      );
    }

    await captureCompanyResearched(userId, job);
    revalidatePath(`/find-jobs/${job.id}`);

    return NextResponse.json({
      success: true,
      data: {
        dossier: result.dossier,
      },
    });
  } catch (error) {
    console.error("[agent/research]", error);
    return NextResponse.json(
      { success: false, error: "We could not research this company right now. Please try again." },
      { status: 500 },
    );
  }
}

async function loadJobDetails(jobId: string, userId: string): Promise<JobDetails | null> {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("jobs")
    .select(JOB_DETAILS_COLUMNS)
    .eq("id", jobId)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("[agent/research]", error);
    return null;
  }

  return parseJobDetails(data);
}

async function loadProfile(
  userId: string,
): Promise<
  | { success: true; profile: ProfileRecord }
  | { success: false; status: number; error: string }
> {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[agent/research]", error);
    return { success: false, status: 500, error: "We could not load your saved profile." };
  }

  const profile = parseProfileRecord(data);

  if (!profile) {
    return { success: false, status: 400, error: "Save your profile before researching companies." };
  }

  if (!profile.is_complete) {
    return {
      success: false,
      status: 400,
      error: "Complete and save your profile before researching companies.",
    };
  }

  return { success: true, profile };
}

async function captureCompanyResearched(userId: string, job: JobDetails): Promise<void> {
  try {
    await capturePostHogServerEvent("company_researched", {
      userId,
      jobId: job.id,
      company: job.company,
    });
  } catch (error) {
    console.error("[agent/research]", error);
  }
}

async function readRequestBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function parseResearchRequest(value: unknown): ResearchRequest | null {
  if (!isRecord(value)) {
    return null;
  }

  const jobId = readString(value.jobId);

  if (!jobId) {
    return null;
  }

  return { jobId };
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
