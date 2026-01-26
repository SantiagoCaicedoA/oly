import { StyleSheet } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

export const Typography = {
    fontSize: {
        xs: moderateScale(10),
        sm: moderateScale(13),
        base: moderateScale(12),
        md: moderateScale(14),
        lg: moderateScale(16),
        xl: moderateScale(20),
        "2xl": moderateScale(24),

    },

    fontWeight: {
        light: "300" as const,
        normal: "400" as const,
        medium: "500" as const,
        semibold: "600" as const,
        bold: "700" as const,
        extrabold: "800" as const,
    },

    fontFamily: {
        regular: 'Ubuntu-Regular',
        medium: 'Ubuntu-Medium',
        semibold: 'Ubuntu-Medium',
        bold: 'Ubuntu-Bold',
    },

    lineHeight: {
        tight: moderateScale(16),
        normal: moderateScale(20),
        relaxed: moderateScale(24),
        loose: moderateScale(32),
    },

    letterSpacing: {
        tight: -0.5,
        normal: 0,
        wide: 0.5,
        wider: 1,
        widest: 2,
    },
};

export const Spacing = {
    // Horizontal Spacing (width-based)
    horizontal: {
        xs: scale(4),
        sm: scale(8),
        md: scale(12),
        lg: scale(16),
        xl: scale(20),
        "2xl": scale(24),
        "3xl": scale(32),
        "4xl": scale(40),
        "5xl": scale(48),
        "6xl": scale(64),
        "7xl": scale(80),
        "8xl": scale(96),
        "9xl": scale(128),
    },

    // Vertical Spacing (height-based)
    vertical: {
        xs: verticalScale(4),
        sm: verticalScale(8),
        md: verticalScale(12),
        lg: verticalScale(16),
        xl: verticalScale(20),
        "2xl": verticalScale(24),
        "3xl": verticalScale(32),
        "4xl": verticalScale(40),
        "5xl": verticalScale(48),
        "6xl": verticalScale(64),
        "7xl": verticalScale(80),
        "8xl": verticalScale(96),
        "9xl": verticalScale(128),
    },

    // Padding
    padding: {
        xs: moderateScale(4),
        sm: moderateScale(8),
        md: moderateScale(12),
        lg: moderateScale(16),
        xl: moderateScale(20),
        "2xl": moderateScale(24),
        "3xl": moderateScale(32),
        "4xl": moderateScale(40),
        "5xl": moderateScale(48),
    },

    // Margin
    margin: {
        xs: moderateScale(4),
        sm: moderateScale(8),
        md: moderateScale(12),
        lg: moderateScale(16),
        xl: moderateScale(20),
        "2xl": moderateScale(24),
        "3xl": moderateScale(32),
        "4xl": moderateScale(40),
        "5xl": moderateScale(48),
    },
};

// Border Radius
export const BorderRadius = {
    none: 0,
    xs: moderateScale(2),
    sm: moderateScale(4),
    md: moderateScale(6),
    lg: moderateScale(8),
    xl: moderateScale(12),
    "2xl": moderateScale(16),
    "3xl": moderateScale(24),
    full: 9999,
};

