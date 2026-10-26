import OlyLoader, { HOLD_MS, SWEEP_MS } from "@/components/oly-loader";
import { olyPalette } from "@/src/oly-theme/oly-colors";
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
 * - always visible for at least one full sweep of the shine
 * - it only ever fades out between sweeps, never with the shine halfway
 *   across the logo
 * - never longer than CAP_MS (snapped to the end of a sweep)...
 * - ...unless a screen reports real in-flight loading via begin()/end(),
 *   in which case it stays until the data actually arrives.
 *
 * Usage from a screen with a real fetch:
 *   const { begin, end } = useTabLoader();
 *   useEffect(() => { begin(); fetch().finally(end); }, []);
 */
const MIN_MS = SWEEP_MS;
const CAP_MS = 2400;
const CYCLE_MS = SWEEP_MS + HOLD_MS;

/** How long until the shine currently crossing the logo has left it. */
const untilSweepEnds = (elapsed: number) => {
  const p = elapsed % CYCLE_MS;
  return p < SWEEP_MS ? SWEEP_MS - p : 0;
};

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
    const wait = elapsed < MIN_MS ? MIN_MS - elapsed : untilSweepEnds(elapsed);
    if (wait <= 0) {
      hide();
    } else {
      timers.current.push(setTimeout(tryHide, wait));
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
        if (pending.current === 0) tryHide();
      }, CAP_MS)
    );
  }, [tryHide]);

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
        <Animated.View exiting={FadeOut.duration(350)} style={styles.overlay}>
          <OlyLoader />
        </Animated.View>
      )}
    </TabLoaderContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: olyPalette.background,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    elevation: 9999,
  },
});
