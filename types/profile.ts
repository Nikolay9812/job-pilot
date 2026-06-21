export type ExperienceLevel = "junior" | "mid" | "senior" | "lead";
export type RemotePreference = "remote" | "onsite" | "hybrid" | "any";
export type WorkAuthorization = "citizen" | "permanent_resident" | "visa_required";
export type CoverLetterTone = "formal" | "casual" | "enthusiastic";

export type WorkExperience = {
  companyName: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string;
};

export type Education = {
  highestDegree: string;
  fieldOfStudy: string;
  institutionName: string;
  graduationYear: string;
};

export type ProfileRecord = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  current_title: string | null;
  experience_level: ExperienceLevel | null;
  years_experience: number | null;
  skills: string[];
  industries: string[];
  work_experience: WorkExperience[];
  education: Education;
  job_titles_seeking: string[];
  remote_preference: RemotePreference | null;
  preferred_locations: string[];
  salary_expectation: string | null;
  cover_letter_tone: CoverLetterTone | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  work_authorization: WorkAuthorization | null;
  resume_pdf_url: string | null;
  resume_pdf_key: string | null;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
};

export type ProfileActionState = {
  success: boolean;
  message: string;
  completionPercentage?: number;
  missingFields?: string[];
};

export type ExtractedProfileData = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  workAuthorization: WorkAuthorization | "";
  currentTitle: string;
  experienceLevel: ExperienceLevel | "";
  yearsExperience: number | null;
  skills: string[];
  industries: string[];
  workExperience: WorkExperience[];
  education: Education;
  jobTitlesSeeking: string[];
  remotePreference: RemotePreference | "";
  preferredLocations: string[];
  salaryExpectation: string;
  coverLetterTone: CoverLetterTone | "";
};

export type ExtractResumeResponse =
  | { success: true; data: ExtractedProfileData }
  | { success: false; error: string };
