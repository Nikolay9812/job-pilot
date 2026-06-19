const labelClass = "text-xs font-semibold uppercase leading-4 text-text-secondary";
const inputClass =
  "mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium leading-5 text-text-primary shadow-sm outline-none placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent";
const mutedInputClass =
  "mt-2 min-h-11 w-full rounded-md border border-border bg-surface-secondary px-4 py-2 text-sm font-medium leading-5 text-text-primary shadow-sm outline-none";
const sectionDividerClass = "border-t border-border pt-10";

const skills = ["React", "TypeScript", "Next.js", "Tailwind CSS"];

export function ProfileInformationForm() {
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

      <form className="mt-10">
        <div>
          <h3 className="text-lg font-semibold leading-7 text-text-primary">Personal Info</h3>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <label htmlFor="full-name">
              <span className={labelClass}>Full Name</span>
              <input id="full-name" name="fullName" className={mutedInputClass} defaultValue="Faizan Ali" />
            </label>
            <label htmlFor="email">
              <span className={labelClass}>Email</span>
              <input
                id="email"
                name="email"
                type="email"
                className={mutedInputClass}
                defaultValue="faizan@jsmastery.pro"
                readOnly
              />
            </label>
            <label htmlFor="phone">
              <span className={labelClass}>Phone Number</span>
              <input
                id="phone"
                name="phone"
                className={inputClass}
                placeholder="+1 (555) 000-0000"
              />
            </label>
            <label htmlFor="location">
              <span className={labelClass}>Location</span>
              <input id="location" name="location" className={inputClass} placeholder="City, Country" />
            </label>
            <label htmlFor="linkedin-url">
              <span className={labelClass}>LinkedIn URL</span>
              <input
                id="linkedin-url"
                name="linkedinUrl"
                className={mutedInputClass}
                defaultValue="https://linkedin.com/in/faizan"
              />
            </label>
            <label htmlFor="portfolio-url">
              <span className={labelClass}>Portfolio / GitHub</span>
              <input
                id="portfolio-url"
                name="portfolioUrl"
                className={mutedInputClass}
                defaultValue="https://github.com/jsmastery"
              />
            </label>
            <label htmlFor="work-authorization">
              <span className={labelClass}>Work Authorization</span>
              <select id="work-authorization" name="workAuthorization" className={inputClass} defaultValue="citizen">
                <option value="citizen">Citizen</option>
                <option value="permanent-resident">Permanent resident</option>
                <option value="visa-required">Visa required</option>
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
                className={mutedInputClass}
                defaultValue="Frontend Engineer"
              />
            </label>
            <label htmlFor="experience-level">
              <span className={labelClass}>Experience Level</span>
              <select id="experience-level" name="experienceLevel" className={inputClass} defaultValue="junior">
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
                className={mutedInputClass}
                defaultValue="4"
              />
            </label>
            <div className="md:col-span-2">
              <label htmlFor="skills">
                <span className={labelClass}>Skills</span>
                <span className="mt-2 flex gap-2">
                  <input id="skills" name="skills" className={inputClass} placeholder="Add a skill" />
                  <button
                    type="button"
                    className="mt-2 inline-flex min-h-11 items-center justify-center rounded-md bg-surface-secondary px-5 py-2 text-sm font-semibold leading-5 text-text-secondary transition-colors hover:bg-surface-tertiary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    Add
                  </button>
                </span>
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md bg-surface-muted px-3 py-2 text-sm font-semibold leading-5 text-text-primary"
                  >
                    {skill} x
                  </span>
                ))}
              </div>
            </div>
            <label htmlFor="industries" className="md:col-span-2">
              <span className={labelClass}>Industries Worked In (Optional)</span>
              <span className="mt-2 flex gap-2">
                <input
                  id="industries"
                  name="industries"
                  className={inputClass}
                  placeholder="E.g. FinTech, Healthcare"
                />
                <button
                  type="button"
                  className="mt-2 inline-flex min-h-11 items-center justify-center rounded-md bg-surface-secondary px-5 py-2 text-sm font-semibold leading-5 text-text-secondary transition-colors hover:bg-surface-tertiary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Add
                </button>
              </span>
            </label>
          </div>
        </div>

        <div className={`${sectionDividerClass} mt-10`}>
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold leading-7 text-text-primary">Work Experience</h3>
            <button type="button" className="text-sm font-semibold leading-5 text-accent">
              + Add role
            </button>
          </div>
          <div className="mt-6 rounded-lg border border-border bg-surface-secondary p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <label htmlFor="company-name">
                <span className={labelClass}>Company Name</span>
                <input
                  id="company-name"
                  name="companyName"
                  className={inputClass}
                  defaultValue="Vercel"
                />
              </label>
              <label htmlFor="role-title">
                <span className={labelClass}>Job Title</span>
                <input
                  id="role-title"
                  name="roleTitle"
                  className={inputClass}
                  defaultValue="Frontend Engineer"
                />
              </label>
              <label htmlFor="start-date">
                <span className={labelClass}>Start Date</span>
                <input
                  id="start-date"
                  name="startDate"
                  className={inputClass}
                  defaultValue="January 2022"
                />
              </label>
              <div>
                <div className="flex items-center justify-between gap-4">
                  <label htmlFor="end-date" className={labelClass}>
                    End Date
                  </label>
                  <label htmlFor="current-role" className="flex items-center gap-2 text-xs font-medium leading-4 text-text-secondary">
                    <input
                      id="current-role"
                      name="currentRole"
                      type="checkbox"
                      className="h-4 w-4 rounded-sm border-border accent-accent"
                      defaultChecked
                    />
                    Currently working here
                  </label>
                </div>
                <input id="end-date" name="endDate" className={inputClass} placeholder="--------- ----" />
              </div>
              <label htmlFor="responsibilities" className="md:col-span-2">
                <span className={labelClass}>Key Responsibilities</span>
                <textarea
                  id="responsibilities"
                  name="responsibilities"
                  rows={4}
                  className={`${inputClass} resize-y`}
                  defaultValue="Built Next.js features and optimized web vitals. Led a team of 3 developers."
                />
              </label>
            </div>
          </div>
        </div>

        <div className={`${sectionDividerClass} mt-10`}>
          <h3 className="text-lg font-semibold leading-7 text-text-primary">Education</h3>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <label htmlFor="highest-degree">
              <span className={labelClass}>Highest Degree</span>
              <select id="highest-degree" name="highestDegree" className={inputClass} defaultValue="high-school">
                <option value="high-school">High School</option>
                <option value="bachelors">Bachelor&apos;s Degree</option>
                <option value="masters">Master&apos;s Degree</option>
                <option value="doctorate">Doctorate</option>
              </select>
            </label>
            <label htmlFor="field-of-study">
              <span className={labelClass}>Field of Study</span>
              <input
                id="field-of-study"
                name="fieldOfStudy"
                className={inputClass}
                defaultValue="Computer Science"
              />
            </label>
            <label htmlFor="institution-name">
              <span className={labelClass}>Institution Name</span>
              <input
                id="institution-name"
                name="institutionName"
                className={inputClass}
                placeholder="E.g. State University"
              />
            </label>
            <label htmlFor="graduation-year">
              <span className={labelClass}>Graduation Year</span>
              <input id="graduation-year" name="graduationYear" className={inputClass} placeholder="YYYY" />
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
                name="jobTitlesSeeking"
                className={mutedInputClass}
                defaultValue="Frontend Engineer, React Developer"
              />
            </label>
            <label htmlFor="remote-preference">
              <span className={labelClass}>Remote Preference</span>
              <select id="remote-preference" name="remotePreference" className={inputClass} defaultValue="any">
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
                placeholder="E.g. $120k+"
              />
            </label>
            <label htmlFor="preferred-locations" className="md:col-span-2">
              <span className={labelClass}>Preferred Locations (Optional)</span>
              <input
                id="preferred-locations"
                name="preferredLocations"
                className={inputClass}
                placeholder="E.g. New York, London"
              />
            </label>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <button
            type="button"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold leading-5 text-accent-foreground transition-colors hover:bg-accent-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Save Profile
          </button>
        </div>
      </form>
    </section>
  );
}
