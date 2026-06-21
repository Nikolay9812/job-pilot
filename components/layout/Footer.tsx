import Image from "next/image";
import Link from "next/link";

const footerLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Condition" },
];

export function Footer() {
  return (
    <footer className="border-x border-b border-border bg-surface">
      <div className="flex flex-col gap-8 px-8 py-14 sm:px-12 md:flex-row md:items-center md:justify-between lg:px-14">
        <Link href="/" aria-label="JobPilot home">
          <Image
            src="/logo.png"
            alt="JobPilot"
            width={157}
            height={48}
          />
        </Link>

        <nav className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-9">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base font-medium leading-6 text-text-slate transition-colors hover:text-text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
