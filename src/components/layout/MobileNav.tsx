import { Link, useLocation } from "react-router-dom";
import { Home, Wand2, RefreshCcw, Search, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/humanize", label: "Humanize", icon: Wand2 },
  { href: "/paraphrase", label: "Paraphrase", icon: RefreshCcw },
  { href: "/ai-detector", label: "Detector", icon: Search },
  { href: "/about", label: "About", icon: Info },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="grid grid-cols-5 w-full py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-1 transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:scale-95"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-lg transition-all duration-200",
                  isActive && "gradient-primary shadow-sm shadow-primary/25"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isActive ? "text-primary-foreground" : ""
                  )}
                />
              </div>
              <span className={cn(
                "text-[9px] font-semibold leading-none transition-colors truncate max-w-full",
                isActive ? "text-primary" : ""
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
