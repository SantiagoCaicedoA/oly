import { useTabLoader } from "@/components/tab-loader";
import {
  AgeCategory,
  ATHLETES,
  Athlete,
  LiftKey,
  MEN_CLASSES,
  prDate,
  Sex,
  sinclair,
  WOMEN_CLASSES,
  YOU,
} from "@/constants/leaderboard-data";
import { OlyAvatar } from "@/src/oly-components/atoms/OlyAvatar";
import { OlySelectionChip } from "@/src/oly-components/atoms/OlySelectionChip";
import { OlySegmentedControl } from "@/src/oly-components/molecules/OlySegmentedControl";
import { OlyScreenWrapper } from "@/src/oly-components/organisms/OlyScreenWrapper";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyElevation, olyOverlay } from "@/src/oly-theme/oly-elevation";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import {
  olyLetterSpacing,
  olyTypography,
} from "@/src/oly-theme/oly-typography";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Ranked = Athlete & { m: number; isYou?: boolean };

const LIFT_KEYS: LiftKey[] = ["total", "sn", "cj", "sinclair"];
const LIFT_LABELS = ["Total", "Snatch", "C&J", "Sinclair"];

const liftName = (l: LiftKey) =>
  ({ total: "Total", sn: "Snatch", cj: "Clean & Jerk", sinclair: "Sinclair" }[l]);

/** Tab bar (64) + its bottom margin (28) + one card gap */
const TAB_BAR_CLEARANCE = 64 + 28 + olySpacing[12];

export default function Rank() {
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

  const unit = lift === "sinclair" ? "pts" : "kg";

  const ranked: Ranked[] = useMemo(() => {
    const metric = (a: {
      sn: number;
      cj: number;
      bw: number;
      sex: Sex;
    }): number => {
      if (lift === "sn") return a.sn;
      if (lift === "cj") return a.cj;
      if (lift === "sinclair") return Math.round(sinclair(a));
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

  const caption = (a: Athlete) => {
    let s = `${a.club} · ${a.country}`;
    if (lift === "sinclair") s += ` · ${a.sex}${a.wclass}`;
    if (a.age === "junior") s += " · Junior";
    if (a.age === "masters") s += " · Masters";
    return s;
  };

  return (
    <OlyScreenWrapper padded={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.kicker}>RANK</Text>
        <Text style={styles.title}>Leaderboard</Text>
        <OlySegmentedControl
          segments={LIFT_LABELS}
          activeIndex={LIFT_KEYS.indexOf(lift)}
          onChange={(i) => setLift(LIFT_KEYS[i])}
          style={styles.segments}
        />
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsRow}
        contentContainerStyle={styles.chipsContent}
      >
        <OlySelectionChip
          label={`${wclass} kg`}
          selected={false}
          onPress={() => lift !== "sinclair" && setFilterSheet("class")}
          style={lift === "sinclair" ? styles.chipDim : undefined}
        />
        <OlySelectionChip
          label={sex === "M" ? "Men" : "Women"}
          selected={false}
          onPress={() => lift !== "sinclair" && setFilterSheet("sex")}
          style={lift === "sinclair" ? styles.chipDim : undefined}
        />
        <OlySelectionChip
          label={
            age === "all"
              ? "All ages"
              : age === "junior"
              ? "Junior"
              : age === "masters"
              ? "Masters"
              : "Senior"
          }
          selected={false}
          onPress={() => setFilterSheet("age")}
        />
        <OlySelectionChip
          label={country === "COL" ? "Colombia" : "World"}
          selected={false}
          onPress={() => setFilterSheet("country")}
        />
        <OlySelectionChip
          label="Friends"
          selected={friendsOnly}
          onPress={() => setFriendsOnly((f) => !f)}
        />
      </ScrollView>

      {/* Board */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingBottom: insets.bottom + TAB_BAR_CLEARANCE + olySpacing[40] + olySpacing[24],
        }}
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
              <Text style={styles.emptyBtnText}>POST A LIFT</Text>
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
                    <OlyAvatar
                      name={a.isYou ? "You" : a.name}
                      size={first ? "large" : "medium"}
                      showBorder={first}
                    />
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
                    <Text style={styles.unitText}> {unit}</Text>
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
                <OlyAvatar name={a.isYou ? "You" : a.name} size="small" />
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
                  <Text style={styles.unitText}> {unit}</Text>
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
        <View
          style={[styles.youBar, { bottom: insets.bottom + TAB_BAR_CLEARANCE }]}
        >
          <View style={styles.youRankBlock}>
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
            <Text style={styles.unitText}> {unit}</Text>
          </Text>
        </View>
      )}

      {/* Filter sheet */}
      <SheetModal visible={filterSheet !== null} onClose={() => setFilterSheet(null)}>
        {filterSheet === "class" && (
          <SheetOptions
            title="WEIGHT CLASS"
            options={classOptions}
            current={wclass}
            onPick={(v) => setWclass(v)}
            onClose={() => setFilterSheet(null)}
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
          />
        )}
      </SheetModal>

      {/* Athlete sheet */}
      <SheetModal visible={athlete !== null} onClose={() => setAthlete(null)}>
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
          />
        )}
      </SheetModal>
    </OlyScreenWrapper>
  );
}

