import { FileText, UploadCloud } from "lucide-react";

export function ResumeSection() {
  return (
    <section className="rounded-xl border border-border bg-surface p-8 shadow-card">
      <div>
        <h2 className="text-xl font-semibold leading-7 text-text-primary">Resume</h2>
        <p className="mt-1 text-sm font-medium leading-5 text-text-secondary">
          Upload an existing resume to auto-fill the profile, or generate a new tailored one
          from your details below.
        </p>
      </div>

      <div className="profile-upload-zone mt-7 flex min-h-60 flex-col items-center justify-center rounded-xl px-6 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface shadow-card">
          <UploadCloud className="h-6 w-6 text-accent" aria-hidden="true" />
        </div>
        <p className="mt-5 text-base font-semibold leading-6 text-text-primary">
          Click to upload or drag and drop
        </p>
        <p className="mt-1 text-sm font-medium leading-5 text-text-secondary">
          PDF formatting only. Maximum file size 5MB.
        </p>
        <button
          type="button"
          className="mt-6 inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-surface px-6 py-2 text-sm font-semibold leading-5 text-text-primary shadow-card transition-colors hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Select Resume
        </button>
      </div>

      <div className="mt-7 flex flex-col gap-4 border-t border-border pt-7 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium leading-5 text-text-secondary">
          Need a fresh document based on the fields below?
        </p>
        <button
          type="button"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-accent px-5 py-2 text-sm font-semibold leading-5 text-accent-foreground transition-colors hover:bg-accent-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          Generate Resume from Profile
        </button>
      </div>
    </section>
  );
}
