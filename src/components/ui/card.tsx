import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-5 text-card-foreground",
        className,
      )}
      {...props}
    />
  );
}
export function CardTitle({ className, ...props }: ComponentProps<"h2">) {
  return (
    <h2
      className={cn("text-base font-medium tracking-tight", className)}
      {...props}
    />
  );
}
export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("mt-3 text-sm leading-7 text-muted-foreground", className)}
      {...props}
    />
  );
}
