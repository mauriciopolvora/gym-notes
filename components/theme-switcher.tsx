"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  applyTheme,
  PALETTES,
  type Palette,
  THEME_CONFIG,
} from "@/lib/theme-utils";
import { cn } from "@/lib/utils";

const MODES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

export function ModeToggle() {
  const { resolvedTheme, setTheme: setMode } = useTheme();
  const [_mounted, setMounted] = React.useState(false);
  const [palette, setPalette] = React.useState<Palette>(
    THEME_CONFIG.DEFAULT_PALETTE,
  );

  React.useEffect(() => {
    setMounted(true);
    // Load palette from storage on mount
    const stored = localStorage.getItem(THEME_CONFIG.PALETTE_STORAGE_KEY);
    if (stored && PALETTES.some((p) => p.value === stored)) {
      setPalette(stored as Palette);
    }
  }, []);

  const handlePaletteChange = (newPalette: Palette) => {
    setPalette(newPalette);
    localStorage.setItem(THEME_CONFIG.PALETTE_STORAGE_KEY, newPalette);
    applyTheme();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <div className="px-2 py-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Mode
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {MODES.map((mode) => {
              const Icon = mode.icon;
              const isActive = resolvedTheme === mode.value;
              return (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => setMode(mode.value)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-muted/40 text-foreground hover:border-muted-foreground/50",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Palettes
        </DropdownMenuLabel>
        {PALETTES.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => handlePaletteChange(option.value)}
            className={cn(
              "cursor-pointer capitalize",
              palette === option.value && "font-semibold text-primary",
            )}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
