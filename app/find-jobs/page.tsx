import { redirect } from "next/navigation";
import { PostHogIdentify } from "@/components/auth/PostHogIdentify";
import { FindJobsFilters } from "@/components/find-jobs/FindJobsFilters";
import { JobsTable } from "@/components/find-jobs/JobsTable";
import { SearchControls } from "@/components/find-jobs/SearchControls";
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
      <Navbar variant="app" activeHref="/find-jobs" />
      <section className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <SearchControls />
        <FindJobsFilters />
        <JobsTable />
      </section>
    </main>
  );
}
