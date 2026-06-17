import Image from "next/image";

const steps = [
  {
    title: "Find jobs that actually fit",
    copy: "Search by title and location or paste a job link. Get matched roles you can quickly scan.",
    accentClass: "border-l-2 border-accent",
  },
  {
    title: "Know the Company Before You Apply",
    copy: "Stop guessing what a company is about. JobPilot browses their site and gives you everything you need to apply with confidence.",
    accentClass: "",
  },
  {
    title: "Keep track of every application",
    copy: "Keep a clear view of every job you've found, tailored. Your activity and progress all stay in one simple place.",
    accentClass: "",
  },
];

export function HowItWorks() {
  return (
    <section className="landing-panel landing-grid grid lg:grid-cols-[1fr_1fr]">
      <div className="bg-surface">
        <div className="px-8 py-16 sm:px-12 lg:px-16 lg:py-20">
          <h2 className="max-w-[620px] text-[clamp(2.5rem,5vw,4.25rem)] font-semibold leading-[1.02] text-text-slate">
            Manage Your Job Search With Ease
          </h2>
        </div>

        <div className="border-t border-border">
          {steps.map((step) => (
            <div
              key={step.title}
              className={`border-b border-border px-8 py-9 sm:px-12 lg:px-16 ${step.accentClass}`}
            >
              <h3 className="text-xl font-semibold leading-7 text-text-slate">
                {step.title}
              </h3>
              <p className="mt-4 max-w-[660px] text-lg font-normal leading-8 text-text-slate-medium">
                {step.copy}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center bg-surface-muted px-6 py-16 sm:px-10 lg:px-16">
        <Image
          src="/images/jobs-lists.png"
          alt="Job match list preview"
          width={2048}
          height={1536}
          className="w-full max-w-[650px] rounded-[24px] landing-card-shadow"
        />
      </div>
    </section>
  );
}
