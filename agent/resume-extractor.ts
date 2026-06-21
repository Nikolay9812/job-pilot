import OpenAI from "openai";
import {
  emptyEducation,
  isCoverLetterTone,
  isExperienceLevel,
  isRemotePreference,
  isWorkAuthorization,
} from "@/lib/profile";
import type { Education, ExtractedProfileData, WorkExperience } from "@/types/profile";

const EXTRACTION_ERROR = "We could not extract your resume details. Please try again.";
const OPENAI_QUOTA_ERROR =
  "OpenAI quota is exhausted. Check the OpenAI project billing or use an API key with available credits.";
const OPENAI_RATE_LIMIT_ERROR = "OpenAI is rate limiting resume extraction. Please wait a moment and try again.";

type ResumeExtractionResult =
  | { success: true; data: ExtractedProfileData }
  | { success: false; error: string; status?: number };

const extractionSystemPrompt = `You extract structured candidate profile data from resume text.

Return ONLY valid JSON using these exact keys:
{
  "fullName": string,
  "email": string,
  "phone": string,
  "location": string,
  "linkedinUrl": string,
  "portfolioUrl": string,
  "workAuthorization": "citizen" | "permanent_resident" | "visa_required" | "",
  "currentTitle": string,
  "experienceLevel": "junior" | "mid" | "senior" | "lead" | "",
  "yearsExperience": number | null,
  "skills": string[],
  "industries": string[],
  "workExperience": [
    {
      "companyName": string,
      "jobTitle": string,
      "startDate": string,
      "endDate": string,
      "current": boolean,
      "responsibilities": string
    }
  ],
  "education": {
    "highestDegree": string,
    "fieldOfStudy": string,
    "institutionName": string,
    "graduationYear": string
  },
  "jobTitlesSeeking": string[],
  "remotePreference": "remote" | "onsite" | "hybrid" | "any" | "",
  "preferredLocations": string[],
  "salaryExpectation": string,
  "coverLetterTone": "formal" | "casual" | "enthusiastic" | ""
}

Rules:
- Extract only facts supported by the resume text.
- Do not invent salary, work authorization, preferred locations, remote preference, or cover letter tone.
- Use an empty string, empty array, or null when a field is not present.
- Keep workExperience to the three most relevant roles.
- responsibilities should be a compact plain text summary from resume bullets.
- Derive experienceLevel conservatively from titles and years only when clear.
- Normalize skills to concise names like "React", "TypeScript", "Next.js".`;

export async function extractProfileFromResumeBuffer(
  resumeBuffer: Buffer,
): Promise<ResumeExtractionResult> {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.responses.create({
      model: "gpt-4o",
      instructions: extractionSystemPrompt,
      temperature: 0.3,
      max_output_tokens: 800,
      text: { format: { type: "json_object" } },
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_file",
              filename: "resume.pdf",
              file_data: `data:application/pdf;base64,${resumeBuffer.toString("base64")}`,
            },
            {
              type: "input_text",
              text: "Extract profile details from this resume PDF and return valid json only.",
            },
          ],
        },
      ],
    });

    const content = response.output_text;
    if (!content) {
      return { success: false, error: EXTRACTION_ERROR };
    }

    const parsed: unknown = JSON.parse(content);
    return { success: true, data: normalizeExtractedProfile(parsed) };
  } catch (error) {
    if (isOpenAIQuotaError(error)) {
      console.error("[agent/resume-extractor]", "OpenAI quota exceeded.");
      return { success: false, error: OPENAI_QUOTA_ERROR, status: 429 };
    }

    if (isOpenAIRateLimitError(error)) {
      console.error("[agent/resume-extractor]", "OpenAI rate limit exceeded.");
      return { success: false, error: OPENAI_RATE_LIMIT_ERROR, status: 429 };
    }

    console.error("[agent/resume-extractor]", error);
    return { success: false, error: EXTRACTION_ERROR };
  }
}

function normalizeExtractedProfile(value: unknown): ExtractedProfileData {
  const record = isRecord(value) ? value : {};
  const education = readEducation(record.education);

  return {
    fullName: readString(record.fullName),
    email: readString(record.email),
    phone: readString(record.phone),
    location: readString(record.location),
    linkedinUrl: readString(record.linkedinUrl),
    portfolioUrl: readString(record.portfolioUrl),
    workAuthorization: readEnum(record.workAuthorization, isWorkAuthorization),
    currentTitle: readString(record.currentTitle),
    experienceLevel: readEnum(record.experienceLevel, isExperienceLevel),
    yearsExperience: readNullableNumber(record.yearsExperience),
    skills: readStringArray(record.skills),
    industries: readStringArray(record.industries),
    workExperience: readWorkExperienceArray(record.workExperience).slice(0, 3),
    education,
    jobTitlesSeeking: readStringArray(record.jobTitlesSeeking),
    remotePreference: readEnum(record.remotePreference, isRemotePreference),
    preferredLocations: readStringArray(record.preferredLocations),
    salaryExpectation: readString(record.salaryExpectation),
    coverLetterTone: readEnum(record.coverLetterTone, isCoverLetterTone),
  };
}

function readEducation(value: unknown): Education {
  if (!isRecord(value)) {
    return emptyEducation();
  }

  return {
    highestDegree: readString(value.highestDegree),
    fieldOfStudy: readString(value.fieldOfStudy),
    institutionName: readString(value.institutionName),
    graduationYear: readString(value.graduationYear),
  };
}

function readWorkExperienceArray(value: unknown): WorkExperience[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord).map((item) => ({
    companyName: readString(item.companyName),
    jobTitle: readString(item.jobTitle),
    startDate: readString(item.startDate),
    endDate: readString(item.endDate),
    current: typeof item.current === "boolean" ? item.current : false,
    responsibilities: readString(item.responsibilities),
  }));
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

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readNullableNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }

  return Math.round(value);
}

function readEnum<T extends string>(value: unknown, isValid: (value: string) => value is T): T | "" {
  return typeof value === "string" && isValid(value) ? value : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOpenAIQuotaError(value: unknown): boolean {
  return readErrorString(value, "code") === "insufficient_quota";
}

function isOpenAIRateLimitError(value: unknown): boolean {
  return readErrorNumber(value, "status") === 429;
}

function readErrorString(value: unknown, key: string): string {
  const record = isRecord(value) ? value : {};
  const direct = record[key];
  if (typeof direct === "string") {
    return direct;
  }

  const nestedError = isRecord(record.error) ? record.error : {};
  const nested = nestedError[key];
  return typeof nested === "string" ? nested : "";
}

function readErrorNumber(value: unknown, key: string): number | null {
  const record = isRecord(value) ? value : {};
  const direct = record[key];
  return typeof direct === "number" ? direct : null;
}
