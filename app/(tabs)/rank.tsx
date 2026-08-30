import { useTabLoader } from "@/components/tab-loader";
import {
  AgeCategory,
  ATHLETES,
  Athlete,
  initials,
  LiftKey,
  MEN_CLASSES,
  prDate,
  Sex,
  sinclair,
  WOMEN_CLASSES,
  YOU,
} from "@/constants/leaderboard-data";
import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { scale } from "react-native-size-matters";

const HAIRLINE = "rgba(226,232,240,0.06)";
const ACCENT = "#2563eb"; // leaderboard accent
const MUTED = "#5c6673";

type Ranked = Athlete & { m: number; isYou?: boolean };
type ThemeColors = ReturnType<typeof useTheme>["colors"];

const LIFTS: { key: LiftKey; label: string }[] = [
  { key: "total", label: "Total" },
  { key: "sn", label: "Snatch" },
  { key: "cj", label: "C&J" },
  { key: "sinclair", label: "Sinclair" },
];

const liftName = (l: LiftKey) =>
  ({ total: "Total", sn: "Snatch", cj: "Clean & Jerk", sinclair: "Sinclair" }[l]);

export default function Rank() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { begin, end } = useTabLoader();

  // filters
  const [lift, setLift] = useState<LiftKey>("total");
  const [wclass, setWclass] = useState("81");
  const [sex, setSex] = useState<Sex>("M");
  const [age, setAge] = useState<AgeCategory | "all">("senior");
  const [country, setCountry] = useState<"COL" | "ALL">("COL");
  const [friendsOnly, setFriendsOnly] = useState(false);

  // dummy "fetch" so the tab loader behaves like it will with the real API
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    begin();
    const t = setTimeout(() => {
      setLoaded(true);
      end();
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [following, setFollowing] = useState<Record<number, boolean>>(() =>
    Object.fromEntries(ATHLETES.map((a) => [a.id, a.friend]))
  );

  // sheets
  const [filterSheet, setFilterSheet] = useState<
    null | "class" | "sex" | "age" | "country"
  >(null);
  const [athlete, setAthlete] = useState<Ranked | null>(null);

  const unit = lift === "sinclair" ? "" : "kg";

  const ranked: Ranked[] = useMemo(() => {
    const metric = (a: { sn: number; cj: number; bw: number; sex: Sex }): number => {
      if (lift === "sn") return a.sn;
      if (lift === "cj") return a.cj;
      if (lift === "sinclair") return Math.round(sinclair(a) * 10) / 10;
      return a.sn + a.cj;
    };
    const list: Ranked[] = ATHLETES.filter((a) => {
      if (lift !== "sinclair") {
        if (a.wclass !== wclass || a.sex !== sex) return false;
      }
      if (age !== "all" && a.age !== age) return false;
      if (country !== "ALL" && a.country !== country) return false;
      if (friendsOnly && !following[a.id]) return false;
      return true;
    }).map((a) => ({ ...a, m: metric(a) }));

    // you are ranked among them (verified state for the test build)
    const youQualifies =
      !friendsOnly &&
      (lift === "sinclair" || (YOU.wclass === wclass && YOU.sex === sex)) &&
      (age === "all" || YOU.age === age) &&
      (country === "ALL" || YOU.country === country);
    if (youQualifies) {
      list.push({ ...YOU, friend: false, m: metric(YOU), isYou: true });
    }
    return list.sort((a, b) => b.m - a.m);
  }, [lift, wclass, sex, age, country, friendsOnly, following]);

  const youIndex = ranked.findIndex((r) => r.isYou);
  const podium = ranked.length >= 3 ? ranked.slice(0, 3) : [];
  const rest = ranked.length >= 3 ? ranked.slice(3) : ranked;
  const startRank = ranked.length >= 3 ? 4 : 1;

  const classOptions = (sex === "M" ? MEN_CLASSES : WOMEN_CLASSES).map((c) => ({
    value: c,
    label: `${c} kg`,
  }));

  const styles = useMemo(() => makeStyles(colors), [colors]);

  const caption = (a: Athlete) => {
    let s = `${a.club} · ${a.country}`;
    if (lift === "sinclair") s += ` · ${a.sex}${a.wclass}`;
    if (a.age === "junior") s += " · Junior";
    if (a.age === "masters") s += " · Masters";
    return s;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.kicker}>RANK</Text>
        <Text style={styles.title}>Leaderboard</Text>

        <View style={styles.segments}>
          {LIFTS.map((l) => (
            <TouchableOpacity
              key={l.key}
              style={[styles.segment, lift === l.key && styles.segmentActive]}
              onPress={() => setLift(l.key)}
            >
              <Text
                style={[
                  styles.segmentText,
                  lift === l.key && styles.segmentTextActive,
                ]}
              >
                {l.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsRow}
        contentContainerStyle={styles.chipsContent}
      >
        <Chip
          label={`${wclass} kg`}
          dim={lift === "sinclair"}
          onPress={() => lift !== "sinclair" && setFilterSheet("class")}
          styles={styles}
        />
        <Chip
          label={sex === "M" ? "Men" : "Women"}
          dim={lift === "sinclair"}
          onPress={() => lift !== "sinclair" && setFilterSheet("sex")}
          styles={styles}
        />
        <Chip
          label={
            age === "all"
              ? "All ages"
              : age === "junior"
              ? "Junior"
              : age === "masters"
              ? "Masters"
              : "Senior"
          }
          onPress={() => setFilterSheet("age")}
          styles={styles}
        />
        <Chip
          label={country === "COL" ? "Colombia" : "World"}
          onPress={() => setFilterSheet("country")}
          styles={styles}
        />
        <Chip
          label="Friends"
          active={friendsOnly}
          onPress={() => setFriendsOnly((f) => !f)}
          styles={styles}
        />
      </ScrollView>

      {/* Board */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + scale(140) }}
        showsVerticalScrollIndicator={false}
      >
        {loaded && ranked.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No one is ranked here yet</Text>
            <Text style={styles.emptyText}>
              This board is wide open. Post a verified lift and take the #1 spot
              — someone has to be first.
            </Text>
            <TouchableOpacity style={styles.emptyBtn}>
              <Text style={styles.emptyBtnText}>Post a lift</Text>
            </TouchableOpacity>
          </View>
        )}

        {podium.length === 3 && (
          <View style={styles.podium}>
            {[1, 0, 2].map((i) => {
              const a = podium[i];
              const first = i === 0;
              return (
                <TouchableOpacity
                  key={a.id}
                  style={[styles.pSlot, first && styles.pSlotFirst]}
                  onPress={() => !a.isYou && setAthlete(a)}
                  activeOpacity={0.7}
                >
                  <View>
                    <View
                      style={[
                        styles.pAvatar,
                        first ? styles.pAvatarFirst : styles.pAvatarSide,
                      ]}
                    >
                      <Text
                        style={[
                          styles.pAvatarText,
                          first && styles.pAvatarTextFirst,
                        ]}
                      >
                        {initials(a.name)}
                      </Text>
                    </View>
                    <View style={[styles.pRank, first && styles.pRankFirst]}>
                      <Text
                        style={[styles.pRankText, first && styles.pRankTextFirst]}
                      >
                        {i + 1}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[styles.pName, first && styles.pNameFirst]}
                    numberOfLines={1}
                  >
                    {a.isYou ? "You" : a.name}
                  </Text>
                  <Text style={[styles.pKg, first && styles.pKgFirst]}>
                    {a.m}
                    <Text style={styles.pKgUnit}> {unit}</Text>
                  </Text>
                  <Text style={styles.pCaption} numberOfLines={1}>
                    {caption(a)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {rest.length > 0 && (
          <View style={styles.card}>
            {rest.map((a, idx) => (
              <TouchableOpacity
                key={a.id}
                style={[
                  styles.row,
                  idx > 0 && styles.rowBorder,
                  a.isYou && styles.rowMe,
                ]}
                onPress={() => !a.isYou && setAthlete(a)}
                activeOpacity={0.7}
              >
                <Text style={styles.rankNum}>{idx + startRank}</Text>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials(a.name)}</Text>
                </View>
                <View style={styles.rowInfo}>
                  <Text
                    style={[styles.rowName, a.isYou && styles.rowNameMe]}
                    numberOfLines={1}
                  >
                    {a.isYou ? "You" : a.name}
                  </Text>
                  <Text style={styles.rowSub} numberOfLines={1}>
                    {caption(a)}
                  </Text>
                </View>
                <Text style={styles.rowKg}>
                  {a.m}
                  <Text style={styles.rowKgUnit}> {unit}</Text>
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {ranked.length > 0 && (
          <Text style={styles.footnote}>Every ranked lift is video-verified</Text>
        )}
      </ScrollView>

      {/* Sticky You bar */}
      {youIndex >= 0 && (
        <View style={[styles.youBar, { bottom: insets.bottom + scale(100) }]}>
          <View>
            <Text style={styles.youRank}>{youIndex + 1}</Text>
            <Text style={styles.youRankLabel}>YOU</Text>
          </View>
          <View style={styles.youMid}>
            <Text style={styles.youName}>{YOU.name}</Text>
            <Text style={styles.youGap}>
              Snatch {YOU.sn} · C&J {YOU.cj}
            </Text>
          </View>
          <Text style={styles.youKg}>
            {ranked[youIndex].m}
            <Text style={styles.rowKgUnit}> {unit}</Text>
          </Text>
        </View>
      )}

      {/* Filter sheet */}
      <SheetModal
        visible={filterSheet !== null}
        onClose={() => setFilterSheet(null)}
        styles={styles}
      >
        {filterSheet === "class" && (
          <SheetOptions
            title="WEIGHT CLASS"
            options={classOptions}
            current={wclass}
            onPick={(v) => setWclass(v)}
            onClose={() => setFilterSheet(null)}
            styles={styles}
          />
        )}
        {filterSheet === "sex" && (
          <SheetOptions
            title="CATEGORY"
            options={[
              { value: "M", label: "Men" },
              { value: "F", label: "Women" },
            ]}
            current={sex}
            onPick={(v) => {
              setSex(v as Sex);
              setWclass(v === "M" ? "81" : "59");
            }}
            onClose={() => setFilterSheet(null)}
            styles={styles}
          />
        )}
        {filterSheet === "age" && (
          <SheetOptions
            title="AGE CATEGORY"
            options={[
              { value: "all", label: "All ages" },
              { value: "junior", label: "Junior · 15–20" },
              { value: "senior", label: "Senior" },
              { value: "masters", label: "Masters · 35+" },
            ]}
            current={age}
            onPick={(v) => setAge(v as AgeCategory | "all")}
            onClose={() => setFilterSheet(null)}
            styles={styles}
          />
        )}
        {filterSheet === "country" && (
          <SheetOptions
            title="REGION"
            options={[
              { value: "COL", label: "Colombia" },
              { value: "ALL", label: "All countries" },
            ]}
            current={country}
            onPick={(v) => setCountry(v as "COL" | "ALL")}
            onClose={() => setFilterSheet(null)}
            styles={styles}
          />
        )}
      </SheetModal>

      {/* Athlete sheet */}
      <SheetModal
        visible={athlete !== null}
        onClose={() => setAthlete(null)}
        styles={styles}
      >
        {athlete && (
          <AthleteSheet
            a={athlete}
            rank={ranked.findIndex((r) => r.id === athlete.id) + 1}
            lift={lift}
            unit={unit}
            following={!!following[athlete.id]}
            onToggleFollow={() =>
              setFollowing((f) => ({ ...f, [athlete.id]: !f[athlete.id] }))
            }
            styles={styles}
          />
        )}
      </SheetModal>
    </SafeAreaView>
  );
}

/* ---------- pieces ---------- */

type Styles = ReturnType<typeof makeStyles>;

function Chip({
  label,
  onPress,
  active,
  dim,
  styles,
}: {
  label: string;
  onPress: () => void;
  active?: boolean;
  dim?: boolean;
  styles: Styles;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive, dim && { opacity: 0.35 }]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function SheetModal({
  visible,
  onClose,
  children,
  styles,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  styles: Styles;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.sheetHandle} />
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SheetOptions({
  title,
  options,
  current,
  onPick,
  onClose,
  styles,
}: {
  title: string;
  options: { value: string; label: string }[];
  current: string;
  onPick: (v: string) => void;
  onClose: () => void;
  styles: Styles;
}) {
  return (
    <View>
      <Text style={styles.sheetTitle}>{title}</Text>
      {options.map((o, i) => (
        <TouchableOpacity
          key={o.value}
          style={[styles.sheetOpt, i > 0 && styles.rowBorder]}
          onPress={() => {
            onPick(o.value);
            onClose();
          }}
        >
          <Text style={styles.sheetOptText}>{o.label}</Text>
          {o.value === current && (
            <Ionicons name="checkmark" size={scale(16)} color={ACCENT} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function AthleteSheet({
  a,
  rank,
  lift,
  unit,
  following,
  onToggleFollow,
  styles,
}: {
  a: Ranked;
  rank: number;
  lift: LiftKey;
  unit: string;
  following: boolean;
  onToggleFollow: () => void;
  styles: Styles;
}) {
  const snPct = (a.sn / (a.sn + a.cj)) * 100;
  return (
    <View>
      {/* header */}
      <View style={styles.athHead}>
        <View style={[styles.avatar, styles.athAvatar]}>
          <Text style={styles.avatarText}>{initials(a.name)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.athNameRow}>
            <Text style={styles.athName}>{a.name}</Text>
            <View style={styles.rankPill}>
              <Text style={styles.rankPillText}>#{rank}</Text>
            </View>
          </View>
          <Text style={styles.athClub}>
            {a.club} · {a.country} · {a.sex}
            {a.wclass}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.followBtn, following && styles.followBtnOn]}
          onPress={onToggleFollow}
        >
          <Text style={[styles.followText, following && styles.followTextOn]}>
            {following ? "Following" : "Follow"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* stat band */}
      <View style={styles.statband}>
        <View style={styles.sbRow}>
          <View style={{ flex: 1.35 }}>
            <Text style={styles.sbHeroV}>
              {a.m}
              <Text style={styles.sbUnit}>{unit}</Text>
            </Text>
            <Text style={styles.sbK}>{liftName(lift).toUpperCase()}</Text>
          </View>
          <View style={styles.sbItem}>
            <Text style={styles.sbItemV}>
              {a.bw}
              <Text style={styles.sbUnit}>kg</Text>
            </Text>
            <Text style={styles.sbK}>BODYWEIGHT</Text>
          </View>
          <View style={styles.sbItem}>
            <Text style={styles.sbItemV}>
              {Math.round(sinclair(a))}
              <Text style={styles.sbUnit}>pts</Text>
            </Text>
            <Text style={styles.sbK}>SINCLAIR</Text>
          </View>
        </View>
        {/* snatch | c&j split */}
        <View style={styles.split}>
          <View style={[styles.splitSn, { flex: snPct }]} />
          <View style={[styles.splitCj, { flex: 100 - snPct }]} />
        </View>
        <View style={styles.splitLabels}>
          <Text style={styles.splitLabel}>SNATCH {a.sn}</Text>
          <Text style={styles.splitLabel}>C&J {a.cj}</Text>
        </View>
      </View>

      {/* videos */}
      <View style={styles.vidDuo}>
        {(["sn", "cj"] as const).map((k) => (
          <View key={k} style={styles.vidThumb}>
            <Text style={styles.vidLift}>
              {k === "sn" ? "SNATCH" : "CLEAN & JERK"}
            </Text>
            <View style={styles.playBtn}>
              <Ionicons
                name="play"
                size={scale(13)}
                color="#fff"
                style={{ marginLeft: 2 }}
              />
            </View>
            <Text style={styles.vidKg}>
              {k === "sn" ? a.sn : a.cj}
              <Text style={styles.rowKgUnit}> kg</Text>
            </Text>
            <Text style={styles.vidDate}>{prDate(a.id, k === "sn" ? 1 : 4)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ---------- styles ---------- */

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: scale(18), paddingTop: scale(8) },
    kicker: {
      fontSize: Typography.fontSize.xs,
      fontFamily: Typography.fontFamily.bold,
      letterSpacing: 2,
      color: MUTED,
    },
    title: {
      fontSize: Typography.fontSize["2xl"],
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
      marginTop: 2,
    },
    segments: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      borderRadius: scale(10),
      padding: scale(3),
      marginTop: scale(14),
    },
    segment: {
      flex: 1,
      alignItems: "center",
      paddingVertical: scale(7),
      borderRadius: scale(8),
    },
    segmentActive: { backgroundColor: ACCENT },
    segmentText: {
      fontSize: Typography.fontSize.base,
      fontFamily: Typography.fontFamily.medium,
      color: colors.textSecondary,
    },
    segmentTextActive: { color: "#fff", fontFamily: Typography.fontFamily.bold },
    chipsRow: { flexGrow: 0, marginTop: scale(12) },
    chipsContent: { paddingHorizontal: scale(18), gap: scale(6) },
    chip: {
      backgroundColor: colors.surface,
      borderRadius: scale(8),
      paddingVertical: scale(6),
      paddingHorizontal: scale(12),
    },
    chipActive: { backgroundColor: ACCENT },
    chipText: {
      fontSize: Typography.fontSize.xs,
      fontFamily: Typography.fontFamily.medium,
      color: colors.textSecondary,
    },
    chipTextActive: { color: "#fff" },
    scroll: { flex: 1, marginTop: scale(12), paddingHorizontal: scale(18) },

    /* podium */
    podium: {
      flexDirection: "row",
      alignItems: "flex-end",
      backgroundColor: colors.surface,
      borderRadius: scale(16),
      paddingTop: scale(24),
      paddingBottom: scale(18),
      paddingHorizontal: scale(6),
      marginBottom: scale(12),
    },
    pSlot: { width: "33.33%", alignItems: "center" },
    pSlotFirst: { paddingBottom: scale(26) },
    pAvatar: {
      borderRadius: 999,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    pAvatarFirst: {
      width: scale(78),
      height: scale(78),
      borderWidth: 2,
      borderColor: ACCENT,
    },
    pAvatarSide: { width: scale(54), height: scale(54) },
    pAvatarText: {
      fontSize: Typography.fontSize.md,
      fontFamily: Typography.fontFamily.bold,
      color: colors.textSecondary,
    },
    pAvatarTextFirst: { fontSize: Typography.fontSize.xl },
    pRank: {
      position: "absolute",
      bottom: -2,
      right: -2,
      width: scale(19),
      height: scale(19),
      borderRadius: 999,
      backgroundColor: colors.secondary,
      borderWidth: 2,
      borderColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    pRankFirst: { backgroundColor: ACCENT },
    pRankText: {
      fontSize: scale(9),
      fontFamily: Typography.fontFamily.bold,
      color: colors.textSecondary,
    },
    pRankTextFirst: { color: "#fff" },
    pName: {
      fontSize: Typography.fontSize.base,
      fontFamily: Typography.fontFamily.medium,
      color: colors.textSecondary,
      marginTop: scale(10),
      maxWidth: scale(100),
    },
    pNameFirst: {
      fontSize: Typography.fontSize.sm,
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
    },
    pKg: {
      fontSize: Typography.fontSize.lg,
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
      marginTop: 2,
    },
    pKgFirst: { fontSize: Typography.fontSize.xl },
    pKgUnit: {
      fontSize: Typography.fontSize.xs,
      color: MUTED,
      fontFamily: Typography.fontFamily.regular,
    },
    pCaption: {
      fontSize: scale(9),
      color: MUTED,
      marginTop: scale(4),
      maxWidth: scale(105),
    },

    /* list */
    card: {
      backgroundColor: colors.surface,
      borderRadius: scale(16),
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(11),
      paddingVertical: scale(12),
      paddingHorizontal: scale(14),
    },
    rowBorder: { borderTopWidth: 1, borderTopColor: HAIRLINE },
    rowMe: { backgroundColor: "rgba(37,99,235,0.14)" },
    rankNum: {
      width: scale(18),
      textAlign: "center",
      fontSize: Typography.fontSize.sm,
      fontFamily: Typography.fontFamily.bold,
      color: MUTED,
    },
    avatar: {
      width: scale(31),
      height: scale(31),
      borderRadius: 999,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontSize: scale(10),
      fontFamily: Typography.fontFamily.bold,
      color: colors.textSecondary,
    },
    rowInfo: { flex: 1, minWidth: 0 },
    rowName: {
      fontSize: Typography.fontSize.md,
      fontFamily: Typography.fontFamily.medium,
      color: colors.text,
    },
    rowNameMe: { fontFamily: Typography.fontFamily.bold },
    rowSub: { fontSize: scale(10), color: MUTED, marginTop: 2 },
    rowKg: {
      fontSize: Typography.fontSize.md,
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
    },
    rowKgUnit: {
      fontSize: scale(9),
      color: MUTED,
      fontFamily: Typography.fontFamily.regular,
    },
    footnote: {
      textAlign: "center",
      fontSize: scale(9),
      color: MUTED,
      marginTop: scale(16),
    },

    /* empty */
    empty: {
      alignItems: "center",
      paddingVertical: scale(56),
      paddingHorizontal: scale(24),
    },
    emptyTitle: {
      fontSize: Typography.fontSize.md,
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
      marginBottom: scale(8),
    },
    emptyText: {
      fontSize: Typography.fontSize.base,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: scale(18),
      marginBottom: scale(18),
    },
    emptyBtn: {
      backgroundColor: ACCENT,
      borderRadius: scale(10),
      paddingVertical: scale(11),
      paddingHorizontal: scale(26),
    },
    emptyBtnText: {
      color: "#fff",
      fontFamily: Typography.fontFamily.bold,
      fontSize: Typography.fontSize.sm,
    },

    /* you bar */
    youBar: {
      position: "absolute",
      left: scale(18),
      right: scale(18),
      flexDirection: "row",
      alignItems: "center",
      gap: scale(12),
      backgroundColor: colors.lightBlue,
      borderWidth: 1,
      borderColor: ACCENT,
      borderRadius: scale(14),
      paddingVertical: scale(11),
      paddingHorizontal: scale(14),
    },
    youRank: {
      fontSize: Typography.fontSize.md,
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
    },
    youRankLabel: { fontSize: scale(7), letterSpacing: 1, color: MUTED },
    youMid: { flex: 1 },
    youName: {
      fontSize: Typography.fontSize.sm,
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
    },
    youGap: { fontSize: scale(10), color: colors.textSecondary, marginTop: 2 },
    youKg: {
      fontSize: Typography.fontSize.md,
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
    },

    /* sheets */
    sheetBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: colors.headerBackground,
      borderTopLeftRadius: scale(22),
      borderTopRightRadius: scale(22),
      paddingHorizontal: scale(20),
      paddingTop: scale(10),
      paddingBottom: scale(28),
    },
    sheetHandle: {
      width: scale(34),
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.textSecondary,
      opacity: 0.4,
      alignSelf: "center",
      marginBottom: scale(16),
    },
    sheetTitle: {
      fontSize: scale(9),
      fontFamily: Typography.fontFamily.bold,
      letterSpacing: 1.6,
      color: MUTED,
      marginBottom: scale(8),
    },
    sheetOpt: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: scale(13),
    },
    sheetOptText: { fontSize: Typography.fontSize.md, color: colors.text },

    /* athlete sheet */
    athHead: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(12),
      marginBottom: scale(14),
    },
    athAvatar: { width: scale(42), height: scale(42) },
    athNameRow: { flexDirection: "row", alignItems: "center", gap: scale(7) },
    athName: {
      fontSize: Typography.fontSize.lg,
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
    },
    rankPill: {
      backgroundColor: ACCENT,
      borderRadius: scale(5),
      paddingHorizontal: scale(5),
      paddingVertical: 1.5,
    },
    rankPillText: {
      fontSize: scale(8),
      fontFamily: Typography.fontFamily.bold,
      color: "#fff",
    },
    athClub: {
      fontSize: Typography.fontSize.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    followBtn: {
      backgroundColor: ACCENT,
      borderRadius: scale(20),
      paddingVertical: scale(8),
      paddingHorizontal: scale(16),
    },
    followBtnOn: { backgroundColor: colors.secondary },
    followText: {
      fontSize: Typography.fontSize.xs,
      fontFamily: Typography.fontFamily.bold,
      color: "#fff",
    },
    followTextOn: { color: colors.textSecondary },

    statband: {
      backgroundColor: colors.surface,
      borderRadius: scale(14),
      paddingHorizontal: scale(16),
      paddingTop: scale(14),
      paddingBottom: scale(13),
      marginBottom: scale(12),
    },
    sbRow: { flexDirection: "row", alignItems: "flex-start" },
    sbItem: {
      flex: 1,
      paddingLeft: scale(16),
      borderLeftWidth: 1,
      borderLeftColor: HAIRLINE,
    },
    sbHeroV: {
      fontSize: scale(24),
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
    },
    sbItemV: {
      fontSize: Typography.fontSize.md,
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
      paddingTop: scale(6),
    },
    sbUnit: {
      fontSize: scale(10),
      color: MUTED,
      fontFamily: Typography.fontFamily.regular,
    },
    sbK: {
      fontSize: scale(7.5),
      fontFamily: Typography.fontFamily.bold,
      letterSpacing: 1.2,
      color: MUTED,
      marginTop: scale(6),
    },
    split: {
      flexDirection: "row",
      gap: 2,
      height: 4,
      borderRadius: 2,
      overflow: "hidden",
      marginTop: scale(12),
    },
    splitSn: { backgroundColor: ACCENT, borderRadius: 2 },
    splitCj: { backgroundColor: "#5c8df6", borderRadius: 2 },
    splitLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: scale(5),
    },
    splitLabel: {
      fontSize: scale(7.5),
      fontFamily: Typography.fontFamily.bold,
      letterSpacing: 1,
      color: MUTED,
    },

    vidDuo: { flexDirection: "row", gap: scale(10) },
    vidThumb: {
      flex: 1,
      height: scale(118),
      borderRadius: scale(14),
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    vidLift: {
      position: "absolute",
      top: scale(11),
      left: scale(13),
      fontSize: scale(8.5),
      fontFamily: Typography.fontFamily.bold,
      letterSpacing: 1.2,
      color: MUTED,
    },
    playBtn: {
      width: scale(34),
      height: scale(34),
      borderRadius: 999,
      backgroundColor: ACCENT,
      alignItems: "center",
      justifyContent: "center",
    },
    vidKg: {
      position: "absolute",
      bottom: scale(9),
      left: scale(13),
      fontSize: Typography.fontSize.lg,
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
    },
    vidDate: {
      position: "absolute",
      bottom: scale(12),
      right: scale(13),
      fontSize: scale(8.5),
      color: MUTED,
    },
  });
}
