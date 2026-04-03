import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

/* Enable LayoutAnimation on Android */
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/* ── Constants ──────────────────────────────────────── */
const AVATAR_SIZE = 36;


interface CoachNoteProps {
  coach_note?: string;
  key_cues?: string[];
}

export default function CoachNote({ coach_note, key_cues }: CoachNoteProps) {
  const [expanded, setExpanded] = useState(false);

  if (!coach_note) return null;

  const toggleExpand = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(250, "easeInEaseOut", "opacity")
    );
    setExpanded(!expanded);
  };

  return (
    <LinearGradient
      colors={olyColors.bg.cardMade.colors as unknown as string[]}
      start={olyColors.bg.cardMade.start}
      end={olyColors.bg.cardMade.end}
      style={styles.cardGradient}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        {/* Header row — always visible */}
        <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>OC</Text>
        </View>
        <View style={styles.nameCol}>
          <Text style={styles.name}>Oly Coach</Text>
          <Text style={styles.nameSubtitle}>Personalized guidance</Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={14}
          color={olyColors.text.secondary}
        />
      </View>

      {/* Expandable content */}
      {expanded && (
        <>
          {/* Coach note body */}
          <Text style={styles.noteBody}>{coach_note}</Text>

          {/* Key Cues — styled as blue-filled card */}
          {key_cues && key_cues.length > 0 && (
            <View style={styles.cuesCard}>
              <Text style={styles.cuesHeader}>KEY CUES</Text>
              {key_cues.map((cue, i) => (
                <View key={i} style={styles.cueRow}>
                  <View style={styles.cueDot} />
                  <Text style={styles.cueText}>{cue}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Scale + Talk to Coach */}
          <View style={styles.scaleRow}>
            <View style={styles.scaleTextCol}>
              <Text style={styles.scaleTitle}>Need to scale?</Text>
              <Text style={styles.scaleSubtitle}>Adjust weight for this session</Text>
            </View>
            <TouchableOpacity style={styles.talkButton} activeOpacity={0.7}>
              <Text style={styles.talkButtonText}>TALK TO COACH</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      </TouchableOpacity>
    </LinearGradient>
  );
}

/* ── Styles ──────────────────────────────────────────── */

const styles = StyleSheet.create({
  /* Card gradient wrapper */
  cardGradient: {
    borderRadius: olyRadius.lg,
  },
  card: {
    padding: olyLayout.cardPadding,
    gap: olySpacing[12],
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[12],
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyPalette.white,
  },
  nameCol: {
    flex: 1,
    gap: olySpacing[4],
  },
  name: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  nameSubtitle: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },

  /* Note body */
  noteBody: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    lineHeight: 20,
  },

  /* Key Cues — blue filled card */
  cuesCard: {
    backgroundColor: olyColors.bg.activeHighlight,
    borderRadius: olyRadius.lg,
    borderWidth: 1,
    borderColor: olyColors.border.brandUnselected,
    padding: olyLayout.cardPadding,
    gap: olySpacing[8],
  },
  cuesHeader: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyPalette.white,
    letterSpacing: olyLetterSpacing.uppercase,
    marginBottom: olySpacing[4],
  },
  cueRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: olySpacing[8],
  },
  cueDot: {
    width: 5,
    height: 5,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.text.secondary,
    marginTop: 7,
  },
  cueText: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyPalette.white,
    flex: 1,
    lineHeight: 20,
  },

  /* Divider */
  divider: {
    height: 1,
    backgroundColor: olyColors.border.default,
  },

  /* Scale + Talk to Coach */
  scaleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: olySpacing[12],
    paddingTop: olySpacing[4],
  },
  scaleTextCol: {
    flex: 1,
    gap: olySpacing[4],
  },
  scaleTitle: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  scaleSubtitle: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },
  talkButton: {
    backgroundColor: "transparent",
    borderRadius: olyRadius.full,
    borderWidth: 1,
    borderColor: olyColors.border.default,
    paddingHorizontal: olySpacing[16],
    paddingVertical: olySpacing[8],
  },
  talkButtonText: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
});
