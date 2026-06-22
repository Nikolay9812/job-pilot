import { Stagehand } from "@browserbasehq/stagehand";
import { readRequiredEnv } from "@/lib/browserbase";

export function createCompanyResearchStagehand(browserbaseSessionId: string): Stagehand {
  return new Stagehand({
    env: "BROWSERBASE",
    apiKey: readRequiredEnv("BROWSERBASE_API_KEY"),
    projectId: readRequiredEnv("BROWSERBASE_PROJECT_ID"),
    browserbaseSessionID: browserbaseSessionId,
    model: {
      modelName: "openai/gpt-4o",
      apiKey: readRequiredEnv("OPENAI_API_KEY"),
    },
  });
}
