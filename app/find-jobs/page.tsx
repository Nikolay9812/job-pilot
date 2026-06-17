import { redirect } from "next/navigation";
import { PostHogIdentify } from "@/components/auth/PostHogIdentify";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Navbar } from "@/components/layout/Navbar";
import { createInsforgeServer } from "@/lib/insforge-server";

export default async function FindJobsPage() {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();

  if (error || !data.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-background">
      <PostHogIdentify userId={data.user.id} />
      <Navbar />
      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-border bg-surface p-6 shadow-card">
          <p className="text-xs font-medium uppercase leading-4 text-accent">Find Jobs</p>
          <h1 className="mt-3 text-2xl font-semibold leading-8 text-text-primary">
            Job search is coming up
          </h1>
          <p className="mt-2 text-sm font-normal leading-5 text-text-secondary">
            Search controls and job matching will be built in the find jobs phase.
          </p>
          <SignOutButton />
        </div>
      </section>
    </main>
  );
}
