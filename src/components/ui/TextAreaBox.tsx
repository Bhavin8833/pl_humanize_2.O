import { cn } from "@/lib/utils";

interface TextAreaBoxProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  label?: string;
  wordCount?: number;
  maxHeight?: string;
  className?: string;
}

export function TextAreaBox({
  value,
  onChange,
  placeholder,
  readOnly = false,
  label,
  wordCount,
  maxHeight,
  className,
}: TextAreaBoxProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value);
  };

  // Check if this is a humanize textbox for consistent sizing
  const isHumanizeBox = className?.includes("humanize-textbox");
  const boxHeight = isHumanizeBox ? "380px" : (maxHeight || "380px");

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div
        className={cn(
          "relative rounded-xl border-2 bg-card transition-all duration-200",
          readOnly
            ? "border-border"
            : "border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
        )}
        style={{ height: boxHeight }}
      >
        {readOnly ? (
          <div
            className="h-full p-4 overflow-y-auto scrollbar-thin whitespace-pre-wrap text-foreground"
          >
            {value || (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
        ) : (
          <textarea
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full h-full p-4 bg-transparent resize-none outline-none text-foreground placeholder:text-muted-foreground scrollbar-thin overflow-y-auto"
          />
        )}
      </div>
      {wordCount !== undefined && (
        <div className="flex justify-end">
          <span className="text-xs text-muted-foreground">
            {wordCount} words
          </span>
        </div>
      )}
    </div>
  );
}
