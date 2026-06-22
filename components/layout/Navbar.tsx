import Image from "next/image";
import Link from "next/link";
import { CircleUserRound } from "lucide-react";
import { NavbarSignOutButton } from "@/components/layout/NavbarSignOutButton";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/find-jobs", label: "Find Jobs" },
  { href: "/profile", label: "Profile" },
];

type NavbarProps = {
  activeHref?: string;
  variant?: "marketing" | "app";
};

export function Navbar({ activeHref, variant = "marketing" }: NavbarProps) {
  if (variant === "app") {
    return (
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-6">
          <Link href="/" aria-label="JobPilot home" className="shrink-0">
            <Image
              src="/logo.png"
              alt="JobPilot"
              width={118}
              height={36}
              priority
            />
          </Link>

          <div className="flex items-center gap-8">
            <nav className="flex items-center gap-8">
              {navItems.map(({ href, label }) => {
                const isActive = href === activeHref;

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`text-sm font-semibold leading-5 transition-colors ${
                      isActive ? "text-accent" : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
            <CircleUserRound className="h-6 w-6 text-text-muted" aria-hidden="true" />
            <NavbarSignOutButton />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="JobPilot home" className="shrink-0">
          <Image
            src="/logo.png"
            alt="JobPilot"
            width={157}
            height={48}
            priority
          />
        </Link>

        <nav className="hidden items-center gap-11 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-base font-medium leading-6 text-text-slate transition-colors hover:text-text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/login" className="landing-button-primary hidden sm:inline-flex">
          Start for free
        </Link>
      </div>
    </header>
  );
}