// Pre-defined Text Styles
export const TextStyles = StyleSheet.create({
    h1: {
        fontSize: Typography.fontSize["2xl"],
        fontFamily: Typography.fontFamily.bold,
        lineHeight: Typography.lineHeight.relaxed,
        letterSpacing: Typography.letterSpacing.normal,
    },
    h2: {
        fontSize: Typography.fontSize.lg,
        fontFamily: Typography.fontFamily.medium,
        lineHeight: Typography.lineHeight.normal,
        letterSpacing: Typography.letterSpacing.normal,
    },
    h3: {
        fontSize: Typography.fontSize.md,
        fontFamily: Typography.fontFamily.bold,
        lineHeight: Typography.lineHeight.normal,
        letterSpacing: Typography.letterSpacing.normal,
    },
    h4: {
        fontSize: Typography.fontSize.lg,
        fontFamily: Typography.fontFamily.semibold,
        lineHeight: Typography.lineHeight.normal,
    },
    h5: {
        fontSize: Typography.fontSize.md,
        fontFamily: Typography.fontFamily.medium,
        lineHeight: Typography.lineHeight.normal,
    },
    h6: {
        fontSize: Typography.fontSize.base,
        fontFamily: Typography.fontFamily.medium,
        lineHeight: Typography.lineHeight.normal,
    },
    body: {
        fontSize: Typography.fontSize.base,
        fontFamily: Typography.fontFamily.regular,
        lineHeight: Typography.lineHeight.normal,
    },
    bodyLarge: {
        fontSize: Typography.fontSize.lg,
        fontFamily: Typography.fontFamily.regular,
        lineHeight: Typography.lineHeight.normal,
    },
    bodySmall: {
        fontSize: Typography.fontSize.sm,
        fontFamily: Typography.fontFamily.regular,
        lineHeight: Typography.lineHeight.tight,
    },
    label: {
        fontSize: Typography.fontSize.sm,
        fontFamily: Typography.fontFamily.medium,
        lineHeight: Typography.lineHeight.tight,
    },
    labelLarge: {
        fontSize: Typography.fontSize.base,
        fontFamily: Typography.fontFamily.medium,
        lineHeight: Typography.lineHeight.normal,
    },
    caption: {
        fontSize: Typography.fontSize.xs,
        fontFamily: Typography.fontFamily.regular,
        lineHeight: Typography.lineHeight.tight,
    },
    button: {
        fontSize: Typography.fontSize.base,
        fontFamily: Typography.fontFamily.semibold,
        lineHeight: Typography.lineHeight.normal,
    },
    buttonLarge: {
        fontSize: Typography.fontSize.lg,
        fontFamily: Typography.fontFamily.semibold,
        lineHeight: Typography.lineHeight.normal,
    },
    buttonSmall: {
        fontSize: Typography.fontSize.sm,
        fontFamily: Typography.fontFamily.medium,
        lineHeight: Typography.lineHeight.tight,
    },
});

// Layout Styles
export const LayoutStyles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: Spacing.horizontal.lg,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: BorderRadius.lg,
        padding: Spacing.padding.lg,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    button: {
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.vertical.md,
        paddingHorizontal: Spacing.horizontal.lg,
        alignItems: "center",
        justifyContent: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#E5E5E7",
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.vertical.md,
        paddingHorizontal: Spacing.horizontal.md,
        fontSize: Typography.fontSize.base,
        fontFamily: Typography.fontFamily.regular,
    },
    row: {
        flexDirection: "row",
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    rowCenter: {
        flexDirection: "row",
        alignItems: "center",
    },
    column: {
        flexDirection: "column",
    },
    columnCenter: {
        flexDirection: "column",
        alignItems: "center",
    },
});

// Shadow Styles
export const ShadowStyles = StyleSheet.create({
    small: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
    },
    medium: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    large: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    card: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modal: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 8,
    },
});

