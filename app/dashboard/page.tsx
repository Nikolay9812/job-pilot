import { redirect } from "next/navigation";
import { PostHogIdentify } from "@/components/auth/PostHogIdentify";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";
import { CompanyResearchChart } from "@/components/dashboard/CompanyResearchChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { Navbar } from "@/components/layout/Navbar";
import { loadDashboardStats, loadRecentDashboardActivity } from "@/lib/dashboard";
import { createInsforgeServer } from "@/lib/insforge-server";

export default async function DashboardPage() {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();

  if (error || !data.user) {
    redirect("/login");
  }

  const [stats, activities] = await Promise.all([
    loadDashboardStats(data.user.id),
    loadRecentDashboardActivity(data.user.id),
  ]);

  return (
    <main className="min-h-screen bg-background">
      <PostHogIdentify userId={data.user.id} />
      <Navbar variant="app" activeHref="/dashboard" />
      <section className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <StatsBar stats={stats} />
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentActivity activities={activities} />
          <CompanyResearchChart />
        </div>
        <AnalyticsCharts />
      </section>
    </main>
  );
}
