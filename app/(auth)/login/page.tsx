import { LoginCard } from "@/components/auth/LoginCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const errorMessages: Record<string, string> = {
  exchange_failed: "We could not finish signing you in. Please try again.",
  missing_verifier: "Your sign-in session expired. Please start again.",
  oauth_failed: "The provider could not complete sign-in. Please try again.",
  oauth_start_failed: "We could not start sign-in. Please try again.",
  provider_unavailable: "That sign-in provider is not available.",
};

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorMessage = params.error ? errorMessages[params.error] : null;

  return (
    <>
      <Navbar />
      <main className="bg-background">
        <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1440px] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <LoginCard errorMessage={errorMessage} />
        </section>
      </main>
      <div className="px-4 sm:px-6 lg:px-8">
        <Footer />
      </div>
    </>
  );
}
