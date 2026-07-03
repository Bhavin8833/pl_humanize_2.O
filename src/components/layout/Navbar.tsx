import { Link, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/humanize", label: "Humanize" },
  { href: "/paraphrase", label: "Paraphrase" },
  { href: "/ai-detector", label: "AI Detector" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const location = useLocation();
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/40">
      <nav className="container flex h-14 md:h-16 items-center justify-between px-4">
        {/* Logo — hide subtitle on mobile to save space */}
        <Link to="/" className="flex items-center hover:opacity-90 transition-opacity shrink-0">
          <Logo size="md" showSubtitle={false} className="md:hidden" />
          <Logo size="md" showSubtitle className="hidden md:flex" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <div
            className="flex items-center gap-1.5 relative px-2 py-1.5 bg-muted/40 dark:bg-zinc-900/40 rounded-full border border-border/60 dark:border-white/5"
            onMouseLeave={() => setHoveredPath(null)}
          >
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onMouseEnter={() => setHoveredPath(link.href)}
                  className={cn(
                    "relative px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors duration-200 z-10",
                    isActive
                      ? "text-primary dark:text-primary-bright"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {/* Active Background Slider */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      className="absolute inset-0 bg-white dark:bg-zinc-800 border border-border/80 dark:border-white/10 shadow-sm rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}

                  {/* Hover Backdrop Slider */}
                  {hoveredPath === link.href && !isActive && (
                    <motion.div
                      layoutId="hoverNavTab"
                      className="absolute inset-0 bg-muted-foreground/10 rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="p-1 rounded-full bg-muted/45 dark:bg-zinc-900/45 border border-border/60 dark:border-white/5 flex items-center justify-center">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile: Theme Toggle + Hamburger — identical sizing */}
        <div className="flex md:hidden items-center gap-1.5">
          <div className="h-9 w-9 rounded-full bg-muted/40 border border-border/60 flex items-center justify-center">
            <ThemeToggle />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full bg-muted/40 border border-border/60"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-background/95 backdrop-blur-xl border-b border-border/50 absolute w-full shadow-lg z-40"
          >
            <div className="container px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "px-4 py-3 rounded-xl text-sm font-semibold transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground border border-transparent"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
