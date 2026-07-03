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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-evenly py-1.5 px-1 safe-area-pb">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-1 flex-1 rounded-lg transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:scale-95"
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-xl transition-all duration-200",
                  isActive && "gradient-primary shadow-sm shadow-primary/25"
                )}
              >
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] transition-transform",
                    isActive ? "text-primary-foreground scale-105" : ""
                  )}
                />
              </div>
              <span className={cn(
                "text-[9px] font-semibold leading-tight transition-colors",
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
