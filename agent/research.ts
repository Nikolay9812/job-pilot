import OpenAI from "openai";
import { z } from "zod";
import { createCompanyResearchSession } from "@/lib/browserbase";
import { createInsforgeServer } from "@/lib/insforge-server";
import { createCompanyResearchStagehand } from "@/lib/stagehand";
import type { CompanyResearchDossier, JobDetails } from "@/types/jobs";
import type { ProfileRecord } from "@/types/profile";

type InsforgeServerClient = Awaited<ReturnType<typeof createInsforgeServer>>;

type ResearchCompanyInput = {
  userId: string;
  job: JobDetails;
  profile: ProfileRecord;
};

type ResearchCompanyResult =
  | { success: true; dossier: CompanyResearchDossier }
  | { success: false; error: string };

type BrowserResearch = {
  homepageUrl: string;
  homepage: HomepageResearch | null;
  subPages: SubPageResearch[];
  sources: string[];
};

type ResearchLink = {
  url: string;
  kind: string;
};

const homepageResearchSchema = z.object({
  companySummary: z.string().default(""),
  productSummary: z.string().default(""),
  hiringSignals: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  cultureSignals: z.array(z.string()).default([]),
  pageLinks: z
    .array(
      z.object({
        url: z.string(),
        kind: z.string().default("other"),
      }),
    )
    .default([]),
});

const subPageResearchSchema = z.object({
  keyPoints: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  cultureSignals: z.array(z.string()).default([]),
  roleSignals: z.array(z.string()).default([]),
});

type HomepageResearch = z.infer<typeof homepageResearchSchema>;
type SubPageExtract = z.infer<typeof subPageResearchSchema>;
type SubPageResearch = SubPageExtract & { url: string };

const emptyHomepageResearch: HomepageResearch = {
  companySummary: "",
  productSummary: "",
  hiringSignals: [],
  technologies: [],
  cultureSignals: [],
  pageLinks: [],
};

const researchSystemPrompt = `You are a company research assistant for a job seeker.

Return ONLY valid JSON using these exact keys:
{
  "companyOverview": string,
  "techStack": string[],
  "culture": string[],
  "whyThisRole": string,
  "yourEdge": string[],
  "gapsToAddress": string[],
  "smartQuestions": string[],
  "interviewPrep": string[],
  "sources": string[]
}

Rules:
- Write practical, interview-ready notes for this specific candidate and role.
- Prefer facts from sources and clearly grounded inferences. Do not invent certainty.
- Keep companyOverview and whyThisRole to one concise paragraph each.
- Use arrays of short, specific bullets for the other fields.
- Always fill every field with useful content, even when public research is thin.`;

const homepageInstruction = `Extract company research for a job candidate.

Capture:
- what the company does
- product, customer, or market signals
- technologies mentioned on the page
- culture or values signals
- links to useful internal pages, especially about, blog, engineering, product, team, and careers pages

Return concise structured data only.`;

const subPageInstruction = `Extract company research signals from this internal company page.

Capture:
- key company/product facts
- technologies, developer tools, architecture, or product terms
- culture, values, team, or hiring signals
- details that could help a candidate explain interest in this role

Return concise structured data only.`;

export async function researchCompany(
  input: ResearchCompanyInput,
): Promise<ResearchCompanyResult> {
  const insforge = await createInsforgeServer();
  const homepageUrl = await deriveHomepageUrl(input.job);
  let browserResearch: BrowserResearch = {
    homepageUrl,
    homepage: null,
    subPages: [],
    sources: [],
  };

  try {
    browserResearch = await collectBrowserResearch(insforge, input, homepageUrl);
  } catch (error) {
    console.error("[agent/research]", error);
    await logAgent(
      insforge,
      input.userId,
      input.job.id,
      `Browser research failed for ${input.job.company}. Continuing with job and profile context.`,
      "warning",
    );
  }

  try {
    const dossier = await synthesizeDossier(input, browserResearch);
    return { success: true, dossier };
  } catch (error) {
    console.error("[agent/research]", error);
    await logAgent(
      insforge,
      input.userId,
      input.job.id,
      `Company research synthesis failed for ${input.job.company}. Saved fallback dossier.`,
      "warning",
    );

    return {
      success: true,
      dossier: fallbackDossier(input, browserResearch),
    };
  }
}

