import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-primary/25 bg-primary/90 text-primary-foreground hover:bg-primary",
        secondary: "border-border/75 bg-white/80 text-secondary-foreground hover:bg-white",
        destructive: "border-destructive/30 bg-destructive/90 text-destructive-foreground hover:bg-destructive",
        outline: "border-border/75 bg-white/72 text-foreground hover:border-primary/25",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
