import { redirect } from "next/navigation";
import { PostHogIdentify } from "@/components/auth/PostHogIdentify";
import { FindJobsFilters } from "@/components/find-jobs/FindJobsFilters";
import { JobsTable } from "@/components/find-jobs/JobsTable";
import { SearchControls } from "@/components/find-jobs/SearchControls";
import { Navbar } from "@/components/layout/Navbar";
import {
  buildJobsPageInfo,
  JOBS_PAGE_SIZE,
  normalizeJobListQuery,
  parseJobListItems,
} from "@/lib/jobs";
import { createInsforgeServer } from "@/lib/insforge-server";
import { MATCH_THRESHOLD } from "@/lib/utils";
import type { JobListItem, JobListQuery, JobsPageInfo } from "@/types/jobs";

type FindJobsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type JobsQueryResult = {
  jobs: JobListItem[];
  pageInfo: JobsPageInfo;
  hasError: boolean;
};

const JOBS_LIST_COLUMNS = "id,title,company,salary,source,found_at,match_score";

export default async function FindJobsPage({ searchParams }: FindJobsPageProps) {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();

  if (error || !data.user) {
    redirect("/login");
  }

  const query = normalizeJobListQuery(await searchParams);
  const jobsResult = await loadJobs(query, data.user.id);

  return (
    <main className="min-h-screen bg-background">
      <PostHogIdentify userId={data.user.id} />
      <Navbar variant="app" activeHref="/find-jobs" />
      <section className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <SearchControls />
        <FindJobsFilters query={query} />
        <JobsTable
          jobs={jobsResult.jobs}
          pageInfo={jobsResult.pageInfo}
          query={query}
          hasError={jobsResult.hasError}
        />
      </section>
    </main>
  );
}

async function loadJobs(query: JobListQuery, userId: string): Promise<JobsQueryResult> {
  const insforge = await createInsforgeServer();
  const from = (query.page - 1) * JOBS_PAGE_SIZE;
  const to = from + JOBS_PAGE_SIZE - 1;

  let jobsQuery = insforge.database
    .from("jobs")
    .select(JOBS_LIST_COLUMNS, { count: "exact" })
    .eq("user_id", userId);

  if (query.matchFilter === "high") {
    jobsQuery = jobsQuery.gte("match_score", MATCH_THRESHOLD);
  }

  if (query.matchFilter === "low") {
    jobsQuery = jobsQuery.lt("match_score", MATCH_THRESHOLD);
  }

  if (query.search) {
    jobsQuery = jobsQuery.or(`company.ilike.*${query.search}*,title.ilike.*${query.search}*`);
  }

  if (query.sort === "newest") {
    jobsQuery = jobsQuery.order("found_at", { ascending: false });
  } else if (query.sort === "oldest") {
    jobsQuery = jobsQuery.order("found_at", { ascending: true });
  } else {
    jobsQuery = jobsQuery.order("match_score", { ascending: false }).order("found_at", {
      ascending: false,
    });
  }

  const { data, error, count } = await jobsQuery.range(from, to);

  if (error) {
    console.error("[find-jobs/page]", error);
    return {
      jobs: [],
      pageInfo: buildJobsPageInfo(0, 1),
      hasError: true,
    };
  }

  const totalResults = typeof count === "number" ? count : 0;
  const pageInfo = buildJobsPageInfo(totalResults, query.page);

  if (totalResults > 0 && query.page > pageInfo.totalPages) {
    return loadJobs({ ...query, page: pageInfo.totalPages }, userId);
  }

  return {
    jobs: parseJobListItems(data),
    pageInfo,
    hasError: false,
  };
}
