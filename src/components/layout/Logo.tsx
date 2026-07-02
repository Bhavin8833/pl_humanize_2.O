import logoImage from "@/assets/logo.png";

interface LogoProps {
  showSubtitle?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ showSubtitle = true, size = "md", className = "" }: LogoProps) {
  const sizes = {
    sm: { logo: "h-8 w-8", title: "text-lg", subtitle: "text-xs" },
    md: { logo: "h-10 w-10", title: "text-xl", subtitle: "text-xs" },
    lg: { logo: "h-14 w-14", title: "text-2xl", subtitle: "text-sm" },
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img src={logoImage} alt="PL Humanize Logo" className={`${sizes[size].logo} rounded-md`} />
      <div className="flex flex-col">
        <span className={`font-bold ${sizes[size].title} gradient-primary-text`}>
          PL Humanize
        </span>
        {showSubtitle && (
          <span className={`text-muted-foreground ${sizes[size].subtitle} -mt-0.5`}>
            (Parmar Labs Humanizer)
          </span>
        )}
      </div>
    </div>
  );
}
