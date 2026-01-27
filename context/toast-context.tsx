import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Animated, View } from "react-native";
import Toast, {
  ErrorToast,
  InfoToast,
  SuccessToast,
} from "react-native-toast-message";
import { useTheme } from "./theme-context";

interface ToastContextType {
  showSuccess: (message: string, title?: string, duration?: number) => void;
  showError: (message: string, title?: string, duration?: number) => void;
  showInfo: (message: string, title?: string, duration?: number) => void;
  showWarning: (message: string, title?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const ProgressBar: React.FC<{ duration: number; color: string }> = ({
  duration,
  color,
}) => {
  const [progress] = useState(new Animated.Value(1));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 0,
      duration: duration,
      useNativeDriver: false,
    }).start();
  }, [duration, progress]);

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: "rgba(0,0,0,0.1)",
      }}
    >
      <Animated.View
        style={{
          height: "100%",
          backgroundColor: color,
          width: progress.interpolate({
            inputRange: [0, 1],
            outputRange: ["0%", "100%"],
          }),
        }}
      />
    </View>
  );
};

const CustomSuccessToast = (props: any) => {
  const duration = props.visibilityTime || 4000;
  return (
    <View style={{ position: "relative" }}>
      <SuccessToast {...props} />
      <ProgressBar duration={duration} color="#4CAF50" />
    </View>
  );
};

const CustomErrorToast = (props: any) => {
  const duration = props.visibilityTime || 5000;
  return (
    <View style={{ position: "relative" }}>
      <ErrorToast {...props} />
      <ProgressBar duration={duration} color="#F44336" />
    </View>
  );
};

const CustomInfoToast = (props: any) => {
  const duration = props.visibilityTime || 4000;
  return (
    <View style={{ position: "relative" }}>
      <InfoToast {...props} />
      <ProgressBar duration={duration} color="#2196F3" />
    </View>
  );
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const { colors } = useTheme();

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

  const toastConfig = {
    success: (props: any) => (
      <CustomSuccessToast
        {...props}
        style={{
          borderLeftColor: colors.success || "#4CAF50",
          backgroundColor:
            colors.background === "#15202a" ? "#15202a" : "#ffffff",
          height: undefined,
          minHeight: 60,
        }}
        contentContainerStyle={{
          backgroundColor:
            colors.background === "#15202a" ? "#1a1a1a" : "#ffffff",
          paddingVertical: 12,
        }}
        text1Style={{
          color: colors.text,
          fontSize: 16,
          fontWeight: "600",
          numberOfLines: 0,
        }}
        text2Style={{
          color: colors.textSecondary,
          fontSize: 12,
          numberOfLines: 0,
        }}
      />
    ),
    error: (props: any) => (
      <CustomErrorToast
        {...props}
        style={{
          borderLeftColor: colors.error || "#F44336",
          backgroundColor:
            colors.background === "#15202a" ? "#15202a" : "#ffffff",
          height: undefined,
          minHeight: 60,
        }}
        contentContainerStyle={{
          backgroundColor:
            colors.background === "#15202a" ? "#1a1a1a" : "#ffffff",
          paddingVertical: 12,
        }}
        text1Style={{
          color: colors.text,
          fontSize: 16,
          fontWeight: "600",
          numberOfLines: 0,
        }}
        text2Style={{
          color: colors.textSecondary,
          fontSize: 12,
          numberOfLines: 0,
        }}
        text1NumberOfLines={0}
        text2NumberOfLines={0}
      />
    ),
    info: (props: any) => (
      <CustomInfoToast
        {...props}
        style={{
          borderLeftColor: colors.primary || "#2196F3",
          backgroundColor:
            colors.background === "#0f1722" ? "#1a1a1a" : "#ffffff",
          height: undefined,
          minHeight: 60,
        }}
        contentContainerStyle={{
          backgroundColor:
            colors.background === "#0f1722" ? "#1a1a1a" : "#ffffff",
          paddingVertical: 12,
        }}
        text1Style={{
          color: colors.text,
          fontSize: 16,
          fontWeight: "600",
          numberOfLines: 0,
        }}
        text2Style={{
          color: colors.textSecondary,
          fontSize: 12,
          numberOfLines: 0,
        }}
        text1NumberOfLines={0}
        text2NumberOfLines={0}
      />
    ),
    warning: (props: any) => (
      <CustomErrorToast
        {...props}
        style={{
          borderLeftColor: "#FF9800",
          backgroundColor:
            colors.background === "#0f1722" ? "#1a1a1a" : "#ffffff",
        }}
        contentContainerStyle={{
          backgroundColor:
            colors.background === "#0f1722" ? "#1a1a1a" : "#ffffff",
        }}
        text1Style={{
          color: colors.text,
          fontSize: 16,
          fontWeight: "600",
        }}
        text2Style={{
          color: colors.textSecondary,
          fontSize: 12,
        }}
      />
    ),
  };

  const contextValue: ToastContextType = {
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <Toast config={toastConfig} />
    </ToastContext.Provider>
  );
};
