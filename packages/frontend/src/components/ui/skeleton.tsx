import { cn } from "#components/lib/utils";

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("animate-pulse rounded-md bg-muted-foreground/20", className)} {...props} />
  );
}
