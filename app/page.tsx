import { CTASection } from "@/components/homepage/CTASection";
import { Features } from "@/components/homepage/Features";
import { Hero } from "@/components/homepage/Hero";
import { HowItWorks } from "@/components/homepage/HowItWorks";
import { SuccessStory } from "@/components/homepage/SuccessStory";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
        <Hero />
        <HowItWorks />
        <div className="h-28 border-x border-border landing-divider" />
        <Features />
        <div className="h-28 border-x border-border landing-divider" />
        <SuccessStory />
        <div className="h-28 border-x border-border landing-divider" />
        <CTASection />
        <div className="h-28 border-x border-border landing-divider" />
        <Footer />
      </div>
    </main>
  );
}
