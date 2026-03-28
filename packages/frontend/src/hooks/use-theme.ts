import { useEffect, useState } from "react";
import z from "zod";

const MEDIA_QUERY = "(prefers-color-scheme: dark)";

const schema = z.literal(["light", "dark", "system"]);

type Theme = z.output<typeof schema>;

const LocalStorageKey = "finviz-assignment-theme";

function getInitialTheme(): Theme {
  const storedRaw = localStorage.getItem(LocalStorageKey);
  const stored = schema.safeParse(storedRaw);

  if (stored.success) {
    return stored.data;
  }

  return "system";
}

function applyTheme(theme: Theme): void {
  if (theme === "system") {
    const prefersDark = window.matchMedia(MEDIA_QUERY).matches;
    document.documentElement.classList.toggle("dark", prefersDark);
  } else {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }

  localStorage.setItem(LocalStorageKey, theme);
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);

    if (theme !== "system") {
      return;
    }

    const ab = new AbortController();
    const mq = window.matchMedia(MEDIA_QUERY);

    mq.addEventListener("change", () => applyTheme("system"), { signal: ab.signal });

    return () => {
      ab.abort();
    };
  }, [theme]);

  return { theme, setTheme };
}
