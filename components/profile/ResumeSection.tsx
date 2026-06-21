"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Sparkles, UploadCloud } from "lucide-react";
import type {
  ExtractedProfileData,
  ExtractResumeResponse,
  GenerateResumeResponse,
  ProfileRecord,
} from "@/types/profile";

type ResumeSectionProps = {
  formId: string;
  profile: ProfileRecord | null;
  onExtractedProfile: (profile: ExtractedProfileData) => void;
};

export function ResumeSection({
  formId,
  profile,
  onExtractedProfile,
}: ResumeSectionProps) {
  const router = useRouter();
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResumeUrl, setGeneratedResumeUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const currentResumeUrl = generatedResumeUrl ?? profile?.resume_pdf_url ?? null;
  const hasResume = Boolean(currentResumeUrl);

  async function handleExtractResume(): Promise<void> {
    setIsExtracting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/resume/extract", { method: "POST" });
      const result: unknown = await response.json();

      if (!isExtractResumeResponse(result)) {
        setMessage({ kind: "error", text: "We could not extract your resume details." });
        return;
      }

      if (!result.success) {
        setMessage({ kind: "error", text: result.error });
        return;
      }

      onExtractedProfile(result.data);
      setMessage({
        kind: "success",
        text: "Resume details extracted. Review the populated fields before saving.",
      });
    } catch (error) {
      console.error("[ResumeSection]", error);
      setMessage({ kind: "error", text: "We could not extract your resume details." });
    } finally {
      setIsExtracting(false);
    }
  }

  async function handleGenerateResume(): Promise<void> {
    setIsGenerating(true);
    setMessage(null);

    try {
      const response = await fetch("/api/resume/generate", { method: "POST" });
      const result: unknown = await response.json();

      if (!isGenerateResumeResponse(result)) {
        setMessage({ kind: "error", text: "We could not generate your resume." });
        return;
      }

      if (!result.success) {
        setMessage({ kind: "error", text: result.error });
        return;
      }

      setGeneratedResumeUrl(result.data.resumePdfUrl);
      setMessage({
        kind: "success",
        text: "Resume generated and saved. Your current resume has been updated.",
      });
      router.refresh();
    } catch (error) {
      console.error("[ResumeSection]", error);
      setMessage({ kind: "error", text: "We could not generate your resume." });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-8 shadow-card">
      <div>
        <h2 className="text-xl font-semibold leading-7 text-text-primary">Resume</h2>
        <p className="mt-1 text-sm font-medium leading-5 text-text-secondary">
          Upload an existing resume to auto-fill the profile, or generate a new tailored one
          from your details below.
        </p>
      </div>

      <div className="profile-upload-zone mt-7 flex min-h-60 flex-col items-center justify-center rounded-xl px-6 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface shadow-card">
          <UploadCloud className="h-6 w-6 text-accent" aria-hidden="true" />
        </div>
        <p className="mt-5 text-base font-semibold leading-6 text-text-primary">
          Click to upload or drag and drop
        </p>
        <p className="mt-1 text-sm font-medium leading-5 text-text-secondary">
          PDF formatting only. Maximum file size 5MB.
        </p>
        <label
          htmlFor="resume"
          className="mt-6 inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-surface px-6 py-2 text-sm font-semibold leading-5 text-text-primary shadow-card transition-colors hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Select Resume
        </label>
        <input
          id="resume"
          name="resume"
          type="file"
          accept="application/pdf,.pdf"
          form={formId}
          className="sr-only"
        />
        {hasResume ? (
          <a
            href={currentResumeUrl ?? undefined}
            target="_blank"
            rel="noreferrer"
            className="mt-4 text-sm font-semibold leading-5 text-accent"
          >
            Current resume saved
          </a>
        ) : null}
        {hasResume ? (
          <button
            type="button"
            onClick={handleExtractResume}
            disabled={isExtracting}
            className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-accent px-5 py-2 text-sm font-semibold leading-5 text-accent-foreground transition-colors hover:bg-accent-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:bg-accent-light disabled:text-accent"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {isExtracting ? "Extracting..." : "Extract from Resume"}
          </button>
        ) : null}
        {message ? (
          <p
            className={`mt-4 rounded-md border bg-surface px-4 py-3 text-sm font-medium leading-5 ${
              message.kind === "success"
                ? "border-success text-success-foreground"
                : "border-error text-error"
            }`}
          >
            {message.text}
          </p>
        ) : null}
      </div>

      <div className="mt-7 flex flex-col gap-4 border-t border-border pt-7 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium leading-5 text-text-secondary">
          Need a fresh document based on the fields below?
        </p>
        <button
          type="button"
          onClick={handleGenerateResume}
          disabled={isGenerating}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-accent px-5 py-2 text-sm font-semibold leading-5 text-accent-foreground transition-colors hover:bg-accent-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:bg-accent-light disabled:text-accent"
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          {isGenerating ? "Generating..." : "Generate Resume from Profile"}
        </button>
      </div>
    </section>
  );
}

function isExtractResumeResponse(value: unknown): value is ExtractResumeResponse {
  if (!isRecord(value) || typeof value.success !== "boolean") {
    return false;
  }

  if (value.success) {
    return isRecord(value.data);
  }

  return typeof value.error === "string";
}

function isGenerateResumeResponse(value: unknown): value is GenerateResumeResponse {
  if (!isRecord(value) || typeof value.success !== "boolean") {
    return false;
  }

  if (value.success) {
    return (
      isRecord(value.data) &&
      typeof value.data.resumePdfUrl === "string"
    );
  }

  return typeof value.error === "string";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
