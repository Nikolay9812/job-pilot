import Image from "next/image";

const features = [
  {
    title: "Understand your match score",
    copy: "See how your profile lines up with each role before you apply. Get a clear breakdown of what fits and what's missing.",
    accentClass: "",
  },
  {
    title: "AI-Powered Job Matching",
    copy: "Stop guessing which jobs are worth applying to. JobPilot scores every role against your actual skills so you focus on the ones that matter.",
    accentClass: "border-l-2 border-success",
  },
  {
    title: "Focus on the right roles",
    copy: "Filter out low fit jobs and stay on the ones that actually matter. Spend less time sorting and more time applying.",
    accentClass: "",
  },
];

export function Features() {
  return (
    <section className="landing-panel landing-grid grid lg:grid-cols-[1fr_1fr]">
      <div className="flex items-center justify-center bg-surface-muted px-6 py-16 sm:px-10 lg:px-16">
        <Image
          src="/images/agnet-log.png"
          alt="JobPilot agent log preview"
          width={2048}
          height={1600}
          className="w-full max-w-[600px] rounded-[24px]"
        />
      </div>

      <div className="bg-surface">
        <div className="px-8 py-16 sm:px-12 lg:px-16 lg:py-20">
          <h2 className="max-w-[650px] text-[clamp(2.5rem,5vw,4.25rem)] font-semibold leading-[1.02] text-text-slate">
            Apply With More Confidence, Every Time
          </h2>
        </div>

        <div className="border-t border-border">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`border-b border-border px-8 py-9 sm:px-12 lg:px-16 ${feature.accentClass}`}
            >
              <h3 className="text-xl font-semibold leading-7 text-text-slate">
                {feature.title}
              </h3>
              <p className="mt-4 max-w-[720px] text-lg font-normal leading-8 text-text-slate-medium">
                {feature.copy}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
