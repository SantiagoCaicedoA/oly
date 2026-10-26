/**
 * Shop kit — the glass pieces. Born on the Shop tab, now shared app-wide:
 * Glass and Glows sit behind every restyled screen.
 *
 * Glass is BlurView plus a faint ink gradient and a hairline, laid over the
 * soft blue Glows so the blur has something to frost. Every colour comes
 * from olyColors.glass, which is the ink and the primary at set opacities.
 */
import { Code, fmt, signed } from "@/src/oly-mock/wallet";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyGlow } from "@/src/oly-theme/oly-elevation";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts, olyTypography } from "@/src/oly-theme/oly-typography";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";

/* ─── Surfaces ───────────────────────────────────────────────────── */

export function Glass({
  children,
  radius = olyRadius.xl,
  style,
  colors = olyColors.glass.fill,
  borderColor = olyColors.glass.border,
}: {
  children?: React.ReactNode;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  colors?: readonly [string, string, ...string[]];
  borderColor?: string;
}) {
  return (
    <View style={[kit.glass, { borderRadius: radius, borderColor }, style]}>
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

/**
 * Soft blue light behind the glass. Render it as the FIRST child of the
 * screen root (outside the ScrollView): it fills the whole window, status
 * bar included, and stays still while the glass scrolls over it. Each spot
 * is a radial gradient that reaches zero opacity before its edge, and every
 * spot sits well inside the canvas, so no light is ever cut by a straight
 * line.
 */
export function Glows({
  variant = "shop",
}: {
  variant?: "shop" | "wallet" | "story";
}) {
  const { width, height } = useWindowDimensions();
  const r = width * 0.75;
  const spots =
    variant === "story"
      ? [
          { x: width * 0.62, y: height * 0.34, o: 0.6 },
          { x: 0, y: height * 0.92, o: 0.26 },
        ]
      : variant === "shop"
      ? [
          { x: width * 0.95, y: height * 0.2, o: 0.5 },
          { x: width * 0.05, y: height * 0.6, o: 0.18 },
          { x: width * 0.9, y: height * 0.95, o: 0.32 },
        ]
      : [
          { x: width * 0.6, y: height * 0.16, o: 0.45 },
          { x: width * 0.1, y: height * 0.7, o: 0.2 },
        ];
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height}>
        <Defs>
          {spots.map((s, i) => (
            <RadialGradient key={i} id={`glow${i}`} cx="50%" cy="50%" r="50%">
              <Stop
                offset="0"
                stopColor={olyColors.glass.glow}
                stopOpacity={s.o}
              />
              <Stop
                offset="0.45"
                stopColor={olyColors.glass.glow}
                stopOpacity={s.o * 0.45}
              />
              <Stop
                offset="1"
                stopColor={olyColors.glass.glow}
                stopOpacity={0}
              />
            </RadialGradient>
          ))}
        </Defs>
        {spots.map((s, i) => (
          <Circle key={i} cx={s.x} cy={s.y} r={r} fill={`url(#glow${i})`} />
        ))}
      </Svg>
    </View>
  );
}

export function GlowBar({ pct, height = 3 }: { pct: number; height?: number }) {
  return (
    <View style={[kit.track, { height }]}>
      <LinearGradient
        colors={olyColors.glass.progress}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          kit.trackFill,
          { width: `${Math.max(0, Math.min(1, pct)) * 100}%` },
        ]}
      />
    </View>
  );
}

export function Overline({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return <Text style={[kit.overline, style]}>{children}</Text>;
}

/** A number that counts to its new value instead of jumping. */
export function CountUp({
  value,
  style,
}: {
  value: number;
  style?: StyleProp<TextStyle>;
}) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = from.current;
    if (start === value) return;
    const t0 = Date.now();
    const dur = 700;
    let raf = 0;
    const tick = () => {
      const p = Math.min(1, (Date.now() - t0) / dur);
      const v = start + (value - start) * (1 - Math.pow(1 - p, 3));
      setShown(v);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <Text style={style} maxFontSizeMultiplier={1.2}>
      {fmt(shown)}
    </Text>
  );
}

/**
 * The "+120" that rises next to the balance when it changes, then fades.
 * Plays once per change (tracked by changeId), never sits on the card.
 */
