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

export type DashboardActivityTone = "info" | "success";

export type DashboardActivityItem = {
  id: string;
  title: string;
  timestamp: string;
  occurredAt: string;
  tone: DashboardActivityTone;
};

export type DashboardTimeSeriesPoint = {
  date: string;
  label: string;
  value: number;
};

export type DashboardScoreBucket = {
  label: string;
  value: number;
};

export type DashboardAnalyticsData = {
  jobsFoundData: DashboardTimeSeriesPoint[];
  matchScoreData: DashboardScoreBucket[];
  companyResearchData: DashboardTimeSeriesPoint[];
};
