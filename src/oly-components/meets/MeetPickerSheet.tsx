/**
 * Meet picker — a tall glass sheet over the Competition screens.
 *
 * Browse: search, region chips, meets grouped by month, one card each.
 * Tapping a card selects it (the whole card tints blue) and "Choose" hands
 * it back. "Can't find your meet? Request it" swaps the sheet to a request
 * form; the requested meet comes back with pending: true.
 *
 * MOCK: the list comes from src/oly-mock/meets.ts and a request goes
 * nowhere yet. TODO(api): GET /meets and POST /meets/requests.
 */
import { OlyButton } from "@/src/oly-components/atoms/OlyButton";
import {
  dateFromIso,
  fmtLongDay,
  fmtMeetDay,
  isoFromDate,
} from "@/src/oly-components/meets/meet-utils";
import {
  SHEET_SIDE,
  SheetBackdrop,
  SheetGrabber,
  SheetSurface,
} from "@/src/oly-components/shop/ShopKit";
import { mockMeets, type Meet } from "@/src/oly-mock/meets";
import { olyColors, olyMedal } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts } from "@/src/oly-theme/oly-typography";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Filter = "near" | "CA" | "CO" | "all";
/* Opaque, so overlapping faces never show each other through. Placeholder
   tones until friends' photos come from the API. */
const FACE_FILLS = [
  olyMedal.graphite.mid,
  olyMedal.graphite.light,
  olyMedal.graphite.deep,
];

const FILTERS: { key: Filter; label: string }[] = [
  { key: "near", label: "Near you" },
  { key: "CA", label: "Canada" },
  { key: "CO", label: "Colombia" },
  { key: "all", label: "All" },
];

const MONTHS_LONG = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

