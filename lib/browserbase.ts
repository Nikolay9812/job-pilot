import Browserbase from "@browserbasehq/sdk";

export function readRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export async function createCompanyResearchSession(): Promise<{ id: string }> {
  const browserbase = new Browserbase({
    apiKey: readRequiredEnv("BROWSERBASE_API_KEY"),
  });

  const session = await browserbase.sessions.create({
    projectId: readRequiredEnv("BROWSERBASE_PROJECT_ID"),
    timeout: 120,
  });

  return { id: session.id };
}
