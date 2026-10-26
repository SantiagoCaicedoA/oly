import { OlySwitch } from "@/src/oly-components/atoms/OlySwitch";
import { OlySettingsRow } from "@/src/oly-components/molecules/OlySettingsRow";
import {
  SettingsCard,
  SettingsNote,
  SettingsScreen,
} from "@/src/oly-components/settings/SettingsKit";
import { useNotificationSettings } from "@/src/oly-hooks/useNotificationSettings";
import React from "react";
import { View } from "react-native";

/** Rank alerts. Design "A1. Its own page, Rank". */
export default function RankAlerts() {
  const { local, setRank } = useNotificationSettings();
  return (
    <SettingsScreen title="Rank alerts">
      <View style={{ height: 8 }} />
      <SettingsCard>
        <OlySettingsRow
          label="You moved up"
          subtitle="When you climb the board"
          right={
            <OlySwitch
              label="You moved up"
              value={local.rankUp}
              onChange={(v) => setRank({ rankUp: v })}
            />
          }
        />
        <OlySettingsRow
          label="Someone passed you"
          subtitle="When another lifter moves above you"
          right={
            <OlySwitch
              label="Someone passed you"
              value={local.rankDown}
              onChange={(v) => setRank({ rankDown: v })}
            />
          }
        />
        <OlySettingsRow
          label="Within reach"
          subtitle="When the next spot is a few kilos away"
          right={
            <OlySwitch
              label="Within reach"
              value={local.proximity}
              onChange={(v) => setRank({ proximity: v })}
            />
          }
        />
      </SettingsCard>
      <SettingsNote>
        Turning one off only stops the alert. It still shows in your inbox.
      </SettingsNote>
    </SettingsScreen>
  );
}
