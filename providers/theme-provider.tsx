"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";
import { applyTheme, THEME_CONFIG } from "@/lib/theme-utils";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  React.useEffect(() => {
    applyTheme();
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={THEME_CONFIG.DEFAULT_MODE}
      forcedTheme={undefined}
      storageKey={THEME_CONFIG.MODE_STORAGE_KEY}
      disableTransitionOnChange
      enableSystem={false}
      themes={["light", "dark"]}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
