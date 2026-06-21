import OpenAI from "openai";
import type { AdzunaJob } from "@/lib/adzuna";
import type { JobMatchScore } from "@/types/jobs";
import type { ProfileRecord } from "@/types/profile";

const MATCHING_ERROR = "We could not score this job against your profile.";

type JobMatchingResult =
  | { success: true; score: JobMatchScore }
  | { success: false; error: string };

const matchingSystemPrompt = `You score software job listings against a candidate profile.

Return ONLY valid JSON using these exact keys:
{
  "matchScore": number,
  "matchReason": string,
  "matchedSkills": string[],
  "missingSkills": string[]
}

Rules:
- matchScore must be an integer from 0 to 100.
- Score based on the provided candidate profile and the Adzuna job snippet only.
- Favor concrete overlap in skills, title, seniority, location/remote preference, and industry fit.
- Do not invent job requirements that are not present in the snippet.
- matchReason must be one concise paragraph.
- matchedSkills are skills the candidate has that the listing appears to need.
- missingSkills are job-relevant skills from the listing that are absent from the profile.`;

export async function scoreJobAgainstProfile(
  job: AdzunaJob,
  profile: ProfileRecord,
): Promise<JobMatchingResult> {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.responses.create({
      model: "gpt-4o",
      instructions: matchingSystemPrompt,
      temperature: 0.3,
      max_output_tokens: 300,
      text: { format: { type: "json_object" } },
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Return valid json scoring this job against the saved profile.

CANDIDATE PROFILE:
Current title: ${profile.current_title ?? ""}
Experience: ${profile.years_experience ?? "unknown"} years, level ${profile.experience_level ?? "unknown"}
Skills: ${profile.skills.join(", ")}
Industries: ${profile.industries.join(", ")}
Job titles seeking: ${profile.job_titles_seeking.join(", ")}
Remote preference: ${profile.remote_preference ?? "unknown"}
Preferred locations: ${profile.preferred_locations.join(", ")}
Work history: ${JSON.stringify(profile.work_experience)}

ADZUNA JOB:
Title: ${job.title}
Company: ${job.companyName}
Location: ${job.locationName}
Contract type: ${job.contractType ?? "unknown"}
Description snippet: ${job.description}`,
            },
          ],
        },
      ],
    });

    const content = response.output_text;
    if (!content) {
      return { success: false, error: MATCHING_ERROR };
    }

    const parsed: unknown = JSON.parse(content);
    return { success: true, score: normalizeJobMatchScore(parsed) };
  } catch (error) {
    console.error("[agent/matcher]", error);
    return { success: false, error: MATCHING_ERROR };
  }
}

export function fallbackJobMatchScore(error: string): JobMatchScore {
  return {
    matchScore: 0,
    matchReason: `${error} Review the job manually before applying.`,
    matchedSkills: [],
    missingSkills: [],
  };
}

function normalizeJobMatchScore(value: unknown): JobMatchScore {
  const record = isRecord(value) ? value : {};

  return {
    matchScore: clampScore(record.matchScore),
    matchReason: readString(record.matchReason) || "This job was scored from the available Adzuna snippet.",
    matchedSkills: readStringArray(record.matchedSkills),
    missingSkills: readStringArray(record.missingSkills),
  };
}

function clampScore(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
