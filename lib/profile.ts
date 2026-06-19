import type {
  CoverLetterTone,
  Education,
  ExperienceLevel,
  ProfileRecord,
  RemotePreference,
  WorkAuthorization,
  WorkExperience,
} from "@/types/profile";

type CompletionInput = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  currentTitle: string;
  experienceLevel: string;
  yearsExperience: number | null;
  skills: string[];
  workExperience: WorkExperience[];
  education: Education;
  jobTitlesSeeking: string[];
  remotePreference: string;
  workAuthorization: string;
  coverLetterTone: string;
};

const requiredChecks: Array<{
  label: string;
  isPresent: (profile: CompletionInput) => boolean;
}> = [
  { label: "FULL NAME", isPresent: (profile) => hasText(profile.fullName) },
  { label: "EMAIL", isPresent: (profile) => hasText(profile.email) },
  { label: "PHONE", isPresent: (profile) => hasText(profile.phone) },
  { label: "LOCATION", isPresent: (profile) => hasText(profile.location) },
  { label: "CURRENT TITLE", isPresent: (profile) => hasText(profile.currentTitle) },
  { label: "EXPERIENCE", isPresent: (profile) => hasText(profile.experienceLevel) && profile.yearsExperience !== null },
  { label: "SKILLS", isPresent: (profile) => profile.skills.length > 0 },
  { label: "WORK EXPERIENCE", isPresent: (profile) => profile.workExperience.some(isCompleteWorkExperience) },
  { label: "EDUCATION", isPresent: (profile) => isCompleteEducation(profile.education) },
  { label: "JOB TITLES", isPresent: (profile) => profile.jobTitlesSeeking.length > 0 },
  { label: "REMOTE PREFERENCE", isPresent: (profile) => hasText(profile.remotePreference) },
  { label: "WORK AUTHORIZATION", isPresent: (profile) => hasText(profile.workAuthorization) },
  { label: "COVER LETTER TONE", isPresent: (profile) => hasText(profile.coverLetterTone) },
];

export function hasText(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function calculateProfileCompletion(profile: CompletionInput): {
  completionPercentage: number;
  missingFields: string[];
  isComplete: boolean;
} {
  const missingFields = requiredChecks
    .filter((check) => !check.isPresent(profile))
    .map((check) => check.label);
  const completeCount = requiredChecks.length - missingFields.length;
  const completionPercentage = Math.round((completeCount / requiredChecks.length) * 100);

  return {
    completionPercentage,
    missingFields,
    isComplete: missingFields.length === 0,
  };
}

export function completionBucket(percentage: number): number {
  return Math.max(0, Math.min(100, Math.round(percentage / 10) * 10));
}

export function emptyEducation(): Education {
  return {
    highestDegree: "",
    fieldOfStudy: "",
    institutionName: "",
    graduationYear: "",
  };
}

export function emptyWorkExperience(): WorkExperience {
  return {
    companyName: "",
    jobTitle: "",
    startDate: "",
    endDate: "",
    current: false,
    responsibilities: "",
  };
}

export function profileToCompletionInput(profile: ProfileRecord | null, fallbackEmail: string): CompletionInput {
  return {
    fullName: profile?.full_name ?? "",
    email: profile?.email ?? fallbackEmail,
    phone: profile?.phone ?? "",
    location: profile?.location ?? "",
    currentTitle: profile?.current_title ?? "",
    experienceLevel: profile?.experience_level ?? "",
    yearsExperience: profile?.years_experience ?? null,
    skills: profile?.skills ?? [],
    workExperience: profile?.work_experience ?? [],
    education: profile?.education ?? emptyEducation(),
    jobTitlesSeeking: profile?.job_titles_seeking ?? [],
    remotePreference: profile?.remote_preference ?? "",
    workAuthorization: profile?.work_authorization ?? "",
    coverLetterTone: profile?.cover_letter_tone ?? "",
  };
}

export function parseProfileRecord(value: unknown): ProfileRecord | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = readString(value.id);
  const createdAt = readString(value.created_at);
  const updatedAt = readString(value.updated_at);

  if (!id || !createdAt || !updatedAt) {
    return null;
  }

  return {
    id,
    full_name: readNullableString(value.full_name),
    email: readNullableString(value.email),
    phone: readNullableString(value.phone),
    location: readNullableString(value.location),
    current_title: readNullableString(value.current_title),
    experience_level: readEnum(value.experience_level, ["junior", "mid", "senior", "lead"]),
    years_experience: readNullableNumber(value.years_experience),
    skills: readStringArray(value.skills),
    industries: readStringArray(value.industries),
    work_experience: readWorkExperienceArray(value.work_experience),
    education: readEducation(value.education),
    job_titles_seeking: readStringArray(value.job_titles_seeking),
    remote_preference: readEnum(value.remote_preference, ["remote", "onsite", "hybrid", "any"]),
    preferred_locations: readStringArray(value.preferred_locations),
    salary_expectation: readNullableString(value.salary_expectation),
    cover_letter_tone: readEnum(value.cover_letter_tone, ["formal", "casual", "enthusiastic"]),
    linkedin_url: readNullableString(value.linkedin_url),
    portfolio_url: readNullableString(value.portfolio_url),
    work_authorization: readEnum(value.work_authorization, ["citizen", "permanent_resident", "visa_required"]),
    resume_pdf_url: readNullableString(value.resume_pdf_url),
    resume_pdf_key: readNullableString(value.resume_pdf_key),
    is_complete: typeof value.is_complete === "boolean" ? value.is_complete : false,
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

export function isExperienceLevel(value: string): value is ExperienceLevel {
  return ["junior", "mid", "senior", "lead"].includes(value);
}

export function isRemotePreference(value: string): value is RemotePreference {
  return ["remote", "onsite", "hybrid", "any"].includes(value);
}

export function isWorkAuthorization(value: string): value is WorkAuthorization {
  return ["citizen", "permanent_resident", "visa_required"].includes(value);
}

export function isCoverLetterTone(value: string): value is CoverLetterTone {
  return ["formal", "casual", "enthusiastic"].includes(value);
}

function isCompleteWorkExperience(experience: WorkExperience): boolean {
  return (
    hasText(experience.companyName) &&
    hasText(experience.jobTitle) &&
    hasText(experience.startDate) &&
    hasText(experience.responsibilities)
  );
}

function isCompleteEducation(education: Education): boolean {
  return (
    hasText(education.highestDegree) &&
    hasText(education.fieldOfStudy) &&
    hasText(education.institutionName) &&
    hasText(education.graduationYear)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readNullableString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readNullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

function readEnum<T extends string>(value: unknown, allowed: T[]): T | null {
  if (typeof value !== "string") {
    return null;
  }

  return allowed.find((item) => item === value) ?? null;
}

function readEducation(value: unknown): Education {
  if (!isRecord(value)) {
    return emptyEducation();
  }

  return {
    highestDegree: readString(value.highestDegree ?? value.highest_degree),
    fieldOfStudy: readString(value.fieldOfStudy ?? value.field_of_study),
    institutionName: readString(value.institutionName ?? value.institution_name),
    graduationYear: readString(value.graduationYear ?? value.graduation_year),
  };
}

function readWorkExperienceArray(value: unknown): WorkExperience[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord).map((item) => ({
    companyName: readString(item.companyName ?? item.company_name),
    jobTitle: readString(item.jobTitle ?? item.job_title),
    startDate: readString(item.startDate ?? item.start_date),
    endDate: readString(item.endDate ?? item.end_date),
    current: typeof item.current === "boolean" ? item.current : false,
    responsibilities: readString(item.responsibilities),
  }));
}
