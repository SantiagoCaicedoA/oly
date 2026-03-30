import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { olyPalette, olyColors } from "@/src/oly-theme/oly-colors";
import { olyTypography, olyFonts } from "@/src/oly-theme/oly-typography";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";

/* ── Context ───────────────────────────────────────────── */

interface ToastContextType {
  showSuccess: (message: string, title?: string, duration?: number) => void;
  showError: (message: string, title?: string, duration?: number) => void;
  showInfo: (message: string, title?: string, duration?: number) => void;
  showWarning: (message: string, title?: string, duration?: number) => void;
  showToast: (message: string, type: "success" | "error" | "info" | "warning") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

/* ── Toast accent colors ───────────────────────────────── */

const TOAST_ACCENTS = {
  success: olyPalette.green,
  error: olyPalette.red,
  info: olyPalette.primary,
  warning: olyPalette.orange,
} as const;

const TOAST_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  success: "checkmark-circle",
  error: "alert-circle",
  info: "information-circle",
  warning: "warning",
};

/* ── Progress Bar ──────────────────────────────────────── */

const ProgressBar: React.FC<{ duration: number; color: string }> = ({
  duration,
  color,
}) => {
  const [progress] = useState(new Animated.Value(1));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 0,
      duration,
      useNativeDriver: false,
    }).start();
  }, [duration, progress]);

  return (
    <View style={styles.progressTrack}>
      <Animated.View
        style={[
          styles.progressFill,
          {
            backgroundColor: color,
            width: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          },
        ]}
      />
    </View>
  );
};

/* ── Custom Toast Component ────────────────────────────── */

const OlyToast = (props: any) => {
  const { text1, text2, visibilityTime, toastType = "info" } = props;
  const accent = TOAST_ACCENTS[toastType as keyof typeof TOAST_ACCENTS] || TOAST_ACCENTS.info;
  const icon = TOAST_ICONS[toastType] || TOAST_ICONS.info;
  const duration = visibilityTime || 4000;

  return (
    <View style={styles.toastOuter}>
      <View style={styles.toastContainer}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: `${accent}20` }]}>
          <Ionicons name={icon} size={20} color={accent} />
        </View>

        {/* Text */}
        <View style={styles.textContainer}>
          {text1 ? <Text style={styles.title}>{text1}</Text> : null}
          {text2 ? (
            <Text style={styles.message} numberOfLines={3}>
              {text2}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Progress bar */}
      <ProgressBar duration={duration} color={accent} />
    </View>
  );
};

/* ── Provider ──────────────────────────────────────────── */

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const showSuccess = (
    message: string,
    title: string = "Success",
    duration: number = 4000,
  ) => {
    Toast.show({
      type: "success",
      text1: title,
      text2: message,
      visibilityTime: duration,
      autoHide: true,
    });
  };

  const showError = (
    message: string,
    title: string = "Error",
    duration: number = 5000,
  ) => {
    Toast.show({
      type: "error",
      text1: title,
      text2: message,
      visibilityTime: duration,
      autoHide: true,
    });
  };

  const showInfo = (
    message: string,
    title: string = "Info",
    duration: number = 4000,
  ) => {
    Toast.show({
      type: "info",
      text1: title,
      text2: message,
      visibilityTime: duration,
      autoHide: true,
    });
  };

  const showWarning = (
    message: string,
    title: string = "Warning",
    duration: number = 4000,
  ) => {
    Toast.show({
      type: "warning",
      text1: title,
      text2: message,
      visibilityTime: duration,
      autoHide: true,
    });
  };

  const showToast = (
    message: string,
    type: "success" | "error" | "info" | "warning",
  ) => {
    const titles = { success: "Success", error: "Error", info: "Info", warning: "Warning" };
    Toast.show({
      type,
      text1: titles[type],
      text2: message,
      visibilityTime: type === "error" ? 5000 : 4000,
      autoHide: true,
    });
  };

  const toastConfig = {
    success: (props: any) => <OlyToast {...props} toastType="success" />,
    error: (props: any) => <OlyToast {...props} toastType="error" />,
    info: (props: any) => <OlyToast {...props} toastType="info" />,
    warning: (props: any) => <OlyToast {...props} toastType="warning" />,
  };

  const contextValue: ToastContextType = {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <Toast config={toastConfig} topOffset={olyLayout.gymTouchTarget} />
    </ToastContext.Provider>
  );
};

/* ── Styles ────────────────────────────────────────────── */

const styles = StyleSheet.create({
  toastOuter: {
    width: "90%",
    alignSelf: "center",
    borderRadius: olyRadius.lg,
    backgroundColor: olyPalette.card,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    overflow: "hidden",
  },
  toastContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: olySpacing[16],
    paddingVertical: olySpacing[12],
    gap: olySpacing[12],
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: olyRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  message: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    marginTop: 2,
  },
  progressTrack: {
    height: 3,
    backgroundColor: olyPalette.cardElevated,
  },
  progressFill: {
    height: "100%",
  },
});
