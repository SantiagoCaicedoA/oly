import OlyLoader from "@/components/oly-loader";
import { useTheme } from "@/context/theme-context";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet } from "react-native";
import Animated, { FadeOut } from "react-native-reanimated";

/**
 * Full-screen branded loader shown when opening the main tabs
 * (Home / Workout / Rank / Analytics).
 *
 * Rules:
 * - always visible for at least MIN_MS (so one full flash is seen)
 * - never longer than CAP_MS...
 * - ...unless a screen reports real in-flight loading via begin()/end(),
 *   in which case it stays until the data actually arrives.
 *
 * Usage from a screen with a real fetch:
 *   const { begin, end } = useTabLoader();
 *   useEffect(() => { begin(); fetch().finally(end); }, []);
 */
const MIN_MS = 900;
const CAP_MS = 2000;

type TabLoaderApi = {
  /** Show the loader (called on tab press / initial open). */
  show: () => void;
  /** A screen started real loading work. */
  begin: () => void;
  /** That work finished. */
  end: () => void;
};

const TabLoaderContext = createContext<TabLoaderApi | undefined>(undefined);

export const useTabLoader = (): TabLoaderApi => {
  const ctx = useContext(TabLoaderContext);
  if (!ctx) throw new Error("useTabLoader must be used within TabLoaderProvider");
  return ctx;
};

export function TabLoaderProvider({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const shownAt = useRef(0);
  const pending = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const hide = useCallback(() => {
    clearTimers();
    setVisible(false);
  }, []);

  const tryHide = useCallback(() => {
    const elapsed = Date.now() - shownAt.current;
    if (pending.current > 0) return; // real work still in flight
    if (elapsed >= MIN_MS) {
      hide();
    } else {
      timers.current.push(setTimeout(tryHide, MIN_MS - elapsed));
    }
  }, [hide]);

  const show = useCallback(() => {
    clearTimers();
    shownAt.current = Date.now();
    setVisible(true);
    // minimum display, then hide if nothing is loading
    timers.current.push(setTimeout(tryHide, MIN_MS));
    // hard cap: never longer than CAP_MS unless real work is pending
    timers.current.push(
      setTimeout(() => {
        if (pending.current === 0) hide();
      }, CAP_MS)
    );
  }, [hide, tryHide]);

  const begin = useCallback(() => {
    pending.current += 1;
  }, []);

  const end = useCallback(() => {
    pending.current = Math.max(0, pending.current - 1);
    tryHide();
  }, [tryHide]);

  const api = useMemo(() => ({ show, begin, end }), [show, begin, end]);

  return (
    <TabLoaderContext.Provider value={api}>
      {children}
      {visible && (
        <Animated.View
          exiting={FadeOut.duration(350)}
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: colors.background,
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              elevation: 9999,
            },
          ]}
        >
          <OlyLoader />
        </Animated.View>
      )}
    </TabLoaderContext.Provider>
  );
}
