import { useTheme } from "@/context/theme-context";

export const getBarColor = (rpmPercent: number) => {
    const { colors } = useTheme()
    if (rpmPercent < 75) return colors.green;
    if (rpmPercent <= 85) return colors.yellow;
    return colors.red;
};