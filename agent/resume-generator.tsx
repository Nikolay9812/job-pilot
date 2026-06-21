import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import OpenAI from "openai";
import { hasText } from "@/lib/profile";
import type { ProfileRecord, WorkExperience } from "@/types/profile";

const RESUME_GENERATION_ERROR = "We could not generate your resume. Please try again.";
const OPENAI_QUOTA_ERROR =
  "OpenAI quota is exhausted. Check the OpenAI project billing or use an API key with available credits.";
const OPENAI_RATE_LIMIT_ERROR = "OpenAI is rate limiting resume generation. Please wait a moment and try again.";

type ResumeGenerationResult =
  | { success: true; pdfBuffer: Buffer }
  | { success: false; error: string; status?: number };

type GeneratedResumeContent = {
  professionalSummary: string;
  skills: string[];
  workExperience: GeneratedWorkExperience[];
  education: string[];
};

type GeneratedWorkExperience = {
  companyName: string;
  jobTitle: string;
  dates: string;
  bullets: string[];
};

const generationSystemPrompt = `You write concise professional software resumes from structured profile data.

Return ONLY valid JSON using these exact keys:
{
  "professionalSummary": string,
  "skills": string[],
  "workExperience": [
    {
      "companyName": string,
      "jobTitle": string,
      "dates": string,
      "bullets": string[]
    }
  ],
  "education": string[]
}

Rules:
- Use only facts from the profile.
- Do not invent employers, dates, degrees, metrics, technologies, credentials, or work authorization.
- Polish wording, but keep claims honest and grounded.
- Keep the professional summary to 2 sentences.
- Keep workExperience to the provided roles, maximum 3.
- Write 2-4 concise achievement-oriented bullets per role.
- Keep skills to the strongest 12-18 items.
- Return plain text only inside every field.`;

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.35,
  },
  header: {
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 4,
  },
  title: {
    fontSize: 11,
    marginBottom: 4,
  },
  contact: {
    fontSize: 9,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 5,
  },
  paragraph: {
    fontSize: 10,
  },
  skillText: {
    fontSize: 9,
  },
  role: {
    marginBottom: 9,
  },
  roleHeader: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 2,
  },
  roleMeta: {
    fontSize: 9,
    marginBottom: 3,
  },
  bullet: {
    fontSize: 9,
    marginBottom: 2,
  },
});

export async function generateResumePdfFromProfile(
  profile: ProfileRecord,
): Promise<ResumeGenerationResult> {
  try {
    const content = await generateResumeContent(profile);
    const pdfBuffer = await renderToBuffer(
      <ResumeDocument profile={profile} content={content} />,
    );

    return { success: true, pdfBuffer };
  } catch (error) {
    if (isOpenAIQuotaError(error)) {
      console.error("[agent/resume-generator]", "OpenAI quota exceeded.");
      return { success: false, error: OPENAI_QUOTA_ERROR, status: 429 };
    }

    if (isOpenAIRateLimitError(error)) {
      console.error("[agent/resume-generator]", "OpenAI rate limit exceeded.");
      return { success: false, error: OPENAI_RATE_LIMIT_ERROR, status: 429 };
    }

    console.error("[agent/resume-generator]", error);
    return { success: false, error: RESUME_GENERATION_ERROR };
  }
}

async function generateResumeContent(profile: ProfileRecord): Promise<GeneratedResumeContent> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await openai.responses.create({
    model: "gpt-4o",
    instructions: generationSystemPrompt,
    temperature: 0.7,
    max_output_tokens: 1000,
    text: { format: { type: "json_object" } },
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Generate resume content as valid json from this saved profile:\n${JSON.stringify(profile)}`,
          },
        ],
      },
    ],
  });

  const content = response.output_text;
  if (!content) {
    throw new Error("OpenAI returned empty resume content.");
  }

  const parsed: unknown = JSON.parse(content);
  return normalizeGeneratedResumeContent(parsed, profile);
}

function ResumeDocument({
  profile,
  content,
}: {
  profile: ProfileRecord;
  content: GeneratedResumeContent;
}) {
  const contactLine = [
    profile.email,
    profile.phone,
    profile.location,
    profile.linkedin_url,
    profile.portfolio_url,
  ].filter(hasText).join(" | ");

  return (
    <Document title={`${profile.full_name ?? "Resume"} Resume`} author={profile.full_name ?? undefined}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{profile.full_name}</Text>
          {profile.current_title ? <Text style={styles.title}>{profile.current_title}</Text> : null}
          {contactLine ? <Text style={styles.contact}>{contactLine}</Text> : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <Text style={styles.paragraph}>{content.professionalSummary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <Text style={styles.skillText}>{content.skills.join(" | ")}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {content.workExperience.map((experience) => (
            <View key={`${experience.companyName}-${experience.jobTitle}`} style={styles.role}>
              <Text style={styles.roleHeader}>
                {experience.jobTitle} - {experience.companyName}
              </Text>
              {experience.dates ? <Text style={styles.roleMeta}>{experience.dates}</Text> : null}
              {experience.bullets.map((bullet) => (
                <Text key={bullet} style={styles.bullet}>
                  - {bullet}
                </Text>
              ))}
            </View>
          ))}
        </View>

        {content.education.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {content.education.map((item) => (
              <Text key={item} style={styles.paragraph}>
                {item}
              </Text>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

function normalizeGeneratedResumeContent(
  value: unknown,
  profile: ProfileRecord,
): GeneratedResumeContent {
  const record = isRecord(value) ? value : {};
  const workExperience = readGeneratedWorkExperienceArray(record.workExperience);
  const fallbackWorkExperience = profile.work_experience.map(workExperienceToGenerated);

  return {
    professionalSummary: readString(record.professionalSummary) || fallbackSummary(profile),
    skills: readStringArray(record.skills).slice(0, 18),
    workExperience: (workExperience.length > 0 ? workExperience : fallbackWorkExperience).slice(0, 3),
    education: readStringArray(record.education),
  };
}

function workExperienceToGenerated(experience: WorkExperience): GeneratedWorkExperience {
  return {
    companyName: experience.companyName,
    jobTitle: experience.jobTitle,
    dates: formatDates(experience),
    bullets: splitResponsibilityText(experience.responsibilities),
  };
}

function fallbackSummary(profile: ProfileRecord): string {
  const title = profile.current_title ?? "Professional";
  const years = profile.years_experience;
  const skills = profile.skills.slice(0, 5).join(", ");

  if (years !== null && skills) {
    return `${title} with ${years} years of experience across ${skills}.`;
  }

  return title;
}

function formatDates(experience: WorkExperience): string {
  const endDate = experience.current ? "Present" : experience.endDate;
  return [experience.startDate, endDate].filter(hasText).join(" - ");
}

function splitResponsibilityText(value: string): string[] {
  return value
    .split(/\r?\n|;/)
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 4);
}

function readGeneratedWorkExperienceArray(value: unknown): GeneratedWorkExperience[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord).map((item) => ({
    companyName: readString(item.companyName),
    jobTitle: readString(item.jobTitle),
    dates: readString(item.dates),
    bullets: readStringArray(item.bullets).slice(0, 4),
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
