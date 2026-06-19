"use server";

import { revalidatePath } from "next/cache";
import { capturePostHogServerEvent } from "@/lib/posthog-server";
import {
  calculateProfileCompletion,
  emptyEducation,
  hasText,
  isCoverLetterTone,
  isExperienceLevel,
  isRemotePreference,
  isWorkAuthorization,
  parseProfileRecord,
} from "@/lib/profile";
import { createInsforgeServer } from "@/lib/insforge-server";
import type { Education, ProfileActionState, WorkExperience } from "@/types/profile";

const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const PROFILE_ERROR = "We could not save your profile. Please check the fields and try again.";

type ProfilePayload = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  current_title: string | null;
  experience_level: string | null;
  years_experience: number | null;
  skills: string[];
  industries: string[];
  work_experience: WorkExperience[];
  education: Education;
  job_titles_seeking: string[];
  remote_preference: string | null;
  preferred_locations: string[];
  salary_expectation: string | null;
  cover_letter_tone: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  work_authorization: string | null;
  resume_pdf_url?: string | null;
  resume_pdf_key?: string | null;
  is_complete: boolean;
};

export async function saveProfile(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  try {
    const insforge = await createInsforgeServer();
    const { data: userData, error: userError } = await insforge.auth.getCurrentUser();

    if (userError || !userData.user) {
      return { success: false, message: "Please sign in again before saving your profile." };
    }

    const userId = userData.user.id;
    const email = readText(formData, "email") || userData.user.email || "";
    const existingProfile = await getExistingProfile(userId);
    const workExperience = readWorkExperience(formData).slice(0, 3);
    const education = readEducation(formData);
    const yearsExperience = readNumber(formData, "yearsExperience");
    const experienceLevel = readEnum(formData, "experienceLevel", isExperienceLevel);
    const remotePreference = readEnum(formData, "remotePreference", isRemotePreference);
    const workAuthorization = readEnum(formData, "workAuthorization", isWorkAuthorization);
    const coverLetterTone = readEnum(formData, "coverLetterTone", isCoverLetterTone);
    const skills = readJsonStringArray(formData, "skillsJson");
    const industries = readJsonStringArray(formData, "industriesJson");
    const jobTitlesSeeking = readJsonStringArray(formData, "jobTitlesSeekingJson");
    const preferredLocations = readJsonStringArray(formData, "preferredLocationsJson");
    const completion = calculateProfileCompletion({
      fullName: readText(formData, "fullName"),
      email,
      phone: readText(formData, "phone"),
      location: readText(formData, "location"),
      currentTitle: readText(formData, "currentTitle"),
      experienceLevel: experienceLevel ?? "",
      yearsExperience,
      skills,
      workExperience,
      education,
      jobTitlesSeeking,
      remotePreference: remotePreference ?? "",
      workAuthorization: workAuthorization ?? "",
      coverLetterTone: coverLetterTone ?? "",
    });

    const payload: ProfilePayload = {
      id: userId,
      full_name: optionalText(formData, "fullName"),
      email: email || null,
      phone: optionalText(formData, "phone"),
      location: optionalText(formData, "location"),
      current_title: optionalText(formData, "currentTitle"),
      experience_level: experienceLevel,
      years_experience: yearsExperience,
      skills,
      industries,
      work_experience: workExperience,
      education,
      job_titles_seeking: jobTitlesSeeking,
      remote_preference: remotePreference,
      preferred_locations: preferredLocations,
      salary_expectation: optionalText(formData, "salaryExpectation"),
      cover_letter_tone: coverLetterTone,
      linkedin_url: optionalText(formData, "linkedinUrl"),
      portfolio_url: optionalText(formData, "portfolioUrl"),
      work_authorization: workAuthorization,
      is_complete: completion.isComplete,
    };

    const resumeFile = readResumeFile(formData);
    if (resumeFile) {
      const uploadResult = await replaceResumeFile(userId, existingProfile?.resume_pdf_key ?? null, resumeFile);
      if (!uploadResult.success) {
        return {
          success: false,
          message: uploadResult.message,
          completionPercentage: completion.completionPercentage,
          missingFields: completion.missingFields,
        };
      }

      payload.resume_pdf_url = uploadResult.url;
      payload.resume_pdf_key = uploadResult.key;
    }

    const writeError = existingProfile
      ? await updateProfile(userId, payload)
      : await insertProfile(payload);

    if (writeError) {
      console.error("[actions/profile]", writeError);
      return {
        success: false,
        message: PROFILE_ERROR,
        completionPercentage: completion.completionPercentage,
        missingFields: completion.missingFields,
      };
    }

    if (!existingProfile?.is_complete && completion.isComplete) {
      await capturePostHogServerEvent("profile_completed", { userId });
    }

    revalidatePath("/profile");

    return {
      success: true,
      message: completion.isComplete
        ? "Profile saved. You are ready for tailored job matches."
        : "Profile saved. Complete the highlighted fields when you can.",
      completionPercentage: completion.completionPercentage,
      missingFields: completion.missingFields,
    };
  } catch (error) {
    console.error("[actions/profile]", error);
    return { success: false, message: PROFILE_ERROR };
  }
}

