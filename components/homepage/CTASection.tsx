import Link from "next/link";

export function CTASection() {
  return (
    <section className="landing-panel landing-hero-glow px-6 py-16 text-center sm:px-10 sm:py-20 lg:px-16 lg:py-24">
      <h2 className="mx-auto max-w-[900px] text-[clamp(2.75rem,6vw,5rem)] font-semibold leading-[1.02] text-text-slate">
        Your next job search can feel a lot less overwhelming
      </h2>
      <p className="mx-auto mt-8 max-w-[760px] text-lg font-normal leading-8 text-text-slate">
        Set up your profile, upload your resume, and start finding matches in minutes.
      </p>
      <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link href="/login" className="landing-button-primary w-full sm:w-auto">
          Get Started <span className="ml-2 text-text-muted">&gt;</span>
        </Link>
        <Link href="/find-jobs" className="landing-button-secondary w-full sm:w-auto">
          Find Your First Match
        </Link>
      </div>
    </section>
  );
}
