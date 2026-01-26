export type Theme = "light" | "dark";

export interface ThemeColors {
    background: string;
    text: string;
    textSecondary: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    primary: string;
    surface: string;
    lightBlue: string,
}

export interface ThemeContextType {
    theme: Theme;
    isDark: boolean;
    colors: ThemeColors;
}

export interface ThemeProviderProps {
    children: React.ReactNode;
}

export interface SizeConstants {
    SPLASH_DURATION: number;
}
