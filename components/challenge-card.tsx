import { Glass, GlowBar } from "@/src/oly-components/shop/ShopKit";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { CHALLENGE } from "@/src/oly-mock/wallet";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyFonts } from "@/src/oly-theme/oly-typography";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

/**
 * Weekly challenge, pinned above the first post (Feed A on the canvas).
 * Compact drops the overline and the faces, for the profile's Progress
 * tab, which puts the days left in its section header instead.
 * Mock data until challenges come from the backend.
 */
export default function ChallengeCard({ compact = false }: { compact?: boolean }) {
  const c = CHALLENGE;
  const reward = (
    <View style={s.reward}>
      <Text style={s.rewardText}>+{c.reward}</Text>
    </View>
  );
  return (
    <Glass
      radius={olyRadius.xl}
      colors={olyColors.glass.ticket}
      borderColor={olyColors.glass.accentBorder}
      style={[s.card, compact && s.cardCompact]}
    >
      {compact ? (
        <View style={s.top}>
          <Text style={[s.title, s.titleCompact, s.flex]}>{c.title}</Text>
          {reward}
        </View>
      ) : (
        <>
          <View style={s.top}>
            <Text style={s.over} numberOfLines={1}>
              WEEKLY CHALLENGE · {c.daysLeft} DAYS LEFT
            </Text>
            {reward}
          </View>
          <Text style={[s.title, s.titleGap]}>{c.title}</Text>
        </>
      )}
      <View style={s.progress}>
        <View style={s.flex}>
          <GlowBar pct={c.done / c.goal} height={compact ? 4 : 6} />
        </View>
        <Text style={s.small}>
          <Text style={s.strong}>{c.done}</Text> of {c.goal}
        </Text>
      </View>
      {!compact && (
        <View style={s.joined}>
          <View style={s.faces}>
            {c.faces.map((f, i) => (
              <View key={f} style={[s.face, i > 0 && s.faceOverlap]}>
                <Text style={s.faceText}>{f}</Text>
              </View>
            ))}
          </View>
          <Text style={s.small}>{c.joined}</Text>
        </View>
      )}
    </Glass>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  card: { marginHorizontal: olySpacing[12], marginTop: 14, padding: olySpacing[16] },
  cardCompact: { marginHorizontal: 0, marginTop: 0, padding: 18 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: olySpacing[8] },
  over: { flex: 1, fontFamily: olyFonts.medium, fontSize: 11, letterSpacing: 1.5, color: olyColors.text.secondary },
  reward: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.accentFill,
    borderWidth: 1,
    borderColor: olyColors.glass.accentBorder,
  },
  rewardText: { fontFamily: olyFonts.bold, fontSize: 13, color: olyColors.text.primary },
  titleGap: { marginTop: olySpacing[8] },
  titleCompact: { fontSize: 16, lineHeight: 21 },
  title: { fontFamily: olyFonts.bold, fontSize: 18, lineHeight: 23, color: olyColors.text.primary },
  progress: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: olySpacing[12] },
  small: { fontFamily: olyFonts.regular, fontSize: 12, color: olyColors.text.secondary },
  strong: { fontFamily: olyFonts.bold, color: olyColors.text.primary },
  joined: { flexDirection: "row", alignItems: "center", gap: olySpacing[8], marginTop: olySpacing[12] },
  faces: { flexDirection: "row" },
  face: {
    width: 24,
    height: 24,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.cardElevated,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
    alignItems: "center",
    justifyContent: "center",
  },
  faceOverlap: { marginLeft: -8 },
  faceText: { fontFamily: olyFonts.medium, fontSize: 9, color: olyColors.text.primary },
});
