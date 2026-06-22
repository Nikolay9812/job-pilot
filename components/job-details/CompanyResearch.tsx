"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CircleHelp,
  Code2,
  Compass,
  ExternalLink,
  ListChecks,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CompanyResearchDossier, ResearchCompanyResponse } from "@/types/jobs";

type CompanyResearchProps = {
  jobId: string;
  company: string;
  companyResearch: CompanyResearchDossier | null;
};

type DossierListSection = {
  label: string;
  items: string[];
  icon: LucideIcon;
  tone: "default" | "success" | "accent" | "info";
};

export function CompanyResearch({
  jobId,
  company,
  companyResearch,
}: CompanyResearchProps) {
  const router = useRouter();
  const [dossier, setDossier] = useState<CompanyResearchDossier | null>(companyResearch);
  const [error, setError] = useState("");
  const [isResearching, setIsResearching] = useState(false);
  const hasDossier = dossier !== null;
  const buttonLabel = hasDossier ? "Refresh Research" : "Research Company";
  const techStack = dossier ? uniqueStrings(dossier.techStack) : [];
  const sources = dossier ? uniqueStrings(dossier.sources) : [];
  const listSections: DossierListSection[] = dossier
    ? [
        { label: "Culture", items: dossier.culture, icon: UsersRound, tone: "info" },
        { label: "Your Edge", items: dossier.yourEdge, icon: ShieldCheck, tone: "success" },
        { label: "Gaps To Address", items: dossier.gapsToAddress, icon: ListChecks, tone: "accent" },
        { label: "Smart Questions", items: dossier.smartQuestions, icon: CircleHelp, tone: "info" },
        { label: "Interview Prep", items: dossier.interviewPrep, icon: Target, tone: "default" },
      ]
    : [];

  async function handleResearch(): Promise<void> {
    setError("");
    setIsResearching(true);

    try {
      const response = await fetch("/api/agent/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const payload = await parseResearchResponse(response);

      if (!response.ok || !payload.success) {
        setError(payload.success ? "We could not research this company right now." : payload.error);
        return;
      }

      setDossier(payload.data.dossier);
      router.refresh();
    } catch (researchError) {
      console.error("[CompanyResearch]", researchError);
      setError("We could not research this company right now. Please try again.");
    } finally {
      setIsResearching(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      <div className="flex flex-col gap-4 border-b border-border p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-muted">
            <Building2 className="h-4 w-4 text-accent" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold leading-7 text-text-primary">Company Research</h2>
            {hasDossier ? (
              <p className="mt-1 text-sm font-medium leading-5 text-text-muted">
                Saved dossier for {company}
              </p>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={handleResearch}
          disabled={isResearching}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold leading-5 text-accent-foreground shadow-card transition-colors hover:bg-accent-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:bg-accent-light disabled:text-accent"
        >
          {isResearching ? (
            <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : hasDossier ? (
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Search className="h-4 w-4" aria-hidden="true" />
          )}
          {isResearching ? "Researching..." : buttonLabel}
        </button>
      </div>

      {error ? (
        <div
          className="mx-6 mt-6 rounded-md border border-error bg-surface px-4 py-3 text-sm font-medium leading-5 text-error"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {isResearching && !dossier ? (
        <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent-muted">
            <Sparkles className="h-6 w-6 text-accent" aria-hidden="true" />
          </span>
          <h3 className="mt-5 text-sm font-semibold leading-5 text-text-primary">
            Researching {company}
          </h3>
          <p className="mt-2 max-w-sm text-sm font-medium leading-6 text-text-muted">
            This can take a minute while the agent follows the company site and builds your dossier.
          </p>
        </div>
      ) : null}

      {!isResearching && !dossier ? (
        <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface-secondary">
            <Building2 className="h-6 w-6 text-text-muted" aria-hidden="true" />
          </span>
          <h3 className="mt-5 text-sm font-semibold leading-5 text-text-primary">No research yet</h3>
          <p className="mt-2 max-w-sm text-sm font-medium leading-6 text-text-muted">
            Click &quot;Research Company&quot; to browse {company}&apos;s public pages and build a dossier.
          </p>
        </div>
      ) : null}

      {dossier ? (
        <div className="grid gap-6 p-6" aria-live="polite">
          <div className="grid gap-3 rounded-lg border border-border bg-surface-secondary p-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-muted">
                <Compass className="h-4 w-4 text-accent" aria-hidden="true" />
              </span>
              <p className="text-xs font-semibold uppercase leading-4 tracking-[0.16em] text-text-primary">
                Company Overview
              </p>
            </div>
            <p className="text-sm font-medium leading-6 text-text-dark">{dossier.companyOverview}</p>
          </div>

          {techStack.length > 0 ? (
            <div>
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-accent" aria-hidden="true" />
                <h3 className="text-sm font-semibold leading-5 text-text-primary">Tech Stack</h3>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1 rounded-full bg-accent-muted px-3 py-1 text-xs font-semibold leading-4 text-accent"
                  >
                    <Code2 className="h-3 w-3" aria-hidden="true" />
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 rounded-lg border border-border bg-accent-muted p-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface">
                <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
              </span>
              <p className="text-xs font-semibold uppercase leading-4 tracking-[0.16em] text-text-primary">
                Why This Role
              </p>
            </div>
            <p className="text-sm font-medium leading-6 text-text-dark">{dossier.whyThisRole}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {listSections.map((section) => (
              <div
                key={section.label}
                className="rounded-lg border border-border bg-surface-secondary p-4"
              >
                <div className="flex items-center gap-2">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full ${sectionIconBackground(section.tone)}`}>
                    <section.icon
                      className={`h-4 w-4 ${sectionIconColor(section.tone)}`}
                      aria-hidden="true"
                    />
                  </span>
                  <p className="text-xs font-semibold uppercase leading-4 tracking-[0.16em] text-text-primary">
                    {section.label}
                  </p>
                </div>
                <ul className="mt-3 grid gap-2">
                  {uniqueStrings(section.items).map((item) => (
                    <li
                      key={item}
                      className="flex gap-2 text-sm font-medium leading-6 text-text-dark"
                    >
                      <span
                        className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${sectionBulletColor(section.tone)}`}
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-surface-secondary p-4">
            <p className="text-xs font-semibold uppercase leading-4 tracking-[0.16em] text-text-secondary">
              Sources
            </p>
            <ul className="mt-3 grid gap-2">
              {sources.map((source) => (
                <li key={source}>
                  {isHttpUrl(source) ? (
                    <a
                      href={source}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 break-all text-sm font-semibold leading-6 text-accent transition-colors hover:text-accent-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      {source}
                      <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="text-sm font-medium leading-6 text-text-dark">{source}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
}

async function parseResearchResponse(response: Response): Promise<ResearchCompanyResponse> {
  try {
    const value: unknown = await response.json();
    return normalizeResearchResponse(value);
  } catch {
    return { success: false, error: "We could not read the research response." };
  }
}

function normalizeResearchResponse(value: unknown): ResearchCompanyResponse {
  if (!isRecord(value) || typeof value.success !== "boolean") {
    return { success: false, error: "We could not read the research response." };
  }

  if (!value.success) {
    return {
      success: false,
      error: readString(value.error) || "We could not research this company right now.",
    };
  }

  const data = isRecord(value.data) ? value.data : {};
  const dossier = normalizeDossier(data.dossier);

  if (!dossier) {
    return { success: false, error: "The research response was missing its dossier." };
  }

  return { success: true, data: { dossier } };
}

function normalizeDossier(value: unknown): CompanyResearchDossier | null {
  if (!isRecord(value)) {
    return null;
  }

  const dossier: CompanyResearchDossier = {
    companyOverview: readString(value.companyOverview),
    techStack: readStringArray(value.techStack),
    culture: readStringArray(value.culture),
    whyThisRole: readString(value.whyThisRole),
    yourEdge: readStringArray(value.yourEdge),
    gapsToAddress: readStringArray(value.gapsToAddress),
    smartQuestions: readStringArray(value.smartQuestions),
    interviewPrep: readStringArray(value.interviewPrep),
    sources: uniqueStrings(readStringArray(value.sources)),
  };

  if (!dossier.companyOverview || !dossier.whyThisRole || dossier.sources.length === 0) {
    return null;
  }

  return dossier;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function sectionIconBackground(tone: DossierListSection["tone"]): string {
  if (tone === "success") {
    return "bg-success-lightest";
  }

  if (tone === "info") {
    return "bg-info-lightest";
  }

  if (tone === "accent") {
    return "bg-accent-muted";
  }

  return "bg-surface";
}

function sectionIconColor(tone: DossierListSection["tone"]): string {
  if (tone === "success") {
    return "text-success";
  }

  if (tone === "info") {
    return "text-info-medium";
  }

  return "text-accent";
}

function sectionBulletColor(tone: DossierListSection["tone"]): string {
  if (tone === "success") {
    return "bg-success";
  }

  if (tone === "info") {
    return "bg-info-medium";
  }

  return "bg-accent";
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

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const value of values) {
    if (!seen.has(value)) {
      seen.add(value);
      unique.push(value);
    }
  }

  return unique;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
