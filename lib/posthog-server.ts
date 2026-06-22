import { PostHog } from "posthog-node";

type JobSearchStartedProperties = {
  userId: string;
  jobTitle: string;
  location: string;
};

type JobFoundProperties = {
  userId: string;
  source: "search";
  matchScore: number;
};

type ProfileCompletedProperties = {
  userId: string;
};

type CompanyResearchedProperties = {
  userId: string;
  jobId: string;
  company: string;
};

type ServerEventProperties = {
  job_search_started: JobSearchStartedProperties;
  job_found: JobFoundProperties;
  profile_completed: ProfileCompletedProperties;
  company_researched: CompanyResearchedProperties;
};

type PostHogQueryConfig = {
  apiHost: string;
  projectId: string;
  personalApiKey: string;
};

export function createPostHogServer(): PostHog {
  return new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });
}

export async function capturePostHogServerEvent<EventName extends keyof ServerEventProperties>(
  event: EventName,
  properties: ServerEventProperties[EventName],
): Promise<void> {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return;
  }

  const posthog = createPostHogServer();

  try {
    posthog.capture({
      distinctId: properties.userId,
      event,
      properties,
    });
  } finally {
    await posthog.shutdown();
  }
}

export async function queryPostHogHogql(query: string, name: string): Promise<unknown | null> {
  const config = readPostHogQueryConfig();

  if (!config) {
    return null;
  }

  const response = await fetch(
    `${config.apiHost}/api/projects/${encodeURIComponent(config.projectId)}/query/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.personalApiKey}`,
      },
      body: JSON.stringify({
        query: {
          kind: "HogQLQuery",
          query,
        },
        name,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`PostHog query failed with status ${response.status}`);
  }

  const data: unknown = await response.json();
  return data;
}

function readPostHogQueryConfig(): PostHogQueryConfig | null {
  const apiHost = process.env.POSTHOG_API_HOST;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  const personalApiKey = process.env.POSTHOG_PERSONAL_API_KEY;

  if (!apiHost || !projectId || !personalApiKey) {
    return null;
  }

  return {
    apiHost: apiHost.replace(/\/+$/, ""),
    projectId,
    personalApiKey,
  };
}
