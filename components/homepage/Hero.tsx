import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="landing-panel landing-hero-glow border-b-0">
      <div className="px-6 py-16 text-center sm:px-10 sm:py-20 lg:px-16 lg:py-24">
        <h1 className="mx-auto max-w-[780px] text-[clamp(3rem,6vw,5.25rem)] font-semibold leading-[0.98] text-text-slate">
          Job hunting is hard. Your tools shouldn&apos;t be.
        </h1>
        <p className="mx-auto mt-8 max-w-[700px] text-lg font-normal leading-8 text-text-slate-medium">
          Stop applying blind. JobPilot finds the jobs, researches the companies,
          and gives you everything you need to stand out.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/login" className="landing-button-primary w-full sm:w-auto">
            Get Started <span className="ml-2 text-text-muted">&gt;</span>
          </Link>
          <Link href="/find-jobs" className="landing-button-secondary w-full sm:w-auto">
            Find Your First Match
          </Link>
        </div>
      </div>

      <div className="border-t border-border bg-surface-tertiary px-4 py-14 sm:px-10 lg:px-20">
        <div className="mx-auto max-w-[1200px] overflow-hidden rounded-[26px] bg-surface landing-browser-shadow">
          <Image
            src="/images/dashboard-demo.png"
            alt="JobPilot dashboard preview"
            width={2048}
            height={1024}
            priority
            className="w-full"
          />
        </div>
      </div>
    </section>
  );
}
