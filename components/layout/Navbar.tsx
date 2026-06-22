import Image from "next/image";
import Link from "next/link";
import { CircleUserRound, LayoutDashboard, Search } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/find-jobs", label: "Find Jobs", icon: Search },
  { href: "/profile", label: "Profile", icon: CircleUserRound },
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

          <nav className="flex h-full items-center gap-4 sm:gap-8">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = href === activeHref;

              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex h-full items-center gap-2 border-b-2 px-1 text-sm font-semibold leading-5 transition-colors ${
                    isActive
                      ? "border-accent text-accent"
                      : "border-transparent text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
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
