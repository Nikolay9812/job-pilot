import { redirect } from "next/navigation";
import { PostHogIdentify } from "@/components/auth/PostHogIdentify";
import { Navbar } from "@/components/layout/Navbar";
import { ProfileAttentionBanner } from "@/components/profile/ProfileAttentionBanner";
import { ProfileInformationForm } from "@/components/profile/ProfileInformationForm";
import { ResumeSection } from "@/components/profile/ResumeSection";
import { createInsforgeServer } from "@/lib/insforge-server";

export default async function ProfilePage() {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();

  if (error || !data.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-background">
      <PostHogIdentify userId={data.user.id} />
      <Navbar variant="app" activeHref="/profile" />
      <section className="mx-auto flex max-w-[980px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-0">
        <ProfileAttentionBanner />
        <ResumeSection />
        <ProfileInformationForm />
      </section>
    </main>
  );
}