const monthKey = (iso: string) => {
  const d = dateFromIso(iso);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return sameYear
    ? MONTHS_LONG[d.getMonth()]
    : `${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
};

/** A requested meet must be at least a week out, like the old date wheel. */
const minRequestDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(0, 0, 0, 0);
  return d;
};

type Props = {
  open: boolean;
  onClose: () => void;
  /** The meet already on the athlete's card, preselected on open. */
  selectedId?: string | null;
  onPick: (meet: Meet) => void;
};

export default function MeetPickerSheet({
  open,
  onClose,
  selectedId,
  onPick,
}: Props) {
  const insets = useSafeAreaInsets();
  const meets = useMemo(() => mockMeets(), []);

  const [step, setStep] = useState<"browse" | "request">("browse");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("near");
  const [sel, setSel] = useState<string | null>(null);

  const [reqName, setReqName] = useState("");
  const [reqDate, setReqDate] = useState<Date | null>(null);
  const [reqCity, setReqCity] = useState("");
  const [reqLink, setReqLink] = useState("");
  const [dateOpen, setDateOpen] = useState(false);

  // Each open starts on the list with the current meet selected.
  useEffect(() => {
    if (!open) return;
    setStep("browse");
    setQuery("");
    setSel(selectedId ?? null);
    const current = meets.find((m) => m.id === selectedId);
    setFilter(current && !current.near ? "all" : "near");
  }, [open, selectedId, meets]);

  const q = query.trim().toLowerCase();
  const shown = useMemo(() => {
    if (q)
      return meets.filter((m) =>
        `${m.name} ${m.city}`.toLowerCase().includes(q),
      );
    return meets.filter((m) =>
      filter === "all"
        ? true
        : filter === "near"
          ? m.near
          : m.country === filter,
    );
  }, [meets, q, filter]);

  const groups = useMemo(() => {
    const out: { label: string; items: Meet[] }[] = [];
    for (const m of shown) {
      const label = monthKey(m.date);
      const last = out[out.length - 1];
      if (last && last.label === label) last.items.push(m);
      else out.push({ label, items: [m] });
    }
    return out;
  }, [shown]);

  const selected = meets.find((m) => m.id === sel) ?? null;

  const choose = () => {
    if (!selected) return;
    onPick(selected);
    onClose();
  };

  const openRequest = () => {
    setReqName(query.trim());
    setReqDate(null);
    setReqCity("");
    setReqLink("");
    setDateOpen(false);
    setStep("request");
  };

  const onDate = (e: DateTimePickerEvent, d?: Date) => {
    if (Platform.OS === "android") setDateOpen(false);
    if (e.type === "set" && d) setReqDate(d);
  };

  const canSend = !!reqName.trim() && !!reqDate && !!reqCity.trim();
  const sendRequest = () => {
    if (!reqDate) return;
    // TODO(api): POST /meets/requests { name, date, city, link }
    onPick({
      id: `req-${Date.now()}`,
      name: reqName.trim(),
      date: isoFromDate(reqDate),
      city: reqCity.trim(),
      fed: "",
      pending: true,
    });
    onClose();
  };

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <SheetBackdrop onPress={onClose} />
      <SheetSurface style={[s.sheet, { top: insets.top + 10 }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={s.body}
      >
        <SheetGrabber />

        {step === "browse" ? (
          <>
            <Text style={s.head}>PICK YOUR MEET</Text>
            <View style={[s.search, !!query && s.searchOn]}>
              <Ionicons
                name="search"
                size={16}
                color={olyColors.text.secondary}
              />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search meets"
                placeholderTextColor={olyColors.text.hint}
                selectionColor={olyColors.accent}
                style={s.searchInput}
                autoCorrect={false}
                returnKeyType="search"
              />
              {!!query && (
                <Pressable
                  onPress={() => setQuery("")}
                  hitSlop={olySpacing[16]}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={olyColors.text.hint}
                  />
                </Pressable>
              )}
            </View>
            {!q && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={s.chipsScroll}
                contentContainerStyle={s.chips}
              >
                {FILTERS.map((f) => (
                  <Pressable
                    key={f.key}
                    onPress={() => setFilter(f.key)}
                    hitSlop={{ top: 5, bottom: 5 }}
                    style={[s.chip, filter === f.key && s.chipOn]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: filter === f.key }}
                  >
                    <Text
                      style={[s.chipText, filter === f.key && s.chipTextOn]}
                    >
                      {f.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            <ScrollView
              style={s.list}
              contentContainerStyle={s.listContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {q ? (
                <>
                  <Text style={[s.group, s.groupFirst]}>
                    {shown.length} {shown.length === 1 ? "RESULT" : "RESULTS"}
                  </Text>
                  {shown.map((m) => (
                    <MeetCard
                      key={m.id}
                      m={m}
                      on={m.id === sel}
                      onPress={() => setSel(m.id)}
                    />
                  ))}
                </>
              ) : (
                groups.map((g, i) => (
                  <View key={g.label}>
                    <Text style={[s.group, i === 0 && s.groupFirst]}>
                      {g.label}
                    </Text>
                    {g.items.map((m) => (
                      <MeetCard
                        key={m.id}
                        m={m}
                        on={m.id === sel}
                        onPress={() => setSel(m.id)}
                      />
                    ))}
                  </View>
                ))
              )}
              {shown.length === 0 && (
                <Text style={s.empty}>
                  {q ? "No meet by that name yet." : "No meets here yet."}
                </Text>
              )}
            </ScrollView>

            <View
              style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}
            >
              {selected && (
                <OlyButton
                  label={`Choose ${selected.name}`}
                  onPress={choose}
                  preserveCase
                  fullWidth
                />
              )}
              <Pressable
                onPress={openRequest}
                style={s.cant}
                accessibilityRole="button"
              >
                <Text style={s.cantText}>
                  Can&apos;t find your meet?{" "}
                  <Text style={s.cantStrong}>Request it</Text>
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <View style={s.reqHead}>
              <Pressable
                onPress={() => setStep("browse")}
                hitSlop={4}
                style={s.backBtn}
                accessibilityRole="button"
                accessibilityLabel="Back to meets"
              >
                <Ionicons
                  name="chevron-back"
                  size={18}
                  color={olyColors.text.primary}
                />
              </Pressable>
              <Text style={s.head}>REQUEST A MEET</Text>
            </View>
            <ScrollView
              style={s.list}
              contentContainerStyle={s.listContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={s.fieldLabel}>MEET NAME</Text>
              <View style={[s.field, s.fieldRow]}>
                <TextInput
                  value={reqName}
                  onChangeText={setReqName}
                  placeholder="e.g. Okotoks Barbell Open"
                  placeholderTextColor={olyColors.text.hint}
                  selectionColor={olyColors.accent}
                  autoCapitalize="words"
                  style={s.fieldInput}
                />
              </View>

              <Text style={s.fieldLabel}>DATE</Text>
              <Pressable
                onPress={() => setDateOpen((v) => !v)}
                style={[s.field, s.fieldRow]}
                accessibilityRole="button"
                accessibilityLabel="Meet date"
              >
                <Text style={[s.fieldText, !reqDate && s.fieldPh]}>
                  {reqDate ? fmtLongDay(reqDate) : "Pick a date"}
                </Text>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={olyColors.text.secondary}
                />
              </Pressable>
              {dateOpen && (
                <DateTimePicker
                  value={reqDate ?? minRequestDate()}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  minimumDate={minRequestDate()}
                  themeVariant="dark"
                  textColor={olyColors.text.primary}
                  onChange={onDate}
                />
              )}

              <Text style={s.fieldLabel}>CITY</Text>
              <View style={[s.field, s.fieldRow]}>
                <TextInput
                  value={reqCity}
                  onChangeText={setReqCity}
                  placeholder="e.g. Okotoks, AB"
                  placeholderTextColor={olyColors.text.hint}
                  selectionColor={olyColors.accent}
                  autoCapitalize="words"
                  style={s.fieldInput}
                />
              </View>

              <Text style={s.fieldLabel}>EVENT LINK</Text>
              <View style={[s.field, s.fieldRow]}>
                <TextInput
                  value={reqLink}
                  onChangeText={setReqLink}
                  placeholder="Registration or federation page"
                  placeholderTextColor={olyColors.text.hint}
                  selectionColor={olyColors.accent}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  style={s.fieldInput}
                />
              </View>

              <View style={s.pending}>
                <View style={s.pendingHead}>
                  <Ionicons
                    name="time-outline"
                    size={15}
                    color={olyColors.text.secondary}
                  />
                  <Text style={s.pendingTitle}>Pending until approved</Text>
                </View>
                <Text style={s.pendingSub}>
                  We check it against the federation calendar within a day. It
                  shows on your card right away, and meet day olys pay once
                  it&apos;s approved.
                </Text>
              </View>
            </ScrollView>
            <View
              style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}
            >
              <OlyButton
                label="Send request"
                onPress={sendRequest}
                disabled={!canSend}
                preserveCase
                fullWidth
              />
            </View>
          </>
        )}
      </KeyboardAvoidingView>
      </SheetSurface>
    </Modal>
  );
}

/* ─── One meet ───────────────────────────────────────────────────── */

function MeetCard({
  m,
  on,
  onPress,
}: {
  m: Meet;
  on: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.card, on && s.cardOn, pressed && s.pressed]}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      accessibilityLabel={`${m.name}, ${fmtMeetDay(m.date)}, ${m.city}`}
    >
      <View style={s.cardTop}>
        <Text style={s.cardName} numberOfLines={1}>
          {m.name}
        </Text>
        <Text style={[s.cardDate, on && s.cardDateOn]}>
          {fmtMeetDay(m.date)}
        </Text>
      </View>
      <View style={s.cardBottom}>
        <Text style={[s.cardWhere, on && s.cardWhereOn]} numberOfLines={1}>
          {m.city} · {m.fed}
        </Text>
        {!!m.friends && (
          <View style={s.going}>
            <View style={s.faces}>
              {Array.from({ length: Math.min(3, m.friends) }, (_, i) => (
                <View
                  key={i}
                  style={[
                    s.face,
                    i > 0 && s.faceOverlap,
                    { backgroundColor: FACE_FILLS[i % FACE_FILLS.length] },
                    on && s.faceOn,
                  ]}
                />
              ))}
            </View>
            <Text style={[s.goingText, on && s.cardWhereOn]}>
              {m.friends} going
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────── */

const s = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: SHEET_SIDE,
    right: SHEET_SIDE,
    bottom: 0,
    paddingHorizontal: olySpacing[16],
    paddingTop: 10,
  },
  body: { flex: 1 },
  head: {
    textAlign: "center",
    fontFamily: olyFonts.medium,
    fontSize: 13,
    letterSpacing: 1.5,
    color: olyColors.text.secondary,
  },

  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 48,
    marginTop: olySpacing[16],
    paddingHorizontal: 18,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.inset,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
  },
  searchOn: { borderColor: olyColors.border.focus },
  searchInput: {
    flex: 1,
    height: "100%",
    fontFamily: olyFonts.regular,
    fontSize: 15,
    color: olyColors.text.primary,
  },

  chipsScroll: { flexGrow: 0, marginTop: olySpacing[12] },
  chips: { gap: olySpacing[8] },
  chip: {
    minHeight: 34,
    paddingHorizontal: 14,
    justifyContent: "center",
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.card,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
  },
  chipOn: {
    backgroundColor: olyColors.glass.accentFill,
    borderColor: olyColors.glass.accentBorder,
  },
  chipText: {
    fontFamily: olyFonts.bold,
    fontSize: 13,
    color: olyColors.text.secondary,
  },
  chipTextOn: { color: olyColors.text.primary },

  list: { flex: 1 },
  listContent: { paddingBottom: olySpacing[16] },
  group: {
    marginTop: olySpacing[24],
    marginBottom: 0,
    marginHorizontal: olySpacing[4],
    fontFamily: olyFonts.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: olyColors.text.secondary,
  },
  groupFirst: { marginTop: 18 },
  empty: {
    marginTop: olySpacing[32],
    textAlign: "center",
    fontFamily: olyFonts.regular,
    fontSize: 14,
    color: olyColors.text.hint,
  },

  card: {
    marginTop: olySpacing[8],
    paddingVertical: 18,
    paddingHorizontal: olySpacing[20],
    borderRadius: olyRadius.tile,
    backgroundColor: olyColors.glass.card,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
  },
  cardOn: {
    backgroundColor: olyColors.glass.accentFill,
    borderColor: olyColors.glass.accentBorder,
  },
  pressed: { opacity: 0.8 },
  cardTop: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: olySpacing[12],
  },
  cardName: {
    flex: 1,
    fontFamily: olyFonts.bold,
    fontSize: 16,
    letterSpacing: -0.2,
    color: olyColors.text.primary,
  },
  cardDate: {
    fontFamily: olyFonts.bold,
    fontSize: 13,
    color: olyColors.text.secondary,
  },
  cardDateOn: { color: olyColors.text.primary },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: olySpacing[12],
    marginTop: 10,
  },
  cardWhere: {
    flexShrink: 1,
    fontFamily: olyFonts.regular,
    fontSize: 13,
    color: olyColors.text.hint,
  },
  cardWhereOn: { color: olyColors.text.secondary },
  going: { flexDirection: "row", alignItems: "center", gap: olySpacing[8] },
  faces: { flexDirection: "row", alignItems: "center", paddingLeft: 2 },
  face: {
    width: 20,
    height: 20,
    borderRadius: olyRadius.full,
    borderWidth: 2,
    borderColor: olyColors.bg.card,
  },
  faceOverlap: { marginLeft: -6 },
  faceOn: { borderColor: olyColors.glass.accentBar },
  goingText: {
    fontFamily: olyFonts.regular,
    fontSize: 12,
    color: olyColors.text.hint,
  },

  footer: { paddingTop: olySpacing[12], gap: olySpacing[4] },
  cant: {
    minHeight: olyLayout.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  cantText: {
    fontFamily: olyFonts.regular,
    fontSize: 14,
    color: olyColors.text.secondary,
  },
  cantStrong: { fontFamily: olyFonts.bold, color: olyColors.text.primary },

  reqHead: { height: 44, justifyContent: "center" },
  backBtn: {
    position: "absolute",
    left: 0,
    width: olyLayout.minTouchTarget,
    height: olyLayout.minTouchTarget,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.card,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  fieldLabel: {
    marginTop: olySpacing[20],
    marginHorizontal: olySpacing[20],
    fontFamily: olyFonts.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: olyColors.text.secondary,
  },
  field: {
    marginTop: olySpacing[8],
    height: 50,
    paddingHorizontal: olySpacing[20],
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.inset,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
  },
  // Fills the pill so the text and placeholder sit dead center.
  fieldInput: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    fontFamily: olyFonts.regular,
    fontSize: 15,
    color: olyColors.text.primary,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fieldText: {
    fontFamily: olyFonts.regular,
    fontSize: 15,
    color: olyColors.text.primary,
  },
  fieldPh: { color: olyColors.text.hint },

  // A quiet footnote, not a card. Indented to the field text.
  pending: { marginTop: olySpacing[24], marginHorizontal: olySpacing[20] },
  pendingHead: { flexDirection: "row", alignItems: "center", gap: 6 },
  pendingTitle: {
    fontFamily: olyFonts.medium,
    fontSize: 14,
    color: olyColors.text.primary,
  },
  pendingSub: {
    marginTop: 6,
    fontFamily: olyFonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: olyColors.text.hint,
  },
});
