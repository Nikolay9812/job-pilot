import { notFound, redirect } from "next/navigation";
import { PostHogIdentify } from "@/components/auth/PostHogIdentify";
import { CompanyResearch } from "@/components/job-details/CompanyResearch";
import { JobActions } from "@/components/job-details/JobActions";
import { JobDescription } from "@/components/job-details/JobDescription";
import { JobHeader } from "@/components/job-details/JobHeader";
import { JobInfo } from "@/components/job-details/JobInfo";
import { MatchScore } from "@/components/job-details/MatchScore";
import { Navbar } from "@/components/layout/Navbar";
import { parseJobDetails } from "@/lib/jobs";
import { createInsforgeServer } from "@/lib/insforge-server";
import type { JobDetails } from "@/types/jobs";

type JobDetailsPageProps = {
  params: Promise<{ id: string }>;
};

const JOB_DETAILS_COLUMNS = [
  "id",
  "title",
  "company",
  "salary",
  "location",
  "job_type",
  "source_url",
  "external_apply_url",
  "about_role",
  "responsibilities",
  "requirements",
  "nice_to_have",
  "benefits",
  "about_company",
  "match_score",
  "match_reason",
  "matched_skills",
  "missing_skills",
  "found_at",
].join(",");

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { id } = await params;
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();

  if (error || !data.user) {
    redirect("/login");
  }

  const job = await loadJobDetails(id, data.user.id);

  if (!job) {
    notFound();
  }

  const applyUrl = job.externalApplyUrl ?? job.sourceUrl;

  return (
    <main className="min-h-screen bg-background">
      <PostHogIdentify userId={data.user.id} />
      <Navbar variant="app" activeHref="/find-jobs" />
      <section className="mx-auto flex max-w-[860px] flex-col gap-6 px-4 py-10 sm:px-6 lg:px-0">
        <JobHeader job={job} applyUrl={applyUrl} />
        <JobInfo job={job} />
        <MatchScore job={job} />
        <JobDescription job={job} />
        <CompanyResearch company={job.company} />
        <JobActions company={job.company} applyUrl={applyUrl} />
      </section>
    </main>
  );
}

async function loadJobDetails(jobId: string, userId: string): Promise<JobDetails | null> {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("jobs")
    .select(JOB_DETAILS_COLUMNS)
    .eq("id", jobId)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("[find-jobs/[id]/page]", error);
    return null;
  }

  return parseJobDetails(data);
}
