"use client";

import { useActionState, useMemo, useState } from "react";
import { saveProfile } from "@/actions/profile";
import { emptyEducation, emptyWorkExperience, splitList } from "@/lib/profile";
import type { ProfileActionState, ProfileRecord, WorkExperience } from "@/types/profile";

const labelClass = "text-xs font-semibold uppercase leading-4 text-text-secondary";
const inputClass =
  "mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium leading-5 text-text-primary shadow-sm outline-none placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent";
const mutedInputClass =
  "mt-2 min-h-11 w-full rounded-md border border-border bg-surface-secondary px-4 py-2 text-sm font-medium leading-5 text-text-primary shadow-sm outline-none";
const sectionDividerClass = "border-t border-border pt-10";
const addButtonClass =
  "mt-2 inline-flex min-h-11 items-center justify-center rounded-md bg-surface-secondary px-5 py-2 text-sm font-semibold leading-5 text-text-secondary transition-colors hover:bg-surface-tertiary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

type ProfileInformationFormProps = {
  formId: string;
  profile: ProfileRecord | null;
  userEmail: string;
};

const initialActionState: ProfileActionState = {
  success: false,
  message: "",
};

export function ProfileInformationForm({
  formId,
  profile,
  userEmail,
}: ProfileInformationFormProps) {
  const [state, formAction, isPending] = useActionState(saveProfile, initialActionState);
  const [skills, setSkills] = useState<string[]>(profile?.skills ?? []);
  const [skillDraft, setSkillDraft] = useState("");
  const [industries, setIndustries] = useState<string[]>(profile?.industries ?? []);
  const [industryDraft, setIndustryDraft] = useState("");
  const [jobTitlesText, setJobTitlesText] = useState(
    (profile?.job_titles_seeking ?? []).join(", "),
  );
  const [preferredLocationsText, setPreferredLocationsText] = useState(
    (profile?.preferred_locations ?? []).join(", "),
  );
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>(
    profile?.work_experience.length ? profile.work_experience : [emptyWorkExperience()],
  );

  const education = profile?.education ?? emptyEducation();
  const jobTitlesSeeking = useMemo(() => splitList(jobTitlesText), [jobTitlesText]);
  const preferredLocations = useMemo(
    () => splitList(preferredLocationsText),
    [preferredLocationsText],
  );

  function addTag(value: string, current: string[], update: (items: string[]) => void): void {
    const nextValue = value.trim();
    if (!nextValue || current.includes(nextValue)) {
      return;
    }

    update([...current, nextValue]);
  }

  function removeTag(value: string, current: string[], update: (items: string[]) => void): void {
    update(current.filter((item) => item !== value));
  }

  function updateWorkExperience(index: number, next: Partial<WorkExperience>): void {
    setWorkExperience((items) =>
      items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...next } : item)),
    );
  }

  function addWorkExperience(): void {
    setWorkExperience((items) =>
      items.length >= 3 ? items : [...items, emptyWorkExperience()],
    );
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-8 shadow-card">
      <div className="border-b border-border pb-5">
        <h2 className="text-2xl font-semibold leading-8 text-text-primary">
          Profile Information
        </h2>
        <p className="mt-1 text-sm font-medium leading-5 text-text-secondary">
          This context is used to accurately represent you in agent interactions.
        </p>
      </div>

      <form id={formId} action={formAction} className="mt-10">
        <input type="hidden" name="skillsJson" value={JSON.stringify(skills)} />
        <input type="hidden" name="industriesJson" value={JSON.stringify(industries)} />
        <input
          type="hidden"
          name="jobTitlesSeekingJson"
          value={JSON.stringify(jobTitlesSeeking)}
        />
        <input
          type="hidden"
          name="preferredLocationsJson"
          value={JSON.stringify(preferredLocations)}
        />
        <input
          type="hidden"
          name="workExperienceJson"
          value={JSON.stringify(workExperience)}
        />

        <div>
          <h3 className="text-lg font-semibold leading-7 text-text-primary">Personal Info</h3>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <label htmlFor="full-name">
              <span className={labelClass}>Full Name</span>
              <input
                id="full-name"
                name="fullName"
                className={inputClass}
                defaultValue={profile?.full_name ?? ""}
                placeholder="Faizan Ali"
              />
            </label>
            <label htmlFor="email">
              <span className={labelClass}>Email</span>
              <input
                id="email"
                name="email"
                type="email"
                className={mutedInputClass}
                defaultValue={profile?.email ?? userEmail}
                readOnly
              />
            </label>
            <label htmlFor="phone">
              <span className={labelClass}>Phone Number</span>
              <input
                id="phone"
                name="phone"
                className={inputClass}
                defaultValue={profile?.phone ?? ""}
                placeholder="+1 (555) 000-0000"
              />
            </label>
            <label htmlFor="location">
              <span className={labelClass}>Location</span>
              <input
                id="location"
                name="location"
                className={inputClass}
                defaultValue={profile?.location ?? ""}
                placeholder="City, Country"
              />
            </label>
            <label htmlFor="linkedin-url">
              <span className={labelClass}>LinkedIn URL</span>
              <input
                id="linkedin-url"
                name="linkedinUrl"
                className={inputClass}
                defaultValue={profile?.linkedin_url ?? ""}
                placeholder="https://linkedin.com/in/faizan"
              />
            </label>
            <label htmlFor="portfolio-url">
              <span className={labelClass}>Portfolio / GitHub</span>
              <input
                id="portfolio-url"
                name="portfolioUrl"
                className={inputClass}
                defaultValue={profile?.portfolio_url ?? ""}
                placeholder="https://github.com/jsmastery"
              />
            </label>
            <label htmlFor="work-authorization">
              <span className={labelClass}>Work Authorization</span>
              <select
                id="work-authorization"
                name="workAuthorization"
                className={inputClass}
                defaultValue={profile?.work_authorization ?? ""}
              >
                <option value="">Select authorization</option>
                <option value="citizen">Citizen</option>
                <option value="permanent_resident">Permanent resident</option>
                <option value="visa_required">Visa required</option>
              </select>
            </label>
          </div>
        </div>

        <div className={`${sectionDividerClass} mt-10`}>
          <h3 className="text-lg font-semibold leading-7 text-text-primary">Professional Info</h3>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <label htmlFor="current-title" className="md:col-span-2">
              <span className={labelClass}>Current/Recent Job Title</span>
              <input
                id="current-title"
                name="currentTitle"
                className={inputClass}
                defaultValue={profile?.current_title ?? ""}
                placeholder="Frontend Engineer"
              />
            </label>
            <label htmlFor="experience-level">
              <span className={labelClass}>Experience Level</span>
              <select
                id="experience-level"
                name="experienceLevel"
                className={inputClass}
                defaultValue={profile?.experience_level ?? ""}
              >
                <option value="">Select level</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid-level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </select>
            </label>
            <label htmlFor="years-experience">
              <span className={labelClass}>Years of Experience</span>
              <input
                id="years-experience"
                name="yearsExperience"
                type="number"
                min="0"
                className={inputClass}
                defaultValue={profile?.years_experience ?? ""}
                placeholder="4"
              />
            </label>
            <div className="md:col-span-2">
              <label htmlFor="skills">
                <span className={labelClass}>Skills</span>
                <span className="mt-2 flex gap-2">
                  <input
                    id="skills"
                    className={inputClass}
                    value={skillDraft}
                    onChange={(event) => setSkillDraft(event.target.value)}
                    placeholder="Add a skill"
                  />
                  <button
                    type="button"
                    className={addButtonClass}
                    onClick={() => {
                      addTag(skillDraft, skills, setSkills);
                      setSkillDraft("");
                    }}
                  >
                    Add
                  </button>
                </span>
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => removeTag(skill, skills, setSkills)}
                    className="rounded-md bg-surface-muted px-3 py-2 text-sm font-semibold leading-5 text-text-primary"
                  >
                    {skill} x
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="industries">
                <span className={labelClass}>Industries Worked In (Optional)</span>
                <span className="mt-2 flex gap-2">
                  <input
                    id="industries"
                    className={inputClass}
                    value={industryDraft}
                    onChange={(event) => setIndustryDraft(event.target.value)}
                    placeholder="E.g. FinTech, Healthcare"
                  />
                  <button
                    type="button"
                    className={addButtonClass}
                    onClick={() => {
                      addTag(industryDraft, industries, setIndustries);
                      setIndustryDraft("");
                    }}
                  >
                    Add
                  </button>
                </span>
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {industries.map((industry) => (
                  <button
                    key={industry}
                    type="button"
                    onClick={() => removeTag(industry, industries, setIndustries)}
                    className="rounded-md bg-surface-muted px-3 py-2 text-sm font-semibold leading-5 text-text-primary"
                  >
                    {industry} x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={`${sectionDividerClass} mt-10`}>
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold leading-7 text-text-primary">Work Experience</h3>
            <button
              type="button"
              className="text-sm font-semibold leading-5 text-accent disabled:text-text-muted"
              onClick={addWorkExperience}
              disabled={workExperience.length >= 3}
            >
              + Add role
            </button>
          </div>
          <div className="mt-6 grid gap-4">
            {workExperience.map((experience, index) => (
              <div key={index} className="rounded-lg border border-border bg-surface-secondary p-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <label htmlFor={`company-name-${index}`}>
                    <span className={labelClass}>Company Name</span>
                    <input
                      id={`company-name-${index}`}
                      className={inputClass}
                      value={experience.companyName}
                      onChange={(event) =>
                        updateWorkExperience(index, { companyName: event.target.value })
                      }
                      placeholder="Vercel"
                    />
                  </label>
                  <label htmlFor={`role-title-${index}`}>
                    <span className={labelClass}>Job Title</span>
                    <input
                      id={`role-title-${index}`}
                      className={inputClass}
                      value={experience.jobTitle}
                      onChange={(event) =>
                        updateWorkExperience(index, { jobTitle: event.target.value })
                      }
                      placeholder="Frontend Engineer"
                    />
                  </label>
                  <label htmlFor={`start-date-${index}`}>
                    <span className={labelClass}>Start Date</span>
                    <input
                      id={`start-date-${index}`}
                      className={inputClass}
                      value={experience.startDate}
                      onChange={(event) =>
                        updateWorkExperience(index, { startDate: event.target.value })
                      }
                      placeholder="January 2022"
                    />
                  </label>
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <label htmlFor={`end-date-${index}`} className={labelClass}>
                        End Date
                      </label>
                      <label
                        htmlFor={`current-role-${index}`}
                        className="flex items-center gap-2 text-xs font-medium leading-4 text-text-secondary"
                      >
                        <input
                          id={`current-role-${index}`}
                          type="checkbox"
                          className="h-4 w-4 rounded-sm border-border accent-accent"
                          checked={experience.current}
                          onChange={(event) =>
                            updateWorkExperience(index, { current: event.target.checked })
                          }
                        />
                        Currently working here
                      </label>
                    </div>
                    <input
                      id={`end-date-${index}`}
                      className={inputClass}
                      value={experience.endDate}
                      onChange={(event) =>
                        updateWorkExperience(index, { endDate: event.target.value })
                      }
                      placeholder="--------- ----"
                    />
                  </div>
                  <label htmlFor={`responsibilities-${index}`} className="md:col-span-2">
                    <span className={labelClass}>Key Responsibilities</span>
                    <textarea
                      id={`responsibilities-${index}`}
                      rows={4}
                      className={`${inputClass} resize-y`}
                      value={experience.responsibilities}
                      onChange={(event) =>
                        updateWorkExperience(index, { responsibilities: event.target.value })
                      }
                      placeholder="Built Next.js features and optimized web vitals."
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${sectionDividerClass} mt-10`}>
          <h3 className="text-lg font-semibold leading-7 text-text-primary">Education</h3>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <label htmlFor="highest-degree">
              <span className={labelClass}>Highest Degree</span>
              <select
                id="highest-degree"
                name="highestDegree"
                className={inputClass}
                defaultValue={education.highestDegree}
              >
                <option value="">Select degree</option>
                <option value="High School">High School</option>
                <option value="Bachelor's Degree">Bachelor&apos;s Degree</option>
                <option value="Master's Degree">Master&apos;s Degree</option>
                <option value="Doctorate">Doctorate</option>
              </select>
            </label>
            <label htmlFor="field-of-study">
              <span className={labelClass}>Field of Study</span>
              <input
                id="field-of-study"
                name="fieldOfStudy"
                className={inputClass}
                defaultValue={education.fieldOfStudy}
                placeholder="Computer Science"
              />
            </label>
            <label htmlFor="institution-name">
              <span className={labelClass}>Institution Name</span>
              <input
                id="institution-name"
                name="institutionName"
                className={inputClass}
                defaultValue={education.institutionName}
                placeholder="E.g. State University"
              />
            </label>
            <label htmlFor="graduation-year">
              <span className={labelClass}>Graduation Year</span>
              <input
                id="graduation-year"
                name="graduationYear"
                className={inputClass}
                defaultValue={education.graduationYear}
                placeholder="YYYY"
              />
            </label>
          </div>
        </div>

        <div className={`${sectionDividerClass} mt-10`}>
          <h3 className="text-lg font-semibold leading-7 text-text-primary">Job Preferences</h3>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <label htmlFor="job-titles-seeking" className="md:col-span-2">
              <span className={labelClass}>Job Titles Seeking</span>
              <input
                id="job-titles-seeking"
                className={inputClass}
                value={jobTitlesText}
                onChange={(event) => setJobTitlesText(event.target.value)}
                placeholder="Frontend Engineer, React Developer"
              />
            </label>
            <label htmlFor="remote-preference">
              <span className={labelClass}>Remote Preference</span>
              <select
                id="remote-preference"
                name="remotePreference"
                className={inputClass}
                defaultValue={profile?.remote_preference ?? ""}
              >
                <option value="">Select preference</option>
                <option value="any">Any</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </label>
            <label htmlFor="salary-expectation">
              <span className={labelClass}>Salary Expectation (Optional)</span>
              <input
                id="salary-expectation"
                name="salaryExpectation"
                className={inputClass}
                defaultValue={profile?.salary_expectation ?? ""}
                placeholder="E.g. $120k+"
              />
            </label>
            <label htmlFor="preferred-locations" className="md:col-span-2">
              <span className={labelClass}>Preferred Locations (Optional)</span>
              <input
                id="preferred-locations"
                className={inputClass}
                value={preferredLocationsText}
                onChange={(event) => setPreferredLocationsText(event.target.value)}
                placeholder="E.g. New York, London"
              />
            </label>
            <label htmlFor="cover-letter-tone" className="md:col-span-2">
              <span className={labelClass}>Cover Letter Tone</span>
              <select
                id="cover-letter-tone"
                name="coverLetterTone"
                className={inputClass}
                defaultValue={profile?.cover_letter_tone ?? ""}
              >
                <option value="">Select tone</option>
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="enthusiastic">Enthusiastic</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          {state.message ? (
            <p
              className={`mb-4 rounded-md border bg-surface px-4 py-3 text-sm font-medium leading-5 ${
                state.success
                  ? "border-success text-success-foreground"
                  : "border-error text-error"
              }`}
            >
              {state.message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold leading-5 text-accent-foreground transition-colors hover:bg-accent-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:bg-accent-light disabled:text-accent"
          >
            {isPending ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </section>
  );
}
