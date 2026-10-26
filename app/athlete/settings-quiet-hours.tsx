import { OlySwitch } from "@/src/oly-components/atoms/OlySwitch";
import { OlyGlyph } from "@/src/oly-components/atoms/OlyGlyph";
import { OlySettingsRow } from "@/src/oly-components/molecules/OlySettingsRow";
import { SettingsCard, SettingsNote, SettingsScreen } from "@/src/oly-components/settings/SettingsKit";
import { TimeWheel } from "@/src/oly-components/settings/TimeWheel";
import { quietLength, useNotificationSettings } from "@/src/oly-hooks/useNotificationSettings";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyTypography } from "@/src/oly-theme/oly-typography";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

/** Quiet hours. Design "3. Two wheels", 30 minute steps. */
export default function QuietHours() {
  const { server, local, setServer, setLocal } = useNotificationSettings();
  const on = !server.quietHoursOff;
  return (
    <SettingsScreen title="Quiet hours">
      <View style={{ height: 8 }} />
      <SettingsCard>
        <OlySettingsRow
          label="Quiet hours"
          subtitle="Alerts wait, then arrive together"
          right={<OlySwitch label="Quiet hours" value={on} onChange={(v) => setServer({ quietHoursOff: !v })} />}
        />
      </SettingsCard>

      <SettingsCard style={[s.wheelCard, !on && s.off]}>
        <View pointerEvents={on ? "auto" : "none"}>
          <TimeWheel
            start={local.quietStart}
            end={local.quietEnd}
            onChange={(a, b) => setLocal({ quietStart: a, quietEnd: b })}
          />
          <View style={s.foot}>
            <OlyGlyph name="moon" size={14} color={olyColors.text.secondary as string} />
            <Text style={s.footText}>{quietLength(local.quietStart, local.quietEnd)} of quiet</Text>
          </View>
        </View>
      </SettingsCard>

      <SettingsNote>Uses your phone's timezone, so it follows you when you travel.</SettingsNote>
    </SettingsScreen>
  );
}

const s = StyleSheet.create({
  wheelCard: { paddingHorizontal: olySpacing[12], paddingTop: olySpacing[16], paddingBottom: olySpacing[12] },
  off: { opacity: 0.4 },
  foot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: olySpacing[8],
    marginTop: olySpacing[12],
    paddingTop: olySpacing[12],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: olyColors.glass.rule,
  },
  footText: { ...olyTypography.bodySmall, color: olyColors.text.secondary },
});