let seenChange = 0;
export function DeltaFloat({ id, value }: { id: number; value: number }) {
  const t = useRef(new Animated.Value(0)).current;
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!value || id <= seenChange) return;
    seenChange = id;
    setShow(true);
    t.setValue(0);
    Animated.timing(t, {
      toValue: 1,
      duration: 2200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => setShow(false));
  }, [id, value, t]);
  if (!show) return null;
  const opacity = t.interpolate({
    inputRange: [0, 0.12, 0.7, 1],
    outputRange: [0, 1, 1, 0],
  });
  const translateY = t.interpolate({
    inputRange: [0, 1],
    outputRange: [8, -14],
  });
  return (
    <Animated.Text
      style={[
        kit.delta,
        value < 0 && kit.deltaOut,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      {signed(value)}
    </Animated.Text>
  );
}

/* ─── Reward ticket ──────────────────────────────────────────────── */

export function Ticket({
  c,
  onPress,
}: {
  c: Pick<Code, "value" | "note" | "code" | "fresh">;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [kit.ticket, pressed && kit.pressed]}
    >
      <LinearGradient
        colors={olyColors.glass.ticket}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: olyRadius.tile }]}
      />
      <View style={kit.ticketMain}>
        <View style={kit.ticketTitleRow}>
          <Text style={kit.ticketValue} numberOfLines={1}>
            {c.value}
          </Text>
          {c.fresh && (
            <View style={kit.newTag}>
              <Text style={kit.newTagText}>NEW</Text>
            </View>
          )}
        </View>
        <Text style={kit.caption} numberOfLines={1}>
          {c.note}
        </Text>
      </View>
      <View style={kit.ticketRule} />
      <View style={kit.ticketCode}>
        <Text style={kit.code}>{c.code}</Text>
      </View>
    </Pressable>
  );
}

/* ─── Bottom sheet ───────────────────────────────────────────────── */

/**
 * The one sheet look for the whole app (the shop sheet): a dark glass
 * gradient, a hairline border, floating SHEET_SIDE from the screen edges
 * over a blurred scrim. Sheets with their own layout (tall pickers,
 * @gorhom sheets) build from these pieces instead of styling their own.
 */
export const SHEET_SIDE = 8;

/** Blurred scrim behind a sheet or dialog. Tapping it closes. */
export function SheetBackdrop({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable style={kit.backdrop} onPress={onPress} accessibilityLabel="Close">
      <BlurView intensity={12} tint="dark" style={StyleSheet.absoluteFill} />
    </Pressable>
  );
}

/** The sheet's glass body. Position it with style. */
export function SheetSurface({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Glass radius={olyRadius.sheet} colors={olyColors.glass.sheet} style={style}>
      {children}
    </Glass>
  );
}

/** The grabber bar's shape, shared with the @gorhom sheets' handle. */
export const SHEET_GRABBER = {
  width: 36,
  height: 4,
  borderRadius: 2,
  backgroundColor: olyColors.glass.idle,
} as const;

export function SheetGrabber() {
  return <View style={kit.grabber} />;
}

export function Sheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const y = useRef(new Animated.Value(500)).current;
  useEffect(() => {
    if (open) {
      y.setValue(500);
      Animated.spring(y, {
        toValue: 0,
        damping: 22,
        stiffness: 220,
        mass: 0.9,
        useNativeDriver: true,
      }).start();
    }
  }, [open, y]);
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <SheetBackdrop onPress={onClose} />
      <Animated.View
        style={[
          kit.sheetWrap,
          {
            paddingBottom: Math.max(insets.bottom, 8),
            transform: [{ translateY: y }],
          },
        ]}
      >
        <SheetSurface style={kit.sheet}>
          <SheetGrabber />
          {children}
        </SheetSurface>
      </Animated.View>
    </Modal>
  );
}

export function PrimaryButton({
  label,
  onPress,
  style,
}: {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        kit.primary,
        pressed && kit.primaryPressed,
        style,
      ]}
    >
      <Text style={kit.primaryText}>{label}</Text>
    </Pressable>
  );
}

export function GlassButton({
  label,
  onPress,
  style,
}: {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && kit.pressed, style]}
    >
      <Glass radius={olyRadius.full} style={kit.glassBtn}>
        <Text style={kit.glassBtnText}>{label}</Text>
      </Glass>
    </Pressable>
  );
}

/** Glass segmented control: one pill per option, the active one lifted. */
export function GlassTabs<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Glass radius={olyRadius.full} style={[kit.tabs, style]}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            hitSlop={{ top: 4, bottom: 4 }}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={[kit.tab, on && kit.tabOn]}
          >
            <Text style={[kit.tabText, on && kit.tabTextOn]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </Glass>
  );
}

export function QuietButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [kit.quiet, pressed && kit.pressed]}
    >
      <Text style={kit.quietText}>{label}</Text>
    </Pressable>
  );
}

/* ─── Toast ──────────────────────────────────────────────────────── */

