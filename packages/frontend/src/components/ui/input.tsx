import { cn } from "#components/lib/utils";
import { X } from "lucide-react";

function Input({
  className,
  type,
  value,
  onChange,
  ...props
}: Omit<React.ComponentProps<"input">, "onChange"> & {
  readonly onChange?: (value: string) => void;
}) {
  function handleClear() {
    onChange?.("");
  }

  return (
    <div className="relative flex items-center">
      <input
        type={type}
        data-slot="input"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          value ? "pr-7" : "",
          className,
        )}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 cursor-pointer text-white/40 transition-colors hover:text-white/90"
          tabIndex={-1}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export { Input };
