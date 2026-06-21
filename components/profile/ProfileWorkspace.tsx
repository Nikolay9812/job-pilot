"use client";

import { useState } from "react";
import { ProfileInformationForm } from "@/components/profile/ProfileInformationForm";
import { ResumeSection } from "@/components/profile/ResumeSection";
import type { ExtractedProfileData, ProfileRecord } from "@/types/profile";

type ProfileWorkspaceProps = {
  formId: string;
  profile: ProfileRecord | null;
  userEmail: string;
};

export function ProfileWorkspace({ formId, profile, userEmail }: ProfileWorkspaceProps) {
  const [extractedProfile, setExtractedProfile] = useState<ExtractedProfileData | null>(null);
  const [formVersion, setFormVersion] = useState(0);

  function handleExtractedProfile(nextProfile: ExtractedProfileData): void {
    setExtractedProfile(nextProfile);
    setFormVersion((current) => current + 1);
  }

  return (
    <>
      <ResumeSection
        formId={formId}
        profile={profile}
        onExtractedProfile={handleExtractedProfile}
      />
      <ProfileInformationForm
        key={formVersion}
        formId={formId}
        profile={profile}
        userEmail={userEmail}
        extractedProfile={extractedProfile}
      />
    </>
  );
}
