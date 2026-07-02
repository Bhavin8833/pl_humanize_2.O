import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  onClick?: () => void;
  iconBgClassName?: string;
}

export function FeatureCard({
  title,
  description,
  icon,
  className,
  onClick,
  iconBgClassName,
}: FeatureCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative p-6 rounded-2xl bg-card border border-border shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="flex flex-col gap-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center text-white",
          iconBgClassName || "gradient-primary"
        )}>
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      <div className="absolute inset-0 rounded-2xl gradient-primary opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300" />
    </div>
  );
}
