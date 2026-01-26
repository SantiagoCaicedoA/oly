import { ThemeContextType, ThemeProviderProps } from "@/types";
import React, { createContext, useContext } from "react";
import { useColorScheme } from "react-native";

export const COLORS = {
  light: {
    background: "#15202a",
    primary: "#004aad",
    secondary: "#123058",
    text: "#e2e8f0",
    textSecondary: "#8f969f",
    surface: "#1a2533",
    success: "#4CAF50",
    error: "#F44336",
    warning: "#FF9800",
    info: "#2196F3",
  },
  dark: {
    background: "#15202a",
    primary: "#004aad",
    secondary: "#123058",
    text: "#e2e8f0",
    textSecondary: "#8f969f",
    surface: "#1a2533",
    success: "#4CAF50",
    error: "#F44336",
    warning: "#FF9800",
    info: "#2196F3",
  },
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
