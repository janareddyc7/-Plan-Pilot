import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
export const buttonVariants = cva(
  "inline-flex min-h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md px-3.5 py-2 text-xs font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default:
          "border border-primary bg-primary text-primary-foreground hover:bg-foreground hover:border-foreground shadow-control",
        outline:
          "border border-border bg-card hover:bg-secondary hover:border-primary/40",
        ghost: "hover:bg-muted",
      },
    },
    defaultVariants: { variant: "default" },
  },
);
export function Button({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, className }))} {...props} />
  );
}
