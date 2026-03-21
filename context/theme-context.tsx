/**
 * Theme Bridge
 *
 * This file bridges Abdul's existing useTheme() API with the new
 * oly-theme token system. Abdul's screens keep working via
 * `const { colors } = useTheme()` while new screens import
 * directly from `@/src/oly-theme`.
 *
 * Once all screens are migrated, the legacy `colors` object and
 * `ThemeColors` type can be removed.
 */

import { ThemeContextType, ThemeProviderProps } from "@/types";
import React, { createContext, useContext } from "react";
import { useColorScheme } from "react-native";
import { olyPalette, olyColors } from "@/src/oly-theme/oly-colors";

// ─── Legacy color map ────────────────────────────────────────────
// Maps Abdul's old `colors.X` keys to the new oly-theme tokens.
// This keeps every existing screen working without changes.
const LEGACY_COLORS = {
  background: "#0D1117", // was #15202a → now matches gradient base
  primary: olyPalette.primary, // #004AAD
  secondary: "#123058",
  text: olyColors.text.primary, // #E2E8F0
  textSecondary: olyColors.text.secondary, // rgba(226,232,240,0.6)
  surface: olyPalette.card, // #1A2533
  success: olyPalette.green, // #B4F077
  error: olyPalette.red, // #D24B4B (was #F44336)
  warning: olyPalette.yellow, // #FBBF24
  info: "#2196F3",
  lightBlue: "#0a274c",
  headerBackground: "transparent", // was #0d1924 → now transparent (gradient shows through)
  semiLightBlue: "#0a346c",
  green: olyPalette.green, // #B4F077
  yellow: olyPalette.yellow, // #FBBF24
  lightYellow: "#5e532f",
  red: olyPalette.red, // #D24B4B (was #FF0000)
} as const;

export const COLORS = {
  light: LEGACY_COLORS,
  dark: LEGACY_COLORS,
} as const;

export const CONSTANTS = {
  SPLASH_DURATION: 3000,
} as const;

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme || "light";
  const isDark = theme === "dark";
  const colors = COLORS[theme];

  return (
    <ThemeContext.Provider value={{ theme, isDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
