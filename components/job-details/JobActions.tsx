type JobActionsProps = {
  company: string;
  applyUrl: string | null;
};

export function JobActions({ company, applyUrl }: JobActionsProps) {
  if (!applyUrl) {
    return null;
  }

  return (
    <a
      href={applyUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-12 items-center justify-center rounded-xl bg-accent px-6 py-3 text-base font-semibold leading-6 text-accent-foreground shadow-card transition-colors hover:bg-accent-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      Apply Now at {company}
    </a>
  );
}
