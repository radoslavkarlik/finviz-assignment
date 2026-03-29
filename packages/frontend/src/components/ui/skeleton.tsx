import { cn } from "#components/lib/utils";
import { type ComponentProps } from "react";

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("animate-pulse rounded-md bg-muted-foreground/20", className)} {...props} />
  );
}
