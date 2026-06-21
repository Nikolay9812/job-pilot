export type JobType = "fulltime" | "parttime" | "contract";

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
