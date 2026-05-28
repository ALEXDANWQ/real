import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center py-1", className)}
    {...props}
  >
    <SliderPrimitive.Track className="pressure-track relative h-2.5 w-full grow overflow-hidden">
      <SliderPrimitive.Range className="pressure-fill absolute h-full bg-primary shadow-none transition-[width,background-color] duration-500 ease-out" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border border-primary/35 bg-card shadow-[0_2px_8px_-4px_hsl(var(--primary)/0.55)] outline-none transition-none focus:outline-none focus:shadow-none focus-visible:outline-none focus-visible:shadow-none disabled:pointer-events-none disabled:opacity-50 [-webkit-tap-highlight-color:transparent]" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
