import { OlySwitch } from "@/src/oly-components/atoms/OlySwitch";
import { GlyphCircle } from "@/src/oly-components/atoms/OlyGlyph";
import { OlySettingsRow } from "@/src/oly-components/molecules/OlySettingsRow";
import { OlyCoin } from "@/src/oly-components/olys/OlyCoin";
import { SectionLabel, SettingsCard, SettingsNote, SettingsScreen } from "@/src/oly-components/settings/SettingsKit";
import { formatTime, useNotificationSettings } from "@/src/oly-hooks/useNotificationSettings";
import { router } from "expo-router";
import React from "react";

/**
 * Notification settings. Design "A. Glass circles · Notifications".
 *
 * Rows that open a page (Rank, Quiet hours) show what is set and an arrow;
 * rows with nothing inside get a switch. These only control what buzzes the
 * phone: the inbox always fills.
 */
export default function NotificationSettings() {
  const { server, local, setServer, setLocal, rankOn } = useNotificationSettings();
  const rankSummary = server.muteRank || rankOn === 0 ? "Off" : rankOn === 3 ? "All on" : `${rankOn} of 3`;
  const quietSummary = server.quietHoursOff
    ? "Off"
    : `${formatTime(local.quietStart)} to ${formatTime(local.quietEnd)}`;

  return (
    <SettingsScreen title="Notifications">
      <SectionLabel>Push alerts</SectionLabel>
      <SettingsCard>
        <OlySettingsRow
          label="Rank"
          subtitle="Moving up, being passed, within reach"
          lead={<GlyphCircle name="rank" />}
          value={rankSummary}
          onPress={() => router.push("/athlete/settings-rank-alerts")}
        />
        <OlySettingsRow
          label="Lifts"
          subtitle="Verified lifts, olys earned, challenges"
          lead={<OlyCoin size={36} />}
          right={<OlySwitch label="Lifts" value={!server.muteLifts} onChange={(v) => setServer({ muteLifts: !v })} />}
        />
        <OlySettingsRow
          label="People"
          subtitle="Likes, comments, follows and PRs"
          glyph="person"
          right={<OlySwitch label="People" value={!server.muteSocial} onChange={(v) => setServer({ muteSocial: !v })} />}
        />
        <OlySettingsRow
          label="Messages"
          subtitle="New messages and requests"
          glyph="chat"
          right={<OlySwitch label="Messages" value={local.messages} onChange={(v) => setLocal({ messages: v })} />}
        />
      </SettingsCard>

      <SectionLabel>Quiet hours</SectionLabel>
      <SettingsCard>
        <OlySettingsRow
          label="Quiet hours"
          subtitle="Alerts wait, then arrive together"
          glyph="moon"
          value={quietSummary}
          onPress={() => router.push("/athlete/settings-quiet-hours")}
        />
      </SettingsCard>

      <SettingsNote>Everything still shows up in your inbox. These only control what buzzes your phone.</SettingsNote>
    </SettingsScreen>
  );
}
