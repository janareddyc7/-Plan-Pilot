import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
export function Badge({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-sm border border-border bg-secondary px-2.5 py-1 font-mono text-[11px] text-secondary-foreground",
        className,
      )}
      {...props}
    />
  );
}
