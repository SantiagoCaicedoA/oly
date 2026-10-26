/**
 * Styles every auth and onboarding screen shares: the title block, the
 * small caps section label, the selected option state and the BACK/NEXT row.
 */
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts, olyTypography } from "@/src/oly-theme/oly-typography";
import { StyleSheet } from "react-native";

export const onboardingStyles = StyleSheet.create({
  titleBlock: { marginBottom: olySpacing[20] },
  title: {
    ...olyTypography.title1,
    fontFamily: olyFonts.bold,
    color: olyColors.text.primary,
  },
  subtitle: {
    ...olyTypography.body,
    color: olyColors.text.secondary,
    marginTop: olySpacing[4],
  },
  sectionLabel: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: olySpacing[8],
  },
  /** A chosen pill, card or chip. Pair with a glass card + border base. */
  selected: {
    backgroundColor: olyColors.glass.accentFill,
    borderColor: olyColors.glass.accentBorder,
  },
  bottomButtons: {
    flexDirection: "row",
    gap: olySpacing[12],
    paddingTop: olySpacing[40],
    marginTop: "auto",
  },
  /** Full screen spinner while an upload or request runs. */
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: olyColors.glass.scrim,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
});