async function getExistingProfile(userId: string) {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[actions/profile]", error);
    return null;
  }

  const profileData: unknown = data;
  return parseProfileRecord(profileData);
}

async function insertProfile(payload: ProfilePayload): Promise<unknown | null> {
  const insforge = await createInsforgeServer();
  const { error } = await insforge.database.from("profiles").insert([payload]);
  return error ?? null;
}

async function updateProfile(userId: string, payload: ProfilePayload): Promise<unknown | null> {
  const insforge = await createInsforgeServer();
  const { error } = await insforge.database.from("profiles").update(payload).eq("id", userId);
  return error ?? null;
}

async function replaceResumeFile(
  userId: string,
  existingKey: string | null,
  file: File,
): Promise<
  | { success: true; url: string; key: string }
  | { success: false; message: string }
> {
  if (file.size > MAX_RESUME_BYTES) {
    return { success: false, message: "Resume must be a PDF under 5MB." };
  }

  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    return { success: false, message: "Please upload a PDF resume." };
  }

  const insforge = await createInsforgeServer();
  const targetKey = `${userId}/resume.pdf`;
  const keysToRemove = new Set([targetKey]);

  if (existingKey) {
    keysToRemove.add(existingKey);
  }

  for (const key of keysToRemove) {
    await insforge.storage.from("resumes").remove(key);
  }

  const { data, error } = await insforge.storage.from("resumes").upload(targetKey, file);
  if (error) {
    console.error("[actions/profile]", error);
    return { success: false, message: "We could not upload your resume. Please try again." };
  }

  const uploadData: unknown = data;
  if (!isUploadData(uploadData)) {
    return { success: false, message: "We could not confirm the resume upload. Please try again." };
  }

  return { success: true, url: uploadData.url, key: uploadData.key };
}

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(formData: FormData, key: string): string | null {
  const value = readText(formData, key);
  return hasText(value) ? value : null;
}

function readNumber(formData: FormData, key: string): number | null {
  const value = readText(formData, key);
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function readEnum<T extends string>(
  formData: FormData,
  key: string,
  isValid: (value: string) => value is T,
): T | null {
  const value = readText(formData, key);
  return isValid(value) ? value : null;
}

function readJsonStringArray(formData: FormData, key: string): string[] {
  const value = readText(formData, key);
  if (!value) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function readEducation(formData: FormData): Education {
  const education = emptyEducation();

  return {
    ...education,
    highestDegree: readText(formData, "highestDegree"),
    fieldOfStudy: readText(formData, "fieldOfStudy"),
    institutionName: readText(formData, "institutionName"),
    graduationYear: readText(formData, "graduationYear"),
  };
}

function readWorkExperience(formData: FormData): WorkExperience[] {
  const value = readText(formData, "workExperienceJson");
  if (!value) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isWorkExperience).filter(hasAnyWorkExperience);
  } catch {
    return [];
  }
}

function readResumeFile(formData: FormData): File | null {
  const value = formData.get("resume");
  return value instanceof File && value.size > 0 ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isWorkExperience(value: unknown): value is WorkExperience {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.companyName === "string" &&
    typeof value.jobTitle === "string" &&
    typeof value.startDate === "string" &&
    typeof value.endDate === "string" &&
    typeof value.current === "boolean" &&
    typeof value.responsibilities === "string"
  );
}

function hasAnyWorkExperience(value: WorkExperience): boolean {
  return (
    hasText(value.companyName) ||
    hasText(value.jobTitle) ||
    hasText(value.startDate) ||
    hasText(value.endDate) ||
    hasText(value.responsibilities)
  );
}

function isUploadData(value: unknown): value is { url: string; key: string } {
  return (
    isRecord(value) &&
    typeof value.url === "string" &&
    typeof value.key === "string"
  );
}
