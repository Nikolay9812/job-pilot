import Image from "next/image";

export function SuccessStory() {
  return (
    <section className="landing-panel bg-surface px-6 py-16 text-center sm:px-10 sm:py-20 lg:px-16 lg:py-24">
      <p className="text-xs font-semibold uppercase leading-4 tracking-[0.22em] text-accent">
        Success Stories
      </p>
      <blockquote className="mx-auto mt-8 max-w-[920px] text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1.22] text-text-slate">
        &ldquo;I used to spend my evenings copy-pasting resumes. Now I open my
        dashboard to see interviews waiting. It feels like cheating. Had 3
        offers on the table simultaneously.&rdquo;
      </blockquote>
      <div className="mt-9 flex items-center justify-center gap-3">
        <Image
          src="/images/user-icon.png"
          alt="Tom Wilson"
          width={64}
          height={64}
          className="h-12 w-12 rounded-full"
        />
        <div className="text-left">
          <p className="text-base font-semibold leading-6 text-text-primary">
            Tom Wilson
          </p>
          <p className="text-sm font-normal leading-5 text-text-secondary">
            Junior Developer
          </p>
        </div>
      </div>
    </section>
  );
}
