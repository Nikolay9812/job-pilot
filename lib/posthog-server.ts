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