async function collectBrowserResearch(
  insforge: InsforgeServerClient,
  input: ResearchCompanyInput,
  homepageUrl: string,
): Promise<BrowserResearch> {
  const session = await createCompanyResearchSession();
  const stagehand = createCompanyResearchStagehand(session.id);
  const subPages: SubPageResearch[] = [];
  const sources = [homepageUrl];

  try {
    await stagehand.init();
    const page = stagehand.context.activePage();

    if (!page) {
      throw new Error("Stagehand did not expose an active page.");
    }

    await page.goto(homepageUrl, { waitUntil: "networkidle", timeoutMs: 30000 });
    const homepage = await extractHomepageResearch(insforge, input, stagehand);
    const links = selectInternalResearchLinks(homepage.pageLinks, homepageUrl);

    for (const link of links) {
      try {
        await page.goto(link.url, { waitUntil: "networkidle", timeoutMs: 30000 });
        const extract = await stagehand.extract(subPageInstruction, subPageResearchSchema);
        subPages.push({ ...extract, url: link.url });
        sources.push(link.url);
      } catch (error) {
        console.error("[agent/research]", error);
        await logAgent(
          insforge,
          input.userId,
          input.job.id,
          `Could not extract company research from ${link.url}.`,
          "warning",
        );
      }
    }

    return {
      homepageUrl,
      homepage,
      subPages,
      sources,
    };
  } finally {
    await stagehand.close().catch((error: unknown) => {
      console.error("[agent/research]", error);
    });
  }
}

async function extractHomepageResearch(
  insforge: InsforgeServerClient,
  input: ResearchCompanyInput,
  stagehand: ReturnType<typeof createCompanyResearchStagehand>,
): Promise<HomepageResearch> {
  try {
    return await stagehand.extract(homepageInstruction, homepageResearchSchema);
  } catch (error) {
    console.error("[agent/research]", error);
    await logAgent(
      insforge,
      input.userId,
      input.job.id,
      `Could not extract homepage research for ${input.job.company}.`,
      "warning",
    );
    return emptyHomepageResearch;
  }
}

async function synthesizeDossier(
  input: ResearchCompanyInput,
  browserResearch: BrowserResearch,
): Promise<CompanyResearchDossier> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await openai.responses.create({
    model: "gpt-4o",
    instructions: researchSystemPrompt,
    temperature: 0.4,
    max_output_tokens: 1200,
    text: { format: { type: "json_object" } },
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Build the 9-field company research dossier from this context.

JOB:
Title: ${input.job.title}
Company: ${input.job.company}
Location: ${input.job.location ?? "unknown"}
Job type: ${input.job.jobType ?? "unknown"}
About role: ${input.job.aboutRole ?? ""}
Responsibilities: ${input.job.responsibilities.join(", ")}
Requirements: ${input.job.requirements.join(", ")}
Nice to have: ${input.job.niceToHave.join(", ")}
Benefits: ${input.job.benefits.join(", ")}
About company from listing: ${input.job.aboutCompany ?? ""}
Matched skills: ${input.job.matchedSkills.join(", ")}
Missing skills: ${input.job.missingSkills.join(", ")}

CANDIDATE PROFILE:
Current title: ${input.profile.current_title ?? ""}
Experience: ${input.profile.years_experience ?? "unknown"} years, level ${input.profile.experience_level ?? "unknown"}
Skills: ${input.profile.skills.join(", ")}
Industries: ${input.profile.industries.join(", ")}
Job titles seeking: ${input.profile.job_titles_seeking.join(", ")}
Remote preference: ${input.profile.remote_preference ?? "unknown"}
Preferred locations: ${input.profile.preferred_locations.join(", ")}
Work history: ${JSON.stringify(input.profile.work_experience)}

BROWSER RESEARCH:
Homepage URL: ${browserResearch.homepageUrl}
Homepage extract: ${JSON.stringify(browserResearch.homepage)}
Internal page extracts: ${JSON.stringify(browserResearch.subPages)}
Sources: ${browserResearch.sources.join(", ")}`,
          },
        ],
      },
    ],
  });

  if (!response.output_text) {
    throw new Error("OpenAI returned an empty company research response.");
  }

  const parsed: unknown = JSON.parse(response.output_text);
  return normalizeDossier(parsed, input, browserResearch);
}

async function deriveHomepageUrl(job: JobDetails): Promise<string> {
  const candidateUrl = job.externalApplyUrl ?? job.sourceUrl;

  if (candidateUrl) {
    try {
      const response = await fetch(candidateUrl, {
        redirect: "follow",
        cache: "no-store",
      });
      const resolvedUrl = toCompanyHomepageUrl(response.url);

      if (resolvedUrl && !isAdzunaUrl(resolvedUrl)) {
        return resolvedUrl;
      }
    } catch (error) {
      console.error("[agent/research]", error);
    }
  }

  return fallbackHomepageUrl(job.company);
}

function toCompanyHomepageUrl(value: string): string {
  try {
    const url = new URL(value);

    if (isAdzunaUrl(url.href)) {
      return "";
    }

    return `${url.protocol}//${url.hostname}`;
  } catch {
    return "";
  }
}