/* ---------- pieces ---------- */

function SheetModal({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
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
}: {
  title: string;
  options: { value: string; label: string }[];
  current: string;
  onPick: (v: string) => void;
  onClose: () => void;
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
            <Ionicons
              name="checkmark"
              size={20}
              color={olyColors.text.primary}
            />
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
}: {
  a: Ranked;
  rank: number;
  lift: LiftKey;
  unit: string;
  following: boolean;
  onToggleFollow: () => void;
}) {
  const snPct = (a.sn / (a.sn + a.cj)) * 100;
  return (
    <View>
      {/* header */}
      <View style={styles.athHead}>
        <OlyAvatar name={a.name} size="medium" />
        <View style={styles.athHeadMid}>
          <View style={styles.athNameRow}>
            <Text style={styles.athName} numberOfLines={1}>
              {a.name}
            </Text>
            <View style={styles.rankPill}>
              <Text style={styles.rankPillText}>#{rank}</Text>
            </View>
          </View>
          <Text style={styles.athClub} numberOfLines={1}>
            {a.club} · {a.country} · {a.sex}
            {a.wclass}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.followBtn, following && styles.followBtnOn]}
          onPress={onToggleFollow}
        >
          <Text style={[styles.followText, following && styles.followTextOn]}>
            {following ? "FOLLOWING" : "FOLLOW"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* stat band */}
      <View style={styles.statband}>
        <View style={styles.sbRow}>
          <View style={styles.sbHero}>
            <Text style={styles.sbHeroV}>
              {a.m}
              <Text style={styles.unitText}> {unit}</Text>
            </Text>
            <Text style={styles.sbK}>{liftName(lift).toUpperCase()}</Text>
          </View>
          <View style={styles.sbItem}>
            <Text style={styles.sbItemV}>
              {a.bw}
              <Text style={styles.unitText}> kg</Text>
            </Text>
            <Text style={styles.sbK}>BODYWEIGHT</Text>
          </View>
          <View style={styles.sbItem}>
            <Text style={styles.sbItemV}>
              {Math.round(sinclair(a))}
              <Text style={styles.unitText}> pts</Text>
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
                size={16}
                color={olyColors.text.onBrand}
                style={styles.playIcon}
              />
            </View>
            <Text style={styles.vidKg}>
              {k === "sn" ? a.sn : a.cj}
              <Text style={styles.unitText}> kg</Text>
            </Text>
            <Text style={styles.vidDate}>{prDate(a.id, k === "sn" ? 1 : 4)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ---------- styles (Design Bible v3.0 tokens only) ---------- */

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: olyLayout.screenPadding,
    paddingTop: olySpacing[8],
  },
  kicker: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  title: {
    ...olyTypography.title1,
    color: olyColors.text.primary,
  },
  segments: {
    marginTop: olySpacing[16],
  },
  chipsRow: { flexGrow: 0, marginTop: olySpacing[12] },
  chipsContent: {
    paddingHorizontal: olyLayout.screenPadding,
    gap: olySpacing[8],
  },
  chipDim: { opacity: 0.3 },
  scroll: {
    flex: 1,
    marginTop: olySpacing[12],
    paddingHorizontal: olyLayout.screenPadding,
  },
  unitText: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },

  /* podium */
  podium: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: olyColors.bg.card,
    borderRadius: olyRadius.lg,
    paddingTop: olySpacing[24],
    paddingBottom: olySpacing[16],
    paddingHorizontal: olySpacing[8],
    marginBottom: olyLayout.cardGap,
  },
  pSlot: { width: "33.33%", alignItems: "center" },
  pSlotFirst: { paddingBottom: olySpacing[24] },
  pRank: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.cardElevated,
    borderWidth: 2,
    borderColor: olyColors.bg.card,
    alignItems: "center",
    justifyContent: "center",
  },
  pRankFirst: { backgroundColor: olyPalette.primary },
  pRankText: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },
  pRankTextFirst: { color: olyColors.text.onBrand },
  pName: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    marginTop: olySpacing[8],
    maxWidth: 104,
  },
  pNameFirst: {
    ...olyTypography.bodySmall,
    fontFamily: olyTypography.label.fontFamily,
    color: olyColors.text.primary,
  },
  pKg: {
    ...olyTypography.number,
    color: olyColors.text.primary,
  },
  pKgFirst: {
    ...olyTypography.title2,
  },
  pCaption: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
    marginTop: olySpacing[4],
    maxWidth: 108,
  },

  /* list */
  card: {
    backgroundColor: olyColors.bg.card,
    borderRadius: olyRadius.lg,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[12],
    paddingVertical: olySpacing[12],
    paddingHorizontal: olyLayout.cardPadding,
  },
  rowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: olyColors.border.default,
  },
  rowMe: { backgroundColor: olyColors.bg.subtleHighlight },
  rankNum: {
    width: 20,
    textAlign: "center",
    ...olyTypography.bodySmall,
    fontFamily: olyTypography.label.fontFamily,
    color: olyColors.text.disabled,
  },
  rowInfo: { flex: 1, minWidth: 0 },
  rowName: {
    ...olyTypography.body,
    color: olyColors.text.primary,
  },
  rowNameMe: { fontFamily: olyTypography.label.fontFamily },
  rowSub: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },
  rowKg: {
    ...olyTypography.bodySmall,
    fontFamily: olyTypography.label.fontFamily,
    color: olyColors.text.primary,
  },
  footnote: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
    textAlign: "center",
    marginTop: olySpacing[16],
  },

  /* empty */
  empty: {
    alignItems: "center",
    paddingVertical: olySpacing[40],
    paddingHorizontal: olySpacing[24],
  },
  emptyTitle: {
    ...olyTypography.body,
    fontFamily: olyTypography.label.fontFamily,
    color: olyColors.text.primary,
    marginBottom: olySpacing[8],
  },
  emptyText: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    textAlign: "center",
    marginBottom: olySpacing[16],
  },
  emptyBtn: {
    backgroundColor: olyPalette.primary,
    borderRadius: olyRadius.full,
    paddingVertical: olySpacing[12],
    paddingHorizontal: olySpacing[24],
  },
  emptyBtnText: {
    ...olyTypography.button,
    color: olyColors.text.onBrand,
    letterSpacing: olyLetterSpacing.uppercase,
  },

  /* you bar */
  youBar: {
    position: "absolute",
    left: olyLayout.screenPadding,
    right: olyLayout.screenPadding,
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[12],
    backgroundColor: olyPalette.cardElevated,
    borderWidth: 1,
    borderColor: olyColors.border.brand,
    borderRadius: olyRadius.lg,
    paddingVertical: olySpacing[12],
    paddingHorizontal: olyLayout.cardPadding,
  },
  youRankBlock: { alignItems: "center", minWidth: 28 },
  youRank: {
    ...olyTypography.number,
    color: olyColors.text.primary,
  },
  youRankLabel: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  youMid: { flex: 1 },
  youName: {
    ...olyTypography.bodySmall,
    fontFamily: olyTypography.label.fontFamily,
    color: olyColors.text.primary,
  },
  youGap: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },
  youKg: {
    ...olyTypography.number,
    color: olyColors.text.primary,
  },

  /* sheets */
  sheetBackdrop: {
    flex: 1,
    backgroundColor: olyOverlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: olyColors.bg.card,
    borderTopLeftRadius: olyRadius.lg,
    borderTopRightRadius: olyRadius.lg,
    paddingHorizontal: olyLayout.cardPadding,
    paddingTop: olySpacing[12],
    paddingBottom: olySpacing[32],
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: olyRadius.sm,
    backgroundColor: olyColors.text.disabled,
    alignSelf: "center",
    marginBottom: olySpacing[16],
  },
  sheetTitle: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
    letterSpacing: olyLetterSpacing.uppercase,
    marginBottom: olySpacing[8],
  },
  sheetOpt: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: olySpacing[16],
  },
  sheetOptText: {
    ...olyTypography.body,
    color: olyColors.text.primary,
  },

  /* athlete sheet */
  athHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[12],
    marginBottom: olySpacing[16],
  },
  athHeadMid: { flex: 1, minWidth: 0 },
  athNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[8],
  },
  athName: {
    ...olyTypography.body,
    fontFamily: olyTypography.label.fontFamily,
    color: olyColors.text.primary,
    flexShrink: 1,
  },
  rankPill: {
    backgroundColor: olyPalette.primary,
    borderRadius: olyRadius.sm,
    paddingHorizontal: olySpacing[4],
    paddingVertical: 2,
  },
  rankPillText: {
    ...olyTypography.caption,
    color: olyColors.text.onBrand,
  },
  athClub: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
  },
  followBtn: {
    backgroundColor: olyPalette.primary,
    borderRadius: olyRadius.full,
    paddingVertical: olySpacing[8],
    paddingHorizontal: olySpacing[16],
  },
  followBtnOn: { backgroundColor: olyPalette.cardElevated },
  followText: {
    ...olyTypography.caption,
    fontFamily: olyTypography.label.fontFamily,
    color: olyColors.text.onBrand,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  followTextOn: { color: olyColors.text.secondary },

  statband: {
    backgroundColor: olyElevation.level2.backgroundColor,
    borderRadius: olyRadius.lg,
    padding: olyLayout.cardPadding,
    marginBottom: olyLayout.cardGap,
  },
  sbRow: { flexDirection: "row", alignItems: "flex-start" },
  sbHero: { flex: 1.35 },
  sbItem: {
    flex: 1,
    paddingLeft: olySpacing[16],
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: olyColors.border.default,
  },
  sbHeroV: {
    ...olyTypography.display,
    color: olyColors.text.primary,
  },
  sbItemV: {
    ...olyTypography.bodySmall,
    fontFamily: olyTypography.label.fontFamily,
    color: olyColors.text.primary,
    paddingTop: olySpacing[8],
  },
  sbK: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
    letterSpacing: olyLetterSpacing.uppercase,
    marginTop: olySpacing[4],
  },
  split: {
    flexDirection: "row",
    gap: 2,
    height: olySpacing[4],
    borderRadius: olyRadius.sm,
    overflow: "hidden",
    marginTop: olySpacing[12],
  },
  splitSn: { backgroundColor: olyPalette.primary, borderRadius: olyRadius.sm },
  splitCj: {
    backgroundColor: olyColors.bg.cardUnselected,
    borderRadius: olyRadius.sm,
  },
  splitLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: olySpacing[4],
  },
  splitLabel: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
    letterSpacing: olyLetterSpacing.uppercase,
  },

  vidDuo: { flexDirection: "row", gap: olySpacing[12] },
  vidThumb: {
    flex: 1,
    height: 128,
    borderRadius: olyRadius.lg,
    backgroundColor: olyElevation.level2.backgroundColor,
    alignItems: "center",
    justifyContent: "center",
  },
  vidLift: {
    position: "absolute",
    top: olySpacing[12],
    left: olySpacing[12],
    ...olyTypography.caption,
    color: olyColors.text.disabled,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: { marginLeft: 2 },
  vidKg: {
    ...olyTypography.number,
    color: olyColors.text.primary,
    position: "absolute",
    bottom: olySpacing[8],
    left: olySpacing[12],
  },
  vidDate: {
    position: "absolute",
    bottom: olySpacing[12],
    right: olySpacing[12],
    ...olyTypography.caption,
    color: olyColors.text.disabled,
  },
});
