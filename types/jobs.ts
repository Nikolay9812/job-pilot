export type JobType = "fulltime" | "parttime" | "contract";

export type JobSource = "search" | "url";

export type JobsMatchFilter = "all" | "high" | "low";

export type JobsSort = "match" | "newest" | "oldest";

export type JobListQuery = {
  search: string;
  matchFilter: JobsMatchFilter;
  sort: JobsSort;
  page: number;
};

export type JobListItem = {
  id: string;
  title: string;
  company: string;
  salary: string | null;
  source: JobSource;
  foundAt: string;
  matchScore: number;
};

export type JobDetails = {
  id: string;
  title: string;
  company: string;
  salary: string | null;
  location: string | null;
  jobType: JobType | null;
  sourceUrl: string | null;
  externalApplyUrl: string | null;
  aboutRole: string | null;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  benefits: string[];
  aboutCompany: string | null;
  matchScore: number;
  matchReason: string | null;
  matchedSkills: string[];
  missingSkills: string[];
  foundAt: string;
};

export type JobsPageInfo = {
  currentPage: number;
  pageSize: number;
  totalResults: number;
  totalPages: number;
  fromResult: number;
  toResult: number;
};

export type JobMatchScore = {
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
};

export type SavedJobSummary = {
  id: string;
  title: string;
  company: string;
  matchScore: number;
};

export type FindJobsResponse =
  | {
      success: true;
      data: {
        runId: string;
        jobsFound: number;
        strongMatches: number;
      };
    }
  | { success: false; error: string };
