import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { discoverJobs } from "@/agent/adzuna";
import { detectAdzunaCountry } from "@/lib/adzuna";
import { createInsforgeServer } from "@/lib/insforge-server";
import { parseProfileRecord } from "@/lib/profile";
import { capturePostHogServerEvent } from "@/lib/posthog-server";
import type { FindJobsResponse } from "@/types/jobs";

export const runtime = "nodejs";

type SearchRequest = {
  jobTitle: string;
  location: string;
};

export async function POST(request: NextRequest): Promise<NextResponse<FindJobsResponse>> {
  try {
    const body = await readRequestBody(request);
    const search = parseSearchRequest(body);

    if (!search) {
      return NextResponse.json(
        { success: false, error: "Enter a job title before finding jobs." },
        { status: 400 },
      );
    }

    const insforge = await createInsforgeServer();
    const { data: userData, error: userError } = await insforge.auth.getCurrentUser();

    if (userError || !userData.user) {
      return NextResponse.json(
        { success: false, error: "Please sign in again before finding jobs." },
        { status: 401 },
      );
    }

    const userId = userData.user.id;
    const { data: profileData, error: profileError } = await insforge.database
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      console.error("[agent/find]", profileError);
      return NextResponse.json(
        { success: false, error: "We could not load your saved profile." },
        { status: 500 },
      );
    }

    const profile = parseProfileRecord(profileData);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Save your profile before finding jobs." },
        { status: 400 },
      );
    }

    if (!profile.is_complete) {
      return NextResponse.json(
        { success: false, error: "Complete and save your profile before finding jobs." },
        { status: 400 },
      );
    }

    const runId = await createAgentRun(userId, search.jobTitle, search.location);
    if (!runId) {
      return NextResponse.json(
        { success: false, error: "We could not start the job search. Please try again." },
        { status: 500 },
      );
    }

    await captureJobSearchStarted(userId, search.jobTitle, search.location);

    const result = await discoverJobs({
      userId,
      runId,
      jobTitle: search.jobTitle,
      location: search.location,
      country: detectAdzunaCountry(search.location),
      profile,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 },
      );
    }

    revalidatePath("/find-jobs");

    return NextResponse.json({
      success: true,
      data: {
        runId,
        jobsFound: result.jobsFound,
        strongMatches: result.strongMatches,
      },
    });
  } catch (error) {
    console.error("[agent/find]", error);
    return NextResponse.json(
      { success: false, error: "We could not find jobs right now. Please try again." },
      { status: 500 },
    );
  }
}

async function readRequestBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function parseSearchRequest(value: unknown): SearchRequest | null {
  if (!isRecord(value)) {
    return null;
  }

  const jobTitle = readString(value.jobTitle);
  const location = readString(value.location);

  if (!jobTitle) {
    return null;
  }

  return { jobTitle, location };
}

async function createAgentRun(
  userId: string,
  jobTitle: string,
  location: string,
): Promise<string> {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("agent_runs")
    .insert([
      {
        user_id: userId,
        status: "running",
        job_title_searched: jobTitle,
        location_searched: location || null,
      },
    ])
    .select("id")
    .single();

  if (error) {
    console.error("[agent/find]", error);
    return "";
  }

  return readId(data);
}

async function captureJobSearchStarted(
  userId: string,
  jobTitle: string,
  location: string,
): Promise<void> {
  try {
    await capturePostHogServerEvent("job_search_started", {
      userId,
      jobTitle,
      location,
    });
  } catch (error) {
    console.error("[agent/find]", error);
  }
}

function readId(value: unknown): string {
  if (!isRecord(value)) {
    return "";
  }

  return typeof value.id === "string" ? value.id : "";
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
