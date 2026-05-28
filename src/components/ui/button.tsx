import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex transform-gpu items-center justify-center gap-2 whitespace-nowrap rounded-[0.9rem] text-sm font-semibold ring-offset-transparent transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-0 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transform-gpu",
  {
    variants: {
      variant: {
        default:
          "border border-primary/25 bg-primary text-primary-foreground shadow-[0_12px_30px_-20px_hsl(var(--primary)/0.75)] hover:bg-primary/95 hover:shadow-[0_16px_32px_-20px_hsl(var(--primary)/0.86)]",
        destructive:
          "border border-destructive/30 bg-destructive text-destructive-foreground shadow-[0_12px_30px_-20px_hsl(var(--destructive)/0.72)] hover:bg-destructive/90",
        outline:
          "glass-input border-border/80 bg-white/75 text-foreground shadow-sm hover:border-primary/30 hover:bg-white/92 hover:text-foreground",
        secondary:
          "border border-border/80 bg-secondary/75 text-secondary-foreground shadow-sm hover:border-primary/25 hover:bg-secondary/92",
        ghost: "text-muted-foreground hover:bg-white/70 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