function fallbackHomepageUrl(company: string): string {
  const normalized = company
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "")
    .trim();

  return `https://www.${normalized || "company"}.com`;
}

function selectInternalResearchLinks(links: ResearchLink[], homepageUrl: string): ResearchLink[] {
  const homepageDomain = rootDomain(homepageUrl);
  const seen = new Set<string>();
  const normalizedLinks = links
    .map((link) => normalizeInternalLink(link, homepageUrl, homepageDomain))
    .filter((link): link is ResearchLink => link !== null)
    .filter((link) => {
      if (seen.has(link.url)) {
        return false;
      }

      seen.add(link.url);
      return true;
    });

  return normalizedLinks
    .sort((left, right) => linkPriority(left.kind) - linkPriority(right.kind))
    .slice(0, 3);
}

function normalizeInternalLink(
  link: ResearchLink,
  homepageUrl: string,
  homepageDomain: string,
): ResearchLink | null {
  try {
    const url = new URL(link.url, homepageUrl);

    if (!["http:", "https:"].includes(url.protocol) || rootDomain(url.href) !== homepageDomain) {
      return null;
    }

    url.hash = "";
    return {
      url: url.href.replace(/\/$/, ""),
      kind: link.kind,
    };
  } catch {
    return null;
  }
}

function linkPriority(kind: string): number {
  const normalized = kind.toLowerCase();

  if (normalized.includes("about")) {
    return 0;
  }

  if (normalized.includes("blog")) {
    return 1;
  }

  if (normalized.includes("engineering")) {
    return 2;
  }

  if (normalized.includes("product")) {
    return 3;
  }

  if (normalized.includes("team")) {
    return 4;
  }

  if (normalized.includes("career")) {
    return 5;
  }

  return 6;
}

function rootDomain(value: string): string {
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    const labels = hostname.replace(/^www\./, "").split(".").filter(Boolean);

    if (labels.length <= 2) {
      return labels.join(".");
    }

    const secondLevel = labels[labels.length - 2] ?? "";
    const topLevel = labels[labels.length - 1] ?? "";
    const compoundSuffixes = ["co", "com", "org", "net", "ac", "gov"];

    if (topLevel.length === 2 && compoundSuffixes.includes(secondLevel)) {
      return labels.slice(-3).join(".");
    }

    return labels.slice(-2).join(".");
  } catch {
    return "";
  }
}

function isAdzunaUrl(value: string): boolean {
  try {
    return new URL(value).hostname.toLowerCase().includes("adzuna");
  } catch {
    return false;
  }
}

