import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { createInsforgeServer } from "@/lib/insforge-server";

export default async function DashboardPage() {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();

  if (error || !data.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-border bg-surface p-6 shadow-card">
          <p className="text-xs font-medium uppercase leading-4 text-accent">Dashboard</p>
          <h1 className="mt-3 text-2xl font-semibold leading-8 text-text-primary">
            You are signed in
          </h1>
          <p className="mt-2 text-sm font-normal leading-5 text-text-secondary">
            Dashboard data arrives in the next foundation phase.
          </p>
        </div>
      </section>
    </main>
  );
}