let toastMsg = "";
let toastId = 0;
const toastListeners = new Set<() => void>();
export function showToast(msg: string) {
  toastMsg = msg;
  toastId++;
  toastListeners.forEach((l) => l());
}

/** Mount once per screen, last in the tree. */
export function ToastHost() {
  const id = useSyncExternalStore(
    (l) => {
      toastListeners.add(l);
      return () => toastListeners.delete(l);
    },
    () => toastId,
  );
  const insets = useSafeAreaInsets();
  const o = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!id) return;
    o.setValue(0);
    Animated.sequence([
      Animated.timing(o, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.delay(1400),
      Animated.timing(o, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [id, o]);
  if (!id) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[kit.toastWrap, { top: insets.top + 8, opacity: o }]}
    >
      <Glass radius={olyRadius.full} style={kit.toast}>
        <Text style={kit.toastText}>{toastMsg}</Text>
      </Glass>
    </Animated.View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────── */

export const kit = StyleSheet.create({
  glass: { overflow: "hidden", borderWidth: 1 },
  pressed: { opacity: 0.8 },
  track: {
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.rule,
    overflow: "hidden",
  },
  trackFill: { height: "100%", borderRadius: olyRadius.full },
  overline: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    letterSpacing: 1,
    color: olyColors.text.secondary,
  },
  caption: { ...olyTypography.caption, color: olyColors.text.secondary },

  ticket: {
    flexDirection: "row",
    borderRadius: olyRadius.tile,
    borderWidth: 1,
    borderColor: olyColors.glass.ticketBorder,
    overflow: "hidden",
  },
  ticketMain: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: olySpacing[16],
    paddingVertical: 14,
    gap: 2,
  },
  ticketTitleRow: { flexDirection: "row", alignItems: "center", gap: olySpacing[8] },
  ticketValue: {
    ...olyTypography.body,
    fontSize: 18,
    lineHeight: 22,
    fontFamily: olyFonts.bold,
    color: olyColors.text.primary,
  },
  newTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.accentFill,
  },
  newTagText: {
    ...olyTypography.caption,
    fontSize: 10,
    lineHeight: 12,
    fontFamily: olyFonts.bold,
    color: olyColors.text.primary,
  },
  ticketRule: {
    width: 1,
    marginVertical: olySpacing[12],
    borderLeftWidth: 1,
    borderStyle: "dashed",
    borderColor: olyColors.glass.dash,
  },
  ticketCode: {
    width: 108,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: olySpacing[8],
  },
  code: {
    ...olyTypography.caption,
    fontSize: 13,
    fontFamily: olyFonts.bold,
    letterSpacing: 1,
    color: olyColors.text.primary,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: olyColors.glass.scrim,
  },
  sheetWrap: { position: "absolute", left: SHEET_SIDE, right: SHEET_SIDE, bottom: 0 },
  sheet: {
    paddingHorizontal: olySpacing[24],
    paddingTop: olySpacing[12],
    paddingBottom: olySpacing[16],
    alignItems: "stretch",
  },
  grabber: {
    ...SHEET_GRABBER,
    alignSelf: "center",
    marginBottom: olySpacing[24],
  },

  primary: {
    height: 52,
    borderRadius: olyRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: olyColors.button.primary.bg,
    ...olyGlow.lg,
  },
  primaryPressed: { backgroundColor: olyColors.button.primary.pressed },
  primaryText: { ...olyTypography.button, color: olyColors.text.onAccent },
  glassBtn: { height: 52, alignItems: "center", justifyContent: "center" },
  glassBtnText: { ...olyTypography.button, color: olyColors.text.primary },
  tabs: { flexDirection: "row", gap: olySpacing[4], padding: olySpacing[4] },
  tab: {
    flex: 1,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: olyRadius.full,
  },
  tabOn: {
    backgroundColor: olyColors.glass.selected,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
  },
  tabText: { ...olyTypography.label, color: olyColors.text.secondary },
  tabTextOn: { color: olyColors.text.primary },
  quiet: {
    height: olyLayout.minTouchTarget,
    marginTop: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  quietText: {
    ...olyTypography.body,
    fontSize: 15,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
  },

  delta: {
    ...olyTypography.label,
    fontFamily: olyFonts.bold,
    color: olyColors.text.primary,
    textShadowColor: olyColors.glass.glow,
    textShadowRadius: 12,
    marginLeft: olySpacing[4],
  },
  deltaOut: { color: olyColors.text.secondary, textShadowRadius: 0 },

  toastWrap: { position: "absolute", alignSelf: "center", zIndex: 50 },
  toast: { paddingHorizontal: olySpacing[16], paddingVertical: 10 },
  toastText: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
});
