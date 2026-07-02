import { cn } from "@/lib/utils";

interface CircularGaugeProps {
  score?: number;
  value?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showIcon?: boolean;
  hideText?: boolean;
  hideRisk?: boolean;
}

export function CircularGauge({ 
  score, 
  value, 
  size = 180, 
  strokeWidth = 12, 
  color,
  showIcon,
  hideText = false,
  hideRisk = false 
}: CircularGaugeProps) {
  // Use value if score is not provided
  const actualScore = score ?? value ?? 0;
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  
  // Calculate the arc for the gauge (270 degrees, starting from bottom-left)
  const arcLength = 0.75; // 270 degrees / 360 = 0.75
  const arcCircumference = circumference * arcLength;
  const offset = arcCircumference - (actualScore / 100) * arcCircumference;
  
  const getScoreColor = (s: number) => {
    if (s <= 30) return "#22c55e"; // Green
    if (s <= 60) return "#f59e0b"; // Yellow/Orange
    return "#ef4444"; // Red
  };

  const getRiskLabel = (s: number) => {
    if (s <= 30) return { text: "Low Risk", color: "text-green-500 bg-green-500/10" };
    if (s <= 60) return { text: "Medium Risk", color: "text-yellow-500 bg-yellow-500/10" };
    return { text: "High Risk", color: "text-red-500 bg-red-500/10" };
  };

  const risk = getRiskLabel(actualScore);
  
  // For small gauges (like size 64), automatically hide text and risk unless explicitly shown
  const shouldHideText = hideText || size < 100;
  const shouldHideRisk = hideRisk || size < 100;

  // Determine stroke color (Tailwind arbitrary colors or currentColor if a class is provided)
  const strokeColor = color && color.startsWith("text-") ? "currentColor" : (color || getScoreColor(actualScore));

  return (
    <div className={cn("flex flex-col items-center", color && color.startsWith("text-") ? color : "")}>
      <div className="relative" style={{ width: size, height: shouldHideText ? size : size * 0.7 }}>
        <svg
          width={size}
          height={size}
          className="transform"
          style={{ marginTop: shouldHideText ? 0 : -size * 0.15 }}
        >
          {/* Background arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcCircumference} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(135, ${center}, ${center})`}
          />
          
          {/* Colored progress arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcCircumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(135, ${center}, ${center})`}
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
          
          {!shouldHideText && (
            <>
              {/* 0% label */}
              <text
                x={center - radius - 5}
                y={center + 20}
                fill="hsl(var(--muted-foreground))"
                fontSize="12"
                textAnchor="middle"
              >
                0%
              </text>
              
              {/* 100% label */}
              <text
                x={center + radius + 5}
                y={center + 20}
                fill="hsl(var(--muted-foreground))"
                fontSize="12"
                textAnchor="middle"
              >
                100%
              </text>
            </>
          )}
        </svg>
        
        {!shouldHideText && (
          <div 
            className="absolute left-1/2 -translate-x-1/2 text-center"
            style={{ top: size * 0.3 }}
          >
            <div className="text-3xl font-bold text-foreground">{actualScore.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">AI Content</div>
          </div>
        )}
      </div>
      
      {!shouldHideRisk && (
        <span className={cn("px-4 py-1.5 rounded-full text-sm font-medium mt-2", risk.color)}>
          {risk.text}
        </span>
      )}
    </div>
  );
}
