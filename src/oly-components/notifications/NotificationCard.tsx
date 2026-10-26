/**
 * NotificationCard — one row of the notifications screen.
 *
 * Design "C. Glass cards with filters" on the canvas. Three columns and one
 * rule: the left holds the picture (a person, a lift, a badge, a coin), the
 * middle holds the words, and the right edge holds ONLY the time, so every
 * time lines up down the list no matter what the card shows.
 *
 * Unread cards get the blue edge and a bright time. Read ones go quiet.
 */
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Polygon, Text as SvgText } from "react-native-svg";
import { Glass, kit } from "@/src/oly-components/shop/ShopKit";
import { OlyCoin } from "@/src/oly-components/olys/OlyCoin";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts, olyTypography } from "@/src/oly-theme/oly-typography";
import type { OlyNotification } from "@/types/api/notifications";

const LEAD = 44;

/* ── Reading the row ─────────────────────────────────────────── */

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
/** The backend does not send rank or weight in `data` yet, so fall back to the text. */
const rankOf = (n: OlyNotification) => num(n.data?.rank) ?? Number((`${n.title} ${n.body}`.match(/#(\d+)/) ?? [])[1] ?? NaN);
const kgOf = (n: OlyNotification) => num(n.data?.kg) ?? Number((n.body.match(/(\d+(?:\.\d+)?)\s?kg/i) ?? [])[1] ?? NaN);

export const actorName = (n: OlyNotification) =>
  n.actor?.profile?.display_name || n.actor?.name || n.actor?.username || "";

const initials = (name: string) =>
  name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

/** The bold line and the quiet line. The backend's titles are generic ("New like"), so social rows lead with the sentence instead. */
function words(n: OlyNotification): { title: string; body?: string } {
  const who = actorName(n);
  switch (n.type) {
    case "like":
      return { title: n.body };
    case "comment": {
      const i = n.body.indexOf(": ");
      return i > 0 ? { title: `${n.body.slice(0, i)} commented`, body: n.body.slice(i + 2) } : { title: n.body };
    }
    case "follow":
    case "follow_request":
      return who && n.body.startsWith(who)
        ? { title: who, body: n.body.slice(who.length).trim().replace(/^./, (c) => c.toUpperCase()) }
        : { title: n.body };
    default:
      return { title: n.title, body: n.body || undefined };
  }
}

/** 12m, 5h, Wed, Sep 28. */
export function shortTime(iso: string) {
  const d = new Date(iso);
  const s = Math.max(0, (Date.now() - d.getTime()) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 6 * 86400) return d.toLocaleDateString("en-US", { weekday: "short" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ── The picture on the left ─────────────────────────────────── */

const HEX_FACETS: [string, string][] = [
  ["52,16.9 148,16.9 136,37.6 64,37.6", "#7FBAF2"],
  ["148,16.9 196,100 172,100 136,37.6", "#3D95E3"],
  ["196,100 148,183.1 136,162.4 172,100", "#0F6FC4"],
  ["148,183.1 52,183.1 64,162.4 136,162.4", "#0A4E8C"],
  ["52,183.1 4,100 28,100 64,162.4", "#0F6FC4"],
  ["4,100 52,16.9 64,37.6 28,100", "#3D95E3"],
];
const GREY_FACETS = ["#8A93A3", "#5E6675", "#454C58", "#343A44", "#454C58", "#5E6675"];
const HEX_RIM = "172,100 136,162.4 64,162.4 28,100 64,37.6 136,37.6";
const HEX_FIELD = "166,100 133,157.2 67,157.2 34,100 67,42.8 133,42.8";

const HEX_OUTER = "196,100 148,183.1 52,183.1 4,100 52,16.9 148,16.9";

/**
 * The season badge, small, in the same three states the profile badges use.
 *   earned   — full metal and glow: a verified lift, a finished challenge, moving up.
 *   progress — faded metal, dashed blue edge: within reach, nearly yours.
 *   faded    — a grey ghost: someone passed you.
 *   rejected — grey metal, red numeral: a lift sent back.
 */
type HexState = "earned" | "progress" | "faded" | "rejected";

function HexMini({ value, state = "earned" }: { value: string; state?: HexState }) {
  const small = value.length > 3;
  const ink =
    state === "rejected" ? olyPalette.redInk : state === "faded" ? olyColors.text.secondary : "#FFFFFF";
  return (
    <View style={state === "earned" && styles.hexGlow}>
      <Svg width={LEAD} height={LEAD} viewBox="0 0 200 200">
        {state === "faded" ? (
          <>
            <Polygon points={HEX_OUTER} fill="rgba(239, 241, 244, 0.05)" stroke="rgba(239, 241, 244, 0.22)" strokeWidth={4} />
            <Polygon points={HEX_FIELD} fill="rgba(0, 0, 0, 0.22)" />
          </>
        ) : (
          <>
            {HEX_FACETS.map(([pts, c], i) => (
              <Polygon
                key={i}
                points={pts}
                fill={state === "rejected" ? GREY_FACETS[i] : c}
                fillOpacity={state === "progress" ? 0.28 : 1}
              />
            ))}
            {state !== "progress" ? (
              <Polygon points={HEX_RIM} fill={state === "rejected" ? "#343A44" : "#0A4E8C"} />
            ) : null}
            <Polygon points={HEX_FIELD} fill={olyPalette.background} />
            {state === "progress" ? (
              <Polygon
                points={HEX_OUTER}
                fill="none"
                stroke={olyPalette.primary}
                strokeWidth={5}
                strokeDasharray="10 9"
                strokeLinecap="round"
              />
            ) : null}
          </>
        )}
        <SvgText
          x={100}
          y={small ? 118 : 121}
          textAnchor="middle"
          fontSize={small ? 50 : 60}
          fontFamily={olyFonts.bold}
          fontWeight="700"
          letterSpacing={-2}
          fill={ink}
        >
          {value}
        </SvgText>
      </Svg>
    </View>
  );
}

function Avatar({ n, size = LEAD, solid }: { n: OlyNotification; size?: number; solid?: boolean }) {
  const url = n.actor?.profile?.profile_image_url;
  return (
    <View style={[styles.avatar, { width: size, height: size }, solid && styles.avatarSolid]}>
      {url ? (
        <Image source={{ uri: url }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <Text style={[styles.avatarText, size < LEAD && { fontSize: 12 }]}>{initials(actorName(n))}</Text>
      )}
    </View>
  );
}

function Ring({ done, total }: { done: number; total: number }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  return (
    <View style={{ width: LEAD, height: LEAD }}>
      <Svg width={LEAD} height={LEAD} viewBox="0 0 44 44">
        <Circle cx={22} cy={22} r={r} fill="none" stroke={olyColors.glass.raised} strokeWidth={4} />
        <Circle
          cx={22}
          cy={22}
          r={r}
          fill="none"
          stroke={olyPalette.primary}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={`${(c * done) / total} ${c}`}
          transform="rotate(-90 22 22)"
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={styles.ringText}>
          {done}/{total}
        </Text>
      </View>
    </View>
  );
}

function Lead({ n }: { n: OlyNotification }) {
  switch (n.type) {
    case "rank_up":
    case "rank_down":
    case "proximity": {
      const r = rankOf(n);
      const state = n.type === "rank_up" ? "earned" : n.type === "proximity" ? "progress" : "faded";
      return <HexMini value={Number.isFinite(r) ? String(r) : "#"} state={state} />;
    }
    case "lift_verified":
    case "lift_rejected": {
      const kg = kgOf(n);
      return <HexMini value={Number.isFinite(kg) ? String(kg) : "✓"} state={n.type === "lift_rejected" ? "rejected" : "earned"} />;
    }
    case "challenge_completed":
      return <HexMini value={`${n.data?.done ?? 3}/${n.data?.total ?? 3}`} />;
    case "challenge_ending":
      return <Ring done={n.data?.done ?? 0} total={n.data?.total ?? 1} />;
    case "olys_earned":
      return <OlyCoin size={LEAD} />;
    case "following_pr":
      // Just the frame. The title says PR and the body has the weight, so
      // the picture carries no text; the blue edge is the only PR signal.
      return (
        <View style={styles.thumb}>
          {n.data?.thumbnail_url ? (
            <Image source={{ uri: n.data.thumbnail_url }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <LinearGradient colors={["#465264", "#1A1E25"]} style={StyleSheet.absoluteFill} />
          )}
        </View>
      );
    case "like":
      if (n.count > 1) {
        return (
          <View style={{ width: LEAD, height: LEAD }}>
            <View style={[styles.stackBack, styles.center]}>
              <Text style={styles.stackText}>+{Math.min(99, n.count - 1)}</Text>
            </View>
            <View style={styles.stackFront}>
              <Avatar n={n} size={30} solid />
            </View>
          </View>
        );
      }
      return <Avatar n={n} />;
    default:
      return <Avatar n={n} />;
  }
}

/* ── The card ─────────────────────────────────────────────────── */

export function NotificationCard({
  n,
  onPress,
  onAccept,
  onDecline,
  onFollowBack,
  followedBack,
}: {
  n: OlyNotification;
  onPress?: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
  onFollowBack?: () => void;
  followedBack?: boolean;
}) {
  const { title, body } = words(n);
  const unread = !n.read;
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => pressed && kit.pressed}>
      <Glass
        radius={olyRadius.tile}
        borderColor={unread ? olyColors.glass.accentBorder : olyColors.glass.border}
        style={styles.card}
      >
        <Lead n={n} />
        <View style={styles.words}>
          <Text style={styles.title}>{title}</Text>
          {body ? <Text style={styles.body}>{body}</Text> : null}

          {n.type === "follow_request" && (onAccept || onDecline) ? (
            <View style={styles.actions}>
              <Pressable onPress={onAccept} style={[styles.btn, styles.btnPrimary]} accessibilityRole="button">
                <Text style={styles.btnTextPrimary}>Accept</Text>
              </Pressable>
              <Pressable onPress={onDecline} style={[styles.btn, styles.btnQuiet]} accessibilityRole="button">
                <Text style={styles.btnText}>Decline</Text>
              </Pressable>
            </View>
          ) : null}

          {n.type === "follow" && onFollowBack ? (
            <View style={styles.actionsLeft}>
              <Pressable
                onPress={followedBack ? undefined : onFollowBack}
                style={[styles.btn, followedBack ? styles.btnQuiet : styles.btnPrimary, styles.btnSolo]}
                accessibilityRole="button"
              >
                <Text style={followedBack ? styles.btnText : styles.btnTextPrimary}>
                  {followedBack ? "Following" : "Follow back"}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
        <Text style={[styles.time, unread && styles.timeUnread]}>{shortTime(n.createdAt)}</Text>
      </Glass>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: olySpacing[12],
    padding: olySpacing[12],
  },
  words: { flex: 1, minWidth: 0, alignSelf: "center" },
  title: {
    fontFamily: olyFonts.bold,
    fontSize: 16,
    lineHeight: 20,
    color: olyColors.text.primary,
  },
  body: {
    ...olyTypography.bodySmall,
    marginTop: 2,
    color: olyColors.text.secondary,
  },
  time: {
    width: 36,
    textAlign: "right",
    ...olyTypography.caption,
    lineHeight: 20,
    color: olyColors.text.hint,
  },
  timeUnread: { color: olyColors.text.primary },

  center: { alignItems: "center", justifyContent: "center" },
  avatar: {
    borderRadius: olyRadius.full,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: olyColors.glass.raised,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
  },
  avatarSolid: { backgroundColor: olyPalette.cardElevated },
  avatarText: { fontFamily: olyFonts.medium, fontSize: 15, color: olyColors.text.primary },

  stackBack: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 30,
    height: 30,
    borderRadius: olyRadius.full,
    backgroundColor: "#22272F",
    borderWidth: 1,
    borderColor: olyColors.glass.border,
  },
  stackText: { fontFamily: olyFonts.bold, fontSize: 11, color: olyColors.text.secondary },
  stackFront: {
    position: "absolute",
    right: 0,
    bottom: 0,
    borderRadius: olyRadius.full,
    borderWidth: 2,
    borderColor: olyPalette.background,
  },

  ringText: { fontFamily: olyFonts.bold, fontSize: 12, color: olyColors.text.primary },

  hexGlow: {
    shadowColor: olyPalette.primary,
    shadowOpacity: 0.55,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },

  thumb: {
    width: LEAD,
    height: 54,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: olyColors.glass.accentBorder,
    shadowColor: olyPalette.primary,
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },

  actions: { flexDirection: "row", gap: olySpacing[8], marginTop: 10 },
  actionsLeft: { flexDirection: "row", marginTop: 10 },
  btn: { height: 36, borderRadius: olyRadius.full, alignItems: "center", justifyContent: "center" },
  btnSolo: { flex: 0, paddingHorizontal: olySpacing[16] },
  btnPrimary: { flex: 1, backgroundColor: olyPalette.primary },
  btnQuiet: {
    flex: 1,
    backgroundColor: olyColors.glass.control,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
  },
  btnTextPrimary: { fontFamily: olyFonts.medium, fontSize: 14, color: "#FFFFFF" },
  btnText: { fontFamily: olyFonts.medium, fontSize: 14, color: olyColors.text.primary },
});
