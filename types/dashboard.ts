export type DashboardTrend = {
  label: string;
  tone: "positive" | "negative";
};

export type DashboardStats = {
  totalJobsFound: number;
  avgMatchRate: number;
  companiesResearched: number;
  jobsThisWeek: number;
  totalJobsTrend: DashboardTrend | null;
  avgMatchTrend: DashboardTrend | null;
};
