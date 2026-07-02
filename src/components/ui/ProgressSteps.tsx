import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
  completed: boolean;
  active: boolean;
}

interface ProgressStepsProps {
  steps: Step[];
  className?: string;
}

export function ProgressSteps({ steps, className }: ProgressStepsProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300",
              step.completed
                ? "bg-score-low/10 text-score-low"
                : step.active
                ? "gradient-primary text-primary-foreground animate-pulse-subtle"
                : "bg-muted text-muted-foreground"
            )}
          >
            {step.completed ? (
              <Check className="h-4 w-4" />
            ) : (
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  step.active ? "bg-primary-foreground" : "bg-current"
                )}
              />
            )}
            <span className="text-sm font-medium">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "w-8 h-0.5 mx-1",
                steps[index + 1].completed || steps[index + 1].active
                  ? "gradient-primary-lr"
                  : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