function normalizeDossier(
  value: unknown,
  input: ResearchCompanyInput,
  browserResearch: BrowserResearch,
): CompanyResearchDossier {
  const record = isRecord(value) ? value : {};
  const fallback = fallbackDossier(input, browserResearch);

  return {
    companyOverview: readString(record.companyOverview) || fallback.companyOverview,
    techStack: withFallback(readStringArray(record.techStack), fallback.techStack),
    culture: withFallback(readStringArray(record.culture), fallback.culture),
    whyThisRole: readString(record.whyThisRole) || fallback.whyThisRole,
    yourEdge: withFallback(readStringArray(record.yourEdge), fallback.yourEdge),
    gapsToAddress: withFallback(readStringArray(record.gapsToAddress), fallback.gapsToAddress),
    smartQuestions: withFallback(readStringArray(record.smartQuestions), fallback.smartQuestions),
    interviewPrep: withFallback(readStringArray(record.interviewPrep), fallback.interviewPrep),
    sources: withFallback(uniqueStrings(readStringArray(record.sources)), fallback.sources),
  };
}

function fallbackDossier(
  input: ResearchCompanyInput,
  browserResearch: BrowserResearch,
): CompanyResearchDossier {
  const roleContext = [input.job.aboutRole, input.job.aboutCompany].filter(hasText).join(" ");
  const topMatchedSkills = input.job.matchedSkills.slice(0, 4);
  const topMissingSkills = input.job.missingSkills.slice(0, 4);
  const sourceUrls = [
    ...browserResearch.sources,
    input.job.externalApplyUrl ?? "",
    input.job.sourceUrl ?? "",
  ].filter(hasText);

  return {
    companyOverview:
      roleContext ||
      `${input.job.company} is the employer for this ${input.job.title} role. Public research was limited, so treat the job posting as the primary source.`,
    techStack: withFallback(input.job.requirements.concat(input.job.niceToHave).slice(0, 6), [
      "No public technical stack was confirmed; use the job requirements as the main signal.",
    ]),
    culture: withFallback(input.job.benefits.slice(0, 4), [
      "Public culture signals were limited; ask the team how they collaborate, prioritize, and support growth.",
    ]),
    whyThisRole: `This ${input.job.title} role at ${input.job.company} appears aligned with ${
      topMatchedSkills.length > 0 ? topMatchedSkills.join(", ") : "the candidate profile"
    }. Focus interview preparation on connecting your experience to the listed responsibilities.`,
    yourEdge: withFallback(
      topMatchedSkills.map((skill) => `Use your ${skill} experience as evidence for this role.`),
      ["Connect your saved profile and work history directly to the responsibilities in the posting."],
    ),
    gapsToAddress: withFallback(
      topMissingSkills.map((skill) => `Prepare a concise learning plan or adjacent example for ${skill}.`),
      ["Prepare one honest example for how you ramp up on unfamiliar company tools or domain knowledge."],
    ),
    smartQuestions: [
      `What outcomes would make the first 90 days successful for this ${input.job.title} role?`,
      "Which company or product priorities are most important for this team right now?",
      "What technical or collaboration challenges should the new hire be ready to solve?",
    ],
    interviewPrep: [
      `Review the ${input.job.company} job posting and map each responsibility to a work-history example.`,
      "Prepare concise stories that show ownership, technical judgment, and learning speed.",
      "Have a clear answer for why this company and role fit your next step.",
    ],
    sources: withFallback(uniqueStrings(sourceUrls), [browserResearch.homepageUrl]),
  };
}

async function logAgent(
  insforge: InsforgeServerClient,
  userId: string,
  jobId: string,
  message: string,
  level: "info" | "success" | "warning" | "error",
): Promise<void> {
  const { error } = await insforge.database.from("agent_logs").insert([
    {
      user_id: userId,
      job_id: jobId,
      run_id: null,
      message,
      level,
    },
  ]);

  if (error) {
    console.error("[agent/research]", error);
  }
}

function withFallback(values: string[], fallback: string[]): string[] {
  return values.length > 0 ? values : fallback;
}

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
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
