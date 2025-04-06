import { cn } from "../lib/utils";

interface LoadingIndicatorProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const LoadingIndicator = ({ className, size = "md" }: LoadingIndicatorProps) => {
  const sizeClasses = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          "border-primary/30 border-t-primary rounded-full animate-spin",
          sizeClasses[size],
          className
        )}
      />
    </div>
  );
};

export default LoadingIndicator;
