/**
 * Notification settings, server and phone together.
 *
 * The backend stores four things: mute People, mute Lifts, mute Rank, and
 * quiet hours on or off (10 pm to 8 am). The designs need more: each rank
 * alert on its own, a Messages switch, and your own quiet hours. Until the
 * backend has fields for those (on Abdul's list), they live on this phone in
 * AsyncStorage, and the server field they belong to is kept in step:
 * all three rank alerts off means muteRank on.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import {
  useGetNotificationPrefsQuery,
  useUpdateNotificationPrefsMutation,
} from "@/store/api";
import type { NotificationPrefs } from "@/types/api/notifications";

const KEY = "oly.notificationSettings.v1";

export interface LocalNotificationSettings {
  rankUp: boolean;
  rankDown: boolean;
  proximity: boolean;
  messages: boolean;
  /** Minutes after midnight, in 30 minute steps. */
  quietStart: number;
  quietEnd: number;
}

const LOCAL_DEFAULTS: LocalNotificationSettings = {
  rankUp: true,
  rankDown: true,
  proximity: true,
  messages: true,
  quietStart: 22 * 60,
  quietEnd: 8 * 60,
};

const SERVER_DEFAULTS: NotificationPrefs = {
  muteSocial: false,
  muteLifts: false,
  muteRank: false,
  quietHoursOff: false,
};

let cache: LocalNotificationSettings | null = null;
const listeners = new Set<(s: LocalNotificationSettings) => void>();

async function loadLocal() {
  if (cache) return cache;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    cache = { ...LOCAL_DEFAULTS, ...(raw ? JSON.parse(raw) : {}) };
  } catch {
    cache = { ...LOCAL_DEFAULTS };
  }
  return cache!;
}

export function formatTime(min: number) {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m === 0 ? "00" : m} ${h < 12 ? "AM" : "PM"}`;
}

export function quietLength(start: number, end: number) {
  const mins = (end - start + 24 * 60) % (24 * 60);
  const h = Math.floor(mins / 60);
  const half = mins % 60 ? "½" : "";
  return `${h}${half} ${h === 1 && !half ? "hour" : "hours"}`;
}

export function useNotificationSettings() {
  const q = useGetNotificationPrefsQuery();
  const [update] = useUpdateNotificationPrefsMutation();
  const server = { ...SERVER_DEFAULTS, ...(q.data?.data ?? {}) };
  const [local, setLocalState] = useState<LocalNotificationSettings>(
    cache ?? LOCAL_DEFAULTS,
  );

  useEffect(() => {
    let live = true;
    loadLocal().then((s) => live && setLocalState(s));
    const l = (s: LocalNotificationSettings) => setLocalState(s);
    listeners.add(l);
    return () => {
      live = false;
      listeners.delete(l);
    };
  }, []);

  const setLocal = useCallback((patch: Partial<LocalNotificationSettings>) => {
    const next = { ...(cache ?? LOCAL_DEFAULTS), ...patch };
    cache = next;
    listeners.forEach((l) => l(next));
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
    return next;
  }, []);

  const setServer = useCallback(
    (patch: Partial<NotificationPrefs>) => update(patch),
    [update],
  );

  /** Rank alerts: each one on the phone, and muteRank only when all three are off. */
  const setRank = useCallback(
    (
      patch: Partial<
        Pick<LocalNotificationSettings, "rankUp" | "rankDown" | "proximity">
      >,
    ) => {
      const next = setLocal(patch);
      const allOff = !next.rankUp && !next.rankDown && !next.proximity;
      if (allOff !== server.muteRank) setServer({ muteRank: allOff });
    },
    [setLocal, setServer, server.muteRank],
  );

  const rankOn = [local.rankUp, local.rankDown, local.proximity].filter(
    Boolean,
  ).length;

  return {
    server,
    local,
    setServer,
    setLocal,
    setRank,
    rankOn,
    isLoading: q.isLoading,
    isError: q.isError,
  };
}
