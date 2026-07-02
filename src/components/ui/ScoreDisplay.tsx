import { cn } from "@/lib/utils";

interface ScoreDisplayProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  showBar?: boolean;
}

export function ScoreDisplay({
  score,
  label = "AI Score",
  size = "md",
  showBar = true,
}: ScoreDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score < 15) return "text-score-low";
    if (score < 40) return "text-score-medium";
    return "text-score-high";
  };

  const getBarColor = (score: number) => {
    if (score < 15) return "bg-score-low";
    if (score < 40) return "bg-score-medium";
    return "bg-score-high";
  };

  const getScoreMessage = (score: number) => {
    if (score < 15) return "Likely human-written";
    if (score < 40) return "Mixed signals detected";
    return "Likely AI-generated";
  };

  const sizes = {
    sm: { text: "text-2xl", label: "text-xs" },
    md: { text: "text-4xl", label: "text-sm" },
    lg: { text: "text-5xl", label: "text-base" },
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-center">
        <p className={cn("text-muted-foreground", sizes[size].label)}>
          {label}
        </p>
        <p className={cn("font-bold", sizes[size].text, getScoreColor(score))}>
          {score.toFixed(1)}%
        </p>
        <p className={cn("text-muted-foreground mt-1", sizes[size].label)}>
          {getScoreMessage(score)}
        </p>
      </div>

      {showBar && (
        <div className="w-full max-w-xs">
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                getBarColor(score)
              )}
              style={{ width: `${Math.min(score, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>Human</span>
            <span>AI</span>
          </div>
        </div>
      )}
    </div>
  );
}
