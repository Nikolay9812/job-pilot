"use client";

import { useEffect } from "react";
import { identifyPostHogUser } from "@/lib/posthog-client";

type PostHogIdentifyProps = {
  userId: string;
};

export function PostHogIdentify({ userId }: PostHogIdentifyProps) {
  useEffect(() => {
    identifyPostHogUser(userId);
  }, [userId]);

  return null;
}
