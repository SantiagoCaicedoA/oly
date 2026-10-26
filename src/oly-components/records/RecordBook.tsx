/**
 * Record book pieces: the total card at the top, the rich lift row
 * (number, rank line, milestone bar) and the plain variation row.
 * Shared by onboarding (empty, card only) and settings (filled).
 */
import { Glass, GlowBar } from "@/src/oly-components/shop/ShopKit";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts, olyTypography } from "@/src/oly-theme/oly-typography";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LEVEL_OLYS, MAX_LEVEL, type LevelInfo } from "./ladder";

/* ─── Total card ─────────────────────────────────────────────────── */

export function TotalCard({
  label,
  total,
  unit,
  rank,
  gap,
  cols,
  footer,
}: {
  label: string;
  total: number;
  unit: string;
  /** "#4" and the board name, or null for the dashed placeholder. */
  rank: { rank: number; board: string } | null;
  /** "3 kg to #3", or null. */
  gap: { kg: number; rank: number } | null;
  /** null shows a dash. `plain` drops the unit (the Level column). */
  cols: { label: string; value: string | null; plain?: boolean }[];
  footer?: string;
}) {
  const empty = total <= 0;
  return (
    <View style={s.total}>
      <LinearGradient
        colors={olyColors.glass.ticket}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={s.spread}>
        <Text style={s.overline}>{label}</Text>
        {rank ? (
          <View style={s.rankChip}>
            <Text style={s.rankChipText}>
              #{rank.rank} <Text style={s.rankChipBoard}>{rank.board}</Text>
            </Text>
          </View>
        ) : (
          <View style={s.dashChip}>
            <Text style={s.dashChipText}># on the board</Text>
          </View>
        )}
      </View>
      <View style={[s.spread, s.baseline]}>
        <Text style={[s.bigTotal, empty && s.faded]}>
          {total}
          <Text style={[s.bigUnit, empty && s.hintInk]}> {unit}</Text>
        </Text>
        {gap ? <Gap kg={gap.kg} rest={`to #${gap.rank}`} unit={unit} /> : null}
      </View>
      <View style={s.cols}>
        {cols.map((c, i) => (
          <View key={c.label} style={[s.col, i > 0 && s.colRule]}>
            <Text style={s.colLabel}>{c.label}</Text>
            {c.value ? (
              <Text style={s.colValue}>
                {c.value}
                {c.plain ? null : <Text style={s.colUnit}> {unit}</Text>}
              </Text>
            ) : (
              <Text style={[s.colValue, s.faded]}>—</Text>
            )}
          </View>
        ))}
      </View>
      {footer ? <Text style={s.footer}>{footer}</Text> : null}
    </View>
  );
}

function Gap({ kg, rest, unit }: { kg: number; rest: string; unit: string }) {
  return (
    <Text style={s.gap}>
      <Text style={s.gapStrong}>
        {kg} {unit}
      </Text>{" "}
      {rest}
    </Text>
  );
}

/* ─── Group card ─────────────────────────────────────────────────── */

export function RecordGroup({ children }: { children: React.ReactNode }) {
  return <Glass radius={olyRadius.tile}>{children}</Glass>;
}

/* ─── Weight pill ────────────────────────────────────────────────── */

