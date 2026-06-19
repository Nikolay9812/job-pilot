import posthog from "posthog-js";

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

type ClientEventProperties = {
  job_search_started: JobSearchStartedProperties;
  job_found: JobFoundProperties;
  profile_completed: ProfileCompletedProperties;
  company_researched: CompanyResearchedProperties;
};

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

export function initPostHog(): void {
  if (typeof window === "undefined" || posthog.__loaded || !posthogKey) {
    return;
  }

  posthog.init(posthogKey, {
    api_host: posthogHost,
    capture_pageview: false,
    capture_pageleave: false,
  });
}

export function identifyPostHogUser(userId: string): void {
  if (!posthogKey) {
    return;
  }

  initPostHog();
  posthog.identify(userId);
}

export function resetPostHogUser(): void {
  if (!posthogKey) {
    return;
  }

  posthog.reset();
}

export function capturePostHogEvent<EventName extends keyof ClientEventProperties>(
  event: EventName,
  properties: ClientEventProperties[EventName],
): void {
  if (!posthogKey) {
    return;
  }

  posthog.capture(event, properties);
}

export { posthog };
