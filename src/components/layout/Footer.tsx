import { Link } from "react-router-dom";
import { Logo } from "./Logo";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/humanize", label: "Humanize" },
  { href: "/paraphrase", label: "Paraphrase" },
  { href: "/ai-detector", label: "AI Detector" },
  { href: "/about", label: "About" },
];

export function Footer() {
  return (
    <footer className="hidden md:block border-t border-border bg-background mt-auto">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size="sm" showSubtitle />
          
          <nav className="flex items-center gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} PL Humanize. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