function WeightPill({
  value,
  unit,
  big,
  onPress,
  label,
}: {
  value: number;
  unit: string;
  big?: boolean;
  onPress: () => void;
  label: string;
}) {
  const empty = value === 0;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={olySpacing[4]}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${value} ${unit}. Edit`}
      style={({ pressed }) => [s.pill, pressed && s.pressed]}
    >
      <Text style={[s.pillValue, big && s.pillValueBig, empty && s.hintInk]}>
        {value}
        <Text style={s.pillUnit}> {unit}</Text>
      </Text>
    </Pressable>
  );
}

/* ─── Rich lift row (settings) ───────────────────────────────────── */

export function RecordRow({
  name,
  value,
  unit,
  first,
  verified,
  rank,
  level,
  onEdit,
  onAddVideo,
  onMilestones,
}: {
  name: string;
  value: number;
  unit: string;
  first?: boolean;
  verified: boolean;
  /** Mock board position for a verified lift. */
  rank: { rank: number; board: string; gapKg: number | null } | null;
  level: LevelInfo | null;
  onEdit: () => void;
  onAddVideo: () => void;
  /** Opens this lift's milestone ladder. */
  onMilestones: () => void;
}) {
  const nextOlys = level && level.level < MAX_LEVEL ? LEVEL_OLYS[level.level] : null;
  return (
    <View style={[s.row, !first && s.rowRule]}>
      <View style={s.line}>
        <Text style={s.rowName} numberOfLines={1}>
          {name}
        </Text>
        {verified ? (
          <View style={s.tick} accessibilityLabel="Verified">
            <Ionicons name="checkmark" size={10} color={olyColors.text.onAccent} />
          </View>
        ) : null}
        <View style={s.flex} />
        <WeightPill value={value} unit={unit} big onPress={onEdit} label={name} />
      </View>

      <View style={[s.line, s.second]}>
        {verified ? (
          rank ? (
            <>
              <Text style={s.meta}>
                <Text style={s.rankNum}>#{rank.rank}</Text>
                {"  "}
                {rank.board}
              </Text>
              <View style={s.flex} />
              {rank.gapKg != null ? (
                <Gap kg={rank.gapKg} rest={`to #${rank.rank - 1}`} unit={unit} />
              ) : (
                <Text style={s.meta}>Top of the board</Text>
              )}
            </>
          ) : (
            <Text style={s.meta}>Verified</Text>
          )
        ) : (
          <>
            <View style={s.greyChip}>
              <Text style={s.greyChipText}>Not verified</Text>
            </View>
            <View style={s.flex} />
            <Pressable
              onPress={onAddVideo}
              hitSlop={olySpacing[16]}
              accessibilityRole="button"
              style={({ pressed }) => pressed && s.pressed}
            >
              <Text style={s.addVideo}>Add a video</Text>
            </Pressable>
          </>
        )}
      </View>

      {level ? (
        <Pressable
          onPress={onMilestones}
          accessibilityRole="button"
          accessibilityLabel={`${name} milestones`}
          style={({ pressed }) => [s.mile, pressed && s.pressed]}
        >
          <GlowBar pct={level.pct} />
          <View style={[s.spread, s.levelLine]}>
            <Text style={s.levelText}>
              {nextOlys != null ? (
                <>
                  Next milestone{" "}
                  <Text style={s.levelStrong}>
                    {level.marks[level.level]} {unit}
                  </Text>
                </>
              ) : (
                "Every milestone reached"
              )}
            </Text>
            <View style={s.mileReward}>
              {nextOlys != null ? (
                <Text style={[s.levelStrong, s.olys, !verified && s.hintInk]}>
                  +{nextOlys} olys
                </Text>
              ) : null}
              <Ionicons name="chevron-forward" size={14} color={olyColors.text.hint} />
            </View>
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

/* ─── Plain row (settings variations) ────────────────────────────── */

export function SimpleRecordRow({
  name,
  value,
  unit,
  first,
  onEdit,
}: {
  name: string;
  value: number;
  unit: string;
  first?: boolean;
  onEdit: () => void;
}) {
  return (
    <View style={[s.simple, !first && s.rowRule]}>
      <Text style={s.simpleName} numberOfLines={1}>
        {name}
      </Text>
      <WeightPill value={value} unit={unit} onPress={onEdit} label={name} />
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────── */

const s = StyleSheet.create({
  flex: { flex: 1 },
  pressed: { opacity: 0.7 },
  spread: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  baseline: { alignItems: "baseline", marginTop: olySpacing[8] },
  faded: { color: olyColors.text.disabled },
  hintInk: { color: olyColors.text.hint },

  total: {
    borderRadius: olyRadius.xl,
    borderWidth: 1,
    borderColor: olyColors.glass.accentBorder,
    padding: 18,
    overflow: "hidden",
  },
  overline: {
    ...olyTypography.caption,
    fontSize: 11,
    fontFamily: olyFonts.medium,
    letterSpacing: 1.5,
    color: olyColors.text.secondary,
  },
  bigTotal: {
    fontFamily: olyFonts.bold,
    fontSize: 44,
    lineHeight: 50,
    letterSpacing: -1.6,
    color: olyColors.text.primary,
  },
  bigUnit: { fontSize: 15, letterSpacing: 0, color: olyColors.text.primary },
  gap: { ...olyTypography.caption, fontSize: 13, color: olyColors.text.secondary },
  gapStrong: { fontFamily: olyFonts.bold, color: olyColors.text.primary },
  cols: {
    flexDirection: "row",
    marginTop: olySpacing[16],
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: olyColors.glass.rule,
  },
  col: { flex: 1 },
  colRule: { borderLeftWidth: 1, borderLeftColor: olyColors.glass.rule, paddingLeft: 14 },
  colLabel: {
    ...olyTypography.caption,
    fontSize: 11,
    letterSpacing: 1,
    color: olyColors.text.secondary,
  },
  colValue: {
    marginTop: 2,
    fontFamily: olyFonts.bold,
    fontSize: 18,
    lineHeight: 24,
    color: olyColors.text.primary,
  },
  colUnit: { fontSize: 11, fontFamily: olyFonts.medium, color: olyColors.text.secondary },
  footer: {
    ...olyTypography.caption,
    fontSize: 13,
    marginTop: 14,
    color: olyColors.text.secondary,
  },

  rankChip: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.accentFill,
    borderWidth: 1,
    borderColor: olyColors.glass.accentBorder,
  },
  rankChipText: {
    ...olyTypography.caption,
    fontSize: 13,
    fontFamily: olyFonts.bold,
    color: olyColors.text.primary,
  },
  rankChipBoard: { fontFamily: olyFonts.medium, color: olyColors.text.secondary },
  dashChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: olyRadius.full,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: olyColors.glass.dash,
  },
  dashChipText: {
    ...olyTypography.caption,
    fontSize: 13,
    fontFamily: olyFonts.medium,
    color: olyColors.text.hint,
  },
  greyChip: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.card,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
  },
  greyChipText: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
  },

  row: { paddingHorizontal: 18, paddingTop: olySpacing[20], paddingBottom: 18 },
  rowRule: { borderTopWidth: 1, borderTopColor: olyColors.glass.rule },
  line: { flexDirection: "row", alignItems: "center", gap: olySpacing[8] },
  second: { marginTop: 6 },
  rowName: {
    fontFamily: olyFonts.bold,
    fontSize: 17,
    lineHeight: 22,
    color: olyColors.text.primary,
    flexShrink: 1,
  },
  tick: {
    width: 14,
    height: 14,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  rankNum: { fontFamily: olyFonts.bold, color: olyColors.text.primary },
  meta: { ...olyTypography.caption, fontSize: 13, color: olyColors.text.secondary },
  addVideo: {
    ...olyTypography.caption,
    fontSize: 13,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  mile: { paddingTop: olySpacing[16] },
  mileReward: { flexDirection: "row", alignItems: "center", gap: 2 },
  olys: { fontSize: 13 },
  levelLine: { marginTop: olySpacing[8] },
  levelText: { ...olyTypography.caption, color: olyColors.text.hint },
  levelStrong: { fontFamily: olyFonts.bold, color: olyColors.text.primary },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: olySpacing[8],
    minWidth: 72,
    minHeight: olyLayout.minTouchTarget,
    paddingHorizontal: 14,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.inset,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
  },
  pillValue: { fontFamily: olyFonts.bold, fontSize: 16, color: olyColors.text.primary },
  pillValueBig: { fontSize: 20, letterSpacing: -0.4 },
  pillUnit: {
    fontSize: 11,
    fontFamily: olyFonts.medium,
    letterSpacing: 0,
    color: olyColors.text.secondary,
  },

  simple: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 56,
    paddingHorizontal: olySpacing[16],
    paddingVertical: 6,
  },
  simpleName: {
    flex: 1,
    fontFamily: olyFonts.medium,
    fontSize: 15,
    color: olyColors.text.primary,
  },
});
