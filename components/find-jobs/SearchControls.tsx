"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, Search, Sparkles } from "lucide-react";
import type { FindJobsResponse } from "@/types/jobs";

type SearchStatus =
  | { kind: "idle"; message: "" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export function SearchControls() {
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [status, setStatus] = useState<SearchStatus>({ kind: "idle", message: "" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const cleanJobTitle = jobTitle.trim();
    const cleanLocation = location.trim();

    if (!cleanJobTitle) {
      setStatus({ kind: "error", message: "Enter a job title before finding jobs." });
      return;
    }

    setIsSearching(true);
    setStatus({ kind: "idle", message: "" });

    try {
      const response = await fetch("/api/agent/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle: cleanJobTitle, location: cleanLocation }),
      });
      const payload = parseFindJobsResponse(await response.json());

      if (!response.ok || !payload.success) {
        setStatus({
          kind: "error",
          message: payload.success ? "We could not find jobs right now. Please try again." : payload.error,
        });
        return;
      }

      const jobLabel = payload.data.jobsFound === 1 ? "job" : "jobs";
      const matchLabel = payload.data.strongMatches === 1 ? "strong match" : "strong matches";
      setStatus({
        kind: "success",
        message: `Found ${payload.data.jobsFound} ${jobLabel} and saved ${payload.data.strongMatches} ${matchLabel}.`,
      });
    } catch (error) {
      console.error("[SearchControls]", error);
      setStatus({ kind: "error", message: "We could not find jobs right now. Please try again." });
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-card">
      <form className="grid gap-5 lg:grid-cols-[1fr_1fr_auto] lg:items-end" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase leading-5 text-text-secondary">
            Job Title
          </span>
          <span className="flex min-h-12 items-center gap-3 rounded-md border border-border bg-surface px-4 py-2 shadow-sm">
            <Search className="h-5 w-5 text-info-muted" aria-hidden="true" />
            <input
              type="text"
              placeholder="Frontend Engineer"
              value={jobTitle}
              onChange={(event) => setJobTitle(event.target.value)}
              className="w-full bg-transparent text-base font-medium leading-6 text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase leading-5 text-text-secondary">
            Location
          </span>
          <span className="flex min-h-12 items-center rounded-md border border-border bg-surface px-4 py-2 shadow-sm">
            <input
              type="text"
              placeholder="Remote, New York..."
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="w-full bg-transparent text-base font-medium leading-6 text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </span>
        </label>

        <button
          type="submit"
          disabled={isSearching}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-accent px-6 py-3 text-base font-semibold leading-6 text-accent-foreground shadow-card transition-colors hover:bg-accent-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:bg-accent-light disabled:text-accent"
        >
          <Search className="h-5 w-5" aria-hidden="true" />
          {isSearching ? "Finding Jobs..." : "Find Jobs"}
        </button>
      </form>

      {status.kind !== "idle" ? (
        <div
          className={`mt-5 flex min-h-12 items-center gap-3 rounded-md border px-4 py-3 ${
            status.kind === "success"
              ? "border-success-light bg-success-lightest"
              : "border-error bg-surface"
          }`}
          role="status"
          aria-live="polite"
        >
          {status.kind === "success" ? (
            <Sparkles className="h-5 w-5 text-success-alt" aria-hidden="true" />
          ) : (
            <AlertCircle className="h-5 w-5 text-error" aria-hidden="true" />
          )}
          <p
            className={`text-base font-semibold leading-6 ${
              status.kind === "success" ? "text-success-darker" : "text-error"
            }`}
          >
            {status.message}
          </p>
        </div>
      ) : null}
    </section>
  );
}

function parseFindJobsResponse(value: unknown): FindJobsResponse {
  if (!isRecord(value) || typeof value.success !== "boolean") {
    return { success: false, error: "We could not find jobs right now. Please try again." };
  }

  if (!value.success) {
    return {
      success: false,
      error: readString(value.error) || "We could not find jobs right now. Please try again.",
    };
  }

  const data = isRecord(value.data) ? value.data : {};
  return {
    success: true,
    data: {
      runId: readString(data.runId),
      jobsFound: readNumber(data.jobsFound),
      strongMatches: readNumber(data.strongMatches),
    },
  };
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
