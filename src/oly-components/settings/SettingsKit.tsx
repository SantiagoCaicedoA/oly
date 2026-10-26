/**
 * The pieces every settings page shares, so Settings, Notifications, Rank
 * alerts and Quiet hours read as one family: the shared header floating over
 * a scroll, overline section labels, glass cards with hairline dividers,
 * and a quiet note under a group.
 */
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { OlyScreenWrapper } from "@/src/oly-components/organisms/OlyScreenWrapper";
import {
  OlyFloatingHeader,
  useFloatingHeader,
} from "@/src/oly-components/organisms/OlyFloatingHeader";
import { OlyScreenHeader } from "@/src/oly-components/organisms/OlyScreenHeader";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyTypography } from "@/src/oly-theme/oly-typography";

export function SettingsScreen({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { headerH, onLayout } = useFloatingHeader(72);
  return (
    <OlyScreenWrapper padded={false}>
      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingTop: headerH + olySpacing[8] },
        ]}
        scrollIndicatorInsets={{ top: headerH }}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      <OlyFloatingHeader safeTop={false} onLayout={onLayout}>
        <OlyScreenHeader title={title} onBack={() => router.back()} />
      </OlyFloatingHeader>
    </OlyScreenWrapper>
  );
}

export function SectionLabel({ children }: { children: string }) {
  return <Text style={s.label}>{children}</Text>;
}

/** A glass card; children are separated by hairlines. */
export function SettingsCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={[s.card, style]}>
      {items.map((c, i) => (
        <View key={i}>
          {i > 0 ? <View style={s.divider} /> : null}
          {c}
        </View>
      ))}
    </View>
  );
}

export function SettingsNote({ children }: { children: string }) {
  return <Text style={s.note}>{children}</Text>;
}

const s = StyleSheet.create({
  scroll: {
    paddingHorizontal: olyLayout.screenPadding,
    paddingBottom: olySpacing[40],
  },
  label: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginTop: olySpacing[24],
    marginBottom: olyLayout.sectionHeaderGap,
    paddingHorizontal: olySpacing[4],
  },
  card: {
    backgroundColor: olyColors.glass.card,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
    borderRadius: olyRadius.tile,
    overflow: "hidden",
    marginBottom: olySpacing[12],
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: olyColors.glass.rule,
  },
  note: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    paddingHorizontal: olySpacing[4],
    marginTop: olySpacing[4],
  },
});
