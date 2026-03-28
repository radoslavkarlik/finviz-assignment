import { ToggleGroup, ToggleGroupItem } from "#components/ui/toggle-group";
import { useTheme } from "#hooks/use-theme";
import { Monitor, Moon, Sun } from "lucide-react";

type Theme = "light" | "dark" | "system";

export function AppTheme() {
  const { theme, setTheme } = useTheme();

  return (
    <ToggleGroup
      variant="outline"
      size="sm"
      type="single"
      value={theme}
      onValueChange={(v) => setTheme(v as Theme)}
    >
      <ToggleGroupItem value="system" aria-label="System theme">
        <Monitor size={16} />
      </ToggleGroupItem>
      <ToggleGroupItem value="light" aria-label="Light theme">
        <Sun size={16} />
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" aria-label="Dark theme">
        <Moon size={16} />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
