import React, {
  createContext,
  ReactNode,
  useContext,
} from "react";
import { StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { olyPalette, olyColors } from "@/src/oly-theme/oly-colors";
import { olyTypography, olyFonts } from "@/src/oly-theme/oly-typography";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { Glass } from "@/src/oly-components/shop/ShopKit";

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

/* ── Toast ─────────────────────────────────────────────────
 * The same glass pill as the olys chip in the home header and the
 * shop toast: one quiet line, a status dot, no icon disc and no
 * progress bar. A generic title ("Success", "Error") is noise, so
 * when the caller passes one the pill shows the message instead.
 */
const DOT = {
  success: olyPalette.green,
  error: olyPalette.redInk,
  info: olyPalette.primary,
  warning: olyPalette.yellow,
} as const;

const GENERIC_TITLES = new Set(["Success", "Error", "Info", "Warning"]);

const OlyToast = (props: any) => {
  const { text1, text2, toastType = "info" } = props;
  const dot = DOT[toastType as keyof typeof DOT] ?? DOT.info;
  const line =
    text1 && !GENERIC_TITLES.has(text1) ? text1 : text2 || text1 || "";

  return (
    <Glass radius={olyRadius.full} style={styles.pill}>
      <View style={[styles.dot, { backgroundColor: dot }]} />
      <Text style={styles.text} numberOfLines={2}>
        {line}
      </Text>
    </Glass>
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
  pill: {
    alignSelf: "center",
    maxWidth: "90%",
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[8],
    paddingHorizontal: olySpacing[16],
    paddingVertical: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: olyRadius.full,
  },
  text: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
    flexShrink: 1,
  },
});
