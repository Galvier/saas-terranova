
import { cva } from "class-variance-authority";
import { Badge, BadgeProps } from "@/components/ui/badge";

// Extend the variant options with "success" and "warning"
const customBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-green-500 text-white hover:bg-green-500/80",
        warning: "border-transparent bg-amber-500 text-white hover:bg-amber-500/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface CustomBadgeProps extends Omit<BadgeProps, 'variant'> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

export function CustomBadge({ variant, className, ...props }: CustomBadgeProps) {
  return (
    <Badge 
      className={customBadgeVariants({ variant, className })}
      {...props} 
    />
  );
}