// Common Component Styles
export const ComponentStyles = StyleSheet.create({
    // Card Component
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: BorderRadius.lg,
        padding: Spacing.padding.lg,
        ...ShadowStyles.card,
    },

    // Button Component
    primaryButton: {
        backgroundColor: "#007AFF",
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.vertical.md,
        paddingHorizontal: Spacing.horizontal.lg,
        alignItems: "center",
        justifyContent: "center",
    },

    secondaryButton: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#007AFF",
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.vertical.md,
        paddingHorizontal: Spacing.horizontal.lg,
        alignItems: "center",
        justifyContent: "center",
    },

    // Input Component
    input: {
        borderWidth: 1,
        borderColor: "#E5E5E7",
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.vertical.md,
        paddingHorizontal: Spacing.horizontal.md,
        fontSize: Typography.fontSize.base,
        fontFamily: Typography.fontFamily.regular,
        backgroundColor: "#FFFFFF",
    },

    // Container Components
    screenContainer: {
        flex: 1,
        backgroundColor: "#F2F2F7",
        paddingHorizontal: Spacing.horizontal.lg,
    },

    contentContainer: {
        flex: 1,
        paddingVertical: Spacing.vertical.lg,
    },

    // Header Components
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: Spacing.vertical.md,
        paddingHorizontal: Spacing.horizontal.lg,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E7",
    },

    // List Components
    listItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: Spacing.vertical.md,
        paddingHorizontal: Spacing.horizontal.lg,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F2F2F7",
    },

    // Modal Components
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },

    modalContent: {
        backgroundColor: "#FFFFFF",
        borderRadius: BorderRadius.lg,
        padding: Spacing.padding.xl,
        marginHorizontal: Spacing.horizontal.lg,
        maxWidth: "90%",
        ...ShadowStyles.modal,
    },

    // Loading Components
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F2F2F7",
    },

    // Error Components
    errorContainer: {
        backgroundColor: "#FFEBEE",
        borderColor: "#F44336",
        borderWidth: 1,
        borderRadius: BorderRadius.md,
        padding: Spacing.padding.md,
        marginVertical: Spacing.vertical.sm,
    },

    // Success Components
    successContainer: {
        backgroundColor: "#E8F5E8",
        borderColor: "#4CAF50",
        borderWidth: 1,
        borderRadius: BorderRadius.md,
        padding: Spacing.padding.md,
        marginVertical: Spacing.vertical.sm,
    },
});

// Common Text Styles
export const CommonTextStyles = StyleSheet.create({
    // Headers
    h1: {
        fontSize: Typography.fontSize["2xl"],
        fontFamily: Typography.fontFamily.bold,
        lineHeight: Typography.lineHeight.relaxed,
    },

    h2: {
        fontSize: Typography.fontSize["2xl"],
        fontFamily: Typography.fontFamily.bold,
        lineHeight: Typography.lineHeight.normal,
    },

    h3: {
        fontSize: Typography.fontSize.xl,
        fontFamily: Typography.fontFamily.semibold,
        lineHeight: Typography.lineHeight.normal,
    },

    // Body Text
    body: {
        fontSize: Typography.fontSize.base,
        fontFamily: Typography.fontFamily.regular,
        lineHeight: Typography.lineHeight.normal,
    },

    bodyLarge: {
        fontSize: Typography.fontSize.lg,
        fontFamily: Typography.fontFamily.regular,
        lineHeight: Typography.lineHeight.normal,
    },

    // Labels
    label: {
        fontSize: Typography.fontSize.sm,
        fontFamily: Typography.fontFamily.medium,
        lineHeight: Typography.lineHeight.tight,
    },

    // Captions
    caption: {
        fontSize: Typography.fontSize.xs,
        fontFamily: Typography.fontFamily.regular,
        lineHeight: Typography.lineHeight.tight,
    },

    // Button Text
    buttonText: {
        fontSize: Typography.fontSize.base,
        fontFamily: Typography.fontFamily.semibold,
        textAlign: "center",
    },

    buttonTextLarge: {
        fontSize: Typography.fontSize.lg,
        fontFamily: Typography.fontFamily.semibold,
        textAlign: "center",
    },
});

// Common Layout Styles
export const CommonLayoutStyles = StyleSheet.create({
    // Flex Layouts
    row: {
        flexDirection: "row",
    },

    column: {
        flexDirection: "column",
    },

    rowCenter: {
        flexDirection: "row",
        alignItems: "center",
    },

    columnCenter: {
        flexDirection: "column",
        alignItems: "center",
    },

    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    rowAround: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },

    // Alignment
    center: {
        justifyContent: "center",
        alignItems: "center",
    },

    centerVertical: {
        justifyContent: "center",
    },

    centerHorizontal: {
        alignItems: "center",
    },

    // Positioning
    absolute: {
        position: "absolute",
    },

    absoluteFill: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});

export const DesignSystem = {
    Typography,
    Spacing,
    BorderRadius,
    TextStyles,
    LayoutStyles,
    ShadowStyles,
    ComponentStyles,
    CommonTextStyles,
    CommonLayoutStyles,
};

export default DesignSystem;
