import { useTabLoader } from "@/components/tab-loader";
import { COUNTRIES, MEN_CLASSES, WOMEN_CLASSES } from "@/constants/leaderboard-data";
import {
  useFollowAthleteMutation,
  useGetAthleteCardQuery,
  useGetCurrentSeasonQuery,
  useGetFriendsBoardQuery,
  useGetLeaderboardQuery,
  useGetMyRankQuery,
  useLazyGetLeaderboardQuery,
  useUnfollowAthleteMutation,
} from "@/store/api";
import type {
  ApiAge,
  ApiLift,
  ApiSex,
  BoardParams,
  BoardRow,
  SeasonMeta,
} from "@/types/api/leaderboard";
import { OlyAvatar } from "@/src/oly-components/atoms/OlyAvatar";
import { OlyScreenWrapper } from "@/src/oly-components/organisms/OlyScreenWrapper";
import * as Haptics from "expo-haptics";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyElevation, olyOverlay } from "@/src/oly-theme/oly-elevation";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import {
  olyLetterSpacing,
  olyTypography,
} from "@/src/oly-theme/oly-typography";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

/** UI lift keys map 1:1 onto the API's lift values. */
type LiftKey = "total" | "sn" | "cj" | "sinclair";
const LIFT_KEYS: LiftKey[] = ["total", "sn", "cj", "sinclair"];
const LIFT_LABELS = ["Total", "Snatch", "C&J", "Sinclair"];
const API_LIFT: Record<LiftKey, ApiLift> = {
  total: "total",
  sn: "snatch",
  cj: "cleanjerk",
  sinclair: "sinclair",
};

const liftName = (l: LiftKey) =>
  ({ total: "Total", sn: "Snatch", cj: "Clean & Jerk", sinclair: "Sinclair" }[l]);

/** Row shape the board renders — a light view over the API's BoardRow. */
type Ranked = {
  key: string;
  userId: string;
  rank: number;
  name: string;
  club: string | null;
  country: string;
  sex: ApiSex;
  wclass: string;
  ageCategories: string[];
  m: number;
  sn: number | null;
  cj: number | null;
  bw: number | null;
  sinclair: number | null;
  pending: boolean;
  achievedAt: string | null;
  isYou: boolean;
};

const toRanked = (r: BoardRow, myId: string | undefined): Ranked => ({
  key: `${r.user.id}-${r.user.weightClass}`,
  userId: r.user.id,
  rank: r.rank,
  name: r.user.name,
  club: r.user.club,
  country: r.user.countryCode,
  sex: r.user.sex,
  wclass: r.user.weightClass,
  ageCategories: r.user.ageCategories ?? ["open"],
  m: r.value,
  sn: r.snatchKg,
  cj: r.cleanKg,
  bw: r.bodyweightKg,
  sinclair: r.sinclair,
  pending: !!r.pendingReview,
  achievedAt: r.achievedAt,
  isYou: !!myId && r.user.id === myId,
});

const fmtDate = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "";

/** Tab bar (64) + its bottom margin (28) + one card gap */
const TAB_BAR_CLEARANCE = 64 + 28 + olySpacing[4];

/**
 * Concentric corner: container uses olyRadius.lg (12) with olySpacing[4]
 * inner padding, so nested pills use 12 - 4 = 8 to stay optically aligned.
 */
const NESTED_RADIUS = olyRadius.lg - olySpacing[4];

/**
 * Quiet segmented control for the leaderboard (reference design):
 * neutral card surface, no outer border, blue reserved for the active pill.
 * Local to this screen — the shared OlySegmentedControl (bordered, ALL-CAPS)
 * stays untouched for onboarding.
 */
function LiftSegments({
  segments,
  activeIndex,
  onChange,
  style,
}: {
  segments: string[];
  activeIndex: number;
  onChange: (index: number) => void;
  style?: object;
}) {
  return (
    <View style={[styles.segments, style]}>
      {segments.map((label, index) => {
        const active = index === activeIndex;
        return (
          <Pressable
            key={label}
            onPress={() => {
              if (index !== activeIndex) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onChange(index);
              }
            }}
            style={[styles.segment, active && styles.segmentActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={label}
          >
            <Text
              style={[
                styles.segmentLabel,
                active ? styles.segmentLabelActive : styles.segmentLabelIdle,
              ]}
              maxFontSizeMultiplier={1.3}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * Quiet filter chip (reference design): neutral surface, secondary text,
 * blue only when toggled on. Local to this screen — the shared
 * OlySelectionChip (blue-tinted unselected + brand border) is for
 * onboarding multi-select grids.
 */
function FilterChip({
  label,
  active = false,
  chevron = false,
  onPress,
}: {
  label: string;
  active?: boolean;
  chevron?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={[styles.chip, active && styles.chipActive]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      {active && (
        <Ionicons
          name="checkmark"
          size={12}
          color={olyColors.text.onBrand}
        />
      )}
      <Text
        style={[styles.chipLabel, active && styles.chipLabelActive]}
        maxFontSizeMultiplier={1.3}
      >
        {label}
      </Text>
      {chevron && (
        <Ionicons
          name="chevron-down"
          size={12}
          color={olyColors.text.secondary}
        />
      )}
    </Pressable>
  );
}

export default function Rank() {
  const insets = useSafeAreaInsets();
  const { begin, end } = useTabLoader();
  const myId: string | undefined = useSelector(
    (s: any) => s?.auth?.user?._id ?? undefined
  );
  const myName: string = useSelector(
    (s: any) => s?.auth?.user?.name ?? "You"
  );

  // filters — Open is the default board (no age restriction, §4.2)
  const [scope, setScope] = useState<"season" | "alltime">("season");
  const [lift, setLift] = useState<LiftKey>("total");
  const [wclass, setWclass] = useState("88");
  const [sex, setSex] = useState<ApiSex>("M");
  const [age, setAge] = useState<ApiAge>("open");
  const [country, setCountry] = useState<string>("COL");
  const [friendsOnly, setFriendsOnly] = useState(false);

  const params: BoardParams = useMemo(
    () => ({
      lift: API_LIFT[lift],
      scope,
      sex,
      age,
      class: lift === "sinclair" ? undefined : wclass,
      country: country === "ALL" ? undefined : country,
      limit: 50,
    }),
    [lift, scope, sex, age, wclass, country]
  );

  // live data — the board is viewer-independent (cacheable); /me rides
  // alongside; the friends board replaces both when toggled.
  const seasonQ = useGetCurrentSeasonQuery();
  const boardQ = useGetLeaderboardQuery(params, { skip: friendsOnly });
  const friendsQ = useGetFriendsBoardQuery(params, { skip: !friendsOnly });
  const meQ = useGetMyRankQuery(params, { skip: friendsOnly });
  const [fetchMore, moreQ] = useLazyGetLeaderboardQuery();

  // cursor pagination: extra pages accumulate locally, reset on any filter change
  const [extra, setExtra] = useState<BoardRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const paramsKey = JSON.stringify(params) + (friendsOnly ? "|f" : "");
  useEffect(() => {
    setExtra([]);
    setNextCursor(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);
  useEffect(() => {
    if (!friendsOnly && boardQ.data) setNextCursor(boardQ.data.nextCursor);
  }, [boardQ.data, friendsOnly]);

  const loadMore = async () => {
    if (!nextCursor || moreQ.isFetching) return;
    const page = await fetchMore({ ...params, cursor: nextCursor }).unwrap();
    setExtra((e) => [...e, ...page.entries]);
    setNextCursor(page.nextCursor);
  };

  // tab loader mirrors the first real fetch
  const firstLoading = friendsOnly ? friendsQ.isLoading : boardQ.isLoading;
  useEffect(() => {
    begin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!firstLoading) end();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstLoading]);

  const isError = friendsOnly ? friendsQ.isError : boardQ.isError;
  const refetch = friendsOnly ? friendsQ.refetch : boardQ.refetch;

  const season: SeasonMeta | null =
    (friendsOnly ? friendsQ.data?.season : boardQ.data?.season) ??
    seasonQ.data?.season ??
    null;
  const me = !friendsOnly ? meQ.data?.me ?? null : null;

  // sheets
  const [filterSheet, setFilterSheet] = useState<
    null | "scope" | "class" | "sex" | "age" | "country"
  >(null);
  const [athlete, setAthlete] = useState<Ranked | null>(null);

  const unit = lift === "sinclair" ? "pts" : "kg";

  const ranked: Ranked[] = useMemo(() => {
    const rows = friendsOnly
      ? friendsQ.data?.entries ?? []
      : [...(boardQ.data?.entries ?? []), ...extra];
    return rows.map((r) => toRanked(r, myId));
  }, [friendsOnly, friendsQ.data, boardQ.data, extra, myId]);

  const youIndex = ranked.findIndex((r) => r.isYou);
  const youBarBottom = Math.max(TAB_BAR_CLEARANCE - insets.bottom, olySpacing[8]);

  // The sticky bar shows whenever I have a rank on this board and my own
  // row isn't currently visible (or isn't on the fetched pages at all).
  const showYouBar = !friendsOnly && !!me;

  // Sticky You bar hides while your own row is visible in the list
  const YOU_BAR_HEIGHT = 64;
  const [youRowVisible, setYouRowVisible] = useState(false);
  const layoutRef = React.useRef({
    scrollY: 0,
    viewportH: 0,
    cardY: 0,
    rowY: null as number | null,
    rowH: 0,
    inPodium: false,
  });
  const recomputeYouVisible = () => {
    const L = layoutRef.current;
    if (L.rowY == null || L.viewportH === 0) return;
    const top = (L.inPodium ? 0 : L.cardY) + L.rowY;
    const bottom = top + L.rowH;
    const visibleBottomEdge =
      L.scrollY + L.viewportH - (youBarBottom + YOU_BAR_HEIGHT);
    const visible = bottom > L.scrollY && top < visibleBottomEdge;
    setYouRowVisible((v) => (v === visible ? v : visible));
  };
  useEffect(() => {
    // my row left the fetched set (filters changed) — bar comes back
    if (youIndex < 0) setYouRowVisible(false);
  }, [youIndex]);

  // Podium only when this list truly starts at #1
  const hasPodium = ranked.length >= 3 && ranked[0].rank === 1;
  const podium = hasPodium ? ranked.slice(0, 3) : [];
  const rest = hasPodium ? ranked.slice(3) : ranked;

  const classOptions = (sex === "M" ? MEN_CLASSES : WOMEN_CLASSES).map((c) => ({
    value: c,
    label: `${c} kg`,
  }));

  const caption = (a: Ranked) => {
    let s = `${a.club ?? "Independent"} · ${a.country}`;
    if (lift === "sinclair") s += ` · ${a.sex}${a.wclass}`;
    if (a.ageCategories.includes("junior")) s += " · Junior";
    if (a.ageCategories.includes("masters")) s += " · Masters";
    return s;
  };

  const openPostFlow = () => router.push("/athlete/create-new-post");

  return (
    <OlyScreenWrapper padded={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.kicker}>RANK</Text>
        <Text style={styles.title}>Leaderboard</Text>
        <LiftSegments
          segments={LIFT_LABELS}
          activeIndex={LIFT_KEYS.indexOf(lift)}
          onChange={(i) => setLift(LIFT_KEYS[i])}
          style={styles.segmentsSpacing}
        />
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsRow}
        contentContainerStyle={styles.chipsContent}
      >
        <FilterChip
          label={
            scope === "season" ? season?.label ?? "Season" : "All-time"
          }
          chevron
          onPress={() => setFilterSheet("scope")}
        />
        {lift !== "sinclair" && (
          <FilterChip
            label={`${wclass} kg`}
            chevron
            onPress={() => setFilterSheet("class")}
          />
        )}
        {lift !== "sinclair" && (
          <FilterChip
            label={sex === "M" ? "Men" : "Women"}
            chevron
            onPress={() => setFilterSheet("sex")}
          />
        )}
        <FilterChip
          label={age === "junior" ? "Junior" : age === "masters" ? "Masters" : "Open"}
          chevron
          onPress={() => setFilterSheet("age")}
        />
        <FilterChip
          label={
            country === "ALL"
              ? "World"
              : COUNTRIES.find((c) => c.code === country)?.name ?? country
          }
          chevron
          onPress={() => setFilterSheet("country")}
        />
        <FilterChip
          label="Friends"
          active={friendsOnly}
          onPress={() => setFriendsOnly((f) => !f)}
        />
      </ScrollView>

      {/* Board */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingBottom:
            youBarBottom +
            olySpacing[12] +
            (showYouBar && !(youRowVisible && youIndex >= 0)
              ? YOU_BAR_HEIGHT + olySpacing[12]
              : 0),
        }}
        showsVerticalScrollIndicator={false}
        onLayout={(e) => {
          layoutRef.current.viewportH = e.nativeEvent.layout.height;
          recomputeYouVisible();
        }}
        onScroll={(e) => {
          layoutRef.current.scrollY = e.nativeEvent.contentOffset.y;
          recomputeYouVisible();
        }}
        scrollEventThrottle={32}
      >
        {isError && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Couldn’t load the board</Text>
            <Text style={styles.emptyText}>
              Check your connection and try again.
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => refetch()}>
              <Text style={styles.emptyBtnText}>RETRY</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isError && !firstLoading && ranked.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              {friendsOnly ? "No friends ranked here yet" : "No one is ranked here yet"}
            </Text>
            <Text style={styles.emptyText}>
              {friendsOnly
                ? "Athletes you follow will show up here once they post a verified lift on this board."
                : "This board is wide open. Post a verified lift and take the #1 spot — someone has to be first."}
            </Text>
            {!friendsOnly && (
              <TouchableOpacity style={styles.emptyBtn} onPress={openPostFlow}>
                <Text style={styles.emptyBtnText}>POST A LIFT</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {podium.length === 3 && (
          <View
            style={styles.podium}
            onLayout={(e) => {
              if (podium.some((p) => p.isYou)) {
                layoutRef.current.inPodium = true;
                layoutRef.current.rowY = e.nativeEvent.layout.y;
                layoutRef.current.rowH = e.nativeEvent.layout.height;
                recomputeYouVisible();
              }
            }}
          >
            {[1, 0, 2].map((i) => {
              const a = podium[i];
              const first = i === 0;
              return (
                <TouchableOpacity
                  key={a.key}
                  style={[styles.pSlot, first && styles.pSlotFirst]}
                  onPress={() => setAthlete(a)}
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
                        {a.rank}
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
                    {a.pending ? "Pending review" : caption(a)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {rest.length > 0 && (
          <View
            style={styles.card}
            onLayout={(e) => {
              layoutRef.current.cardY = e.nativeEvent.layout.y;
              recomputeYouVisible();
            }}
          >
            {rest.map((a, idx) => (
              <TouchableOpacity
                key={a.key}
                style={[
                  styles.row,
                  idx > 0 && styles.rowBorder,
                  a.isYou && styles.rowMe,
                ]}
                onPress={() => setAthlete(a)}
                activeOpacity={0.7}
                onLayout={
                  a.isYou
                    ? (e) => {
                        layoutRef.current.inPodium = false;
                        layoutRef.current.rowY = e.nativeEvent.layout.y;
                        layoutRef.current.rowH = e.nativeEvent.layout.height;
                        recomputeYouVisible();
                      }
                    : undefined
                }
              >
                <Text style={styles.rankNum}>{a.rank}</Text>
                <OlyAvatar name={a.isYou ? "You" : a.name} size="small" />
                <View style={styles.rowInfo}>
                  <View style={styles.rowNameLine}>
                    <Text
                      style={[styles.rowName, a.isYou && styles.rowNameMe]}
                      numberOfLines={1}
                    >
                      {a.isYou ? "You" : a.name}
                    </Text>
                    {a.pending && (
                      <View style={styles.pendingPill}>
                        <Text style={styles.pendingPillText}>PENDING</Text>
                      </View>
                    )}
                  </View>
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

        {!friendsOnly && nextCursor && ranked.length > 0 && (
          <TouchableOpacity
            style={styles.loadMore}
            onPress={loadMore}
            disabled={moreQ.isFetching}
          >
            {moreQ.isFetching ? (
              <ActivityIndicator size="small" color={olyColors.text.secondary} />
            ) : (
              <Text style={styles.loadMoreText}>SHOW MORE</Text>
            )}
          </TouchableOpacity>
        )}

        {ranked.length > 0 && (
          <Text style={styles.footnote}>
            {scope === "season" && season
              ? `${season.label} ends ${fmtDate(season.endsAt)} · every lift video-verified`
              : "All-time records · every lift video-verified"}
          </Text>
        )}
      </ScrollView>

      {/* Sticky You bar — rank always live-counted by the server */}
      {showYouBar && !(youRowVisible && youIndex >= 0) && (
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(180)}
          style={[styles.youBar, { bottom: youBarBottom }]}
        >
          <Pressable
            style={styles.youBarInner}
            onPress={() => {
              if (me?.provisional) {
                openPostFlow();
              } else if (youIndex >= 0) {
                setAthlete(ranked[youIndex]);
              }
            }}
          >
            <View style={styles.youRankBlock}>
              <Text style={styles.youRank}>{me!.rank}</Text>
              <Text style={styles.youRankLabel}>YOU</Text>
            </View>
            <View style={styles.youMid}>
              <Text style={styles.youName}>{myName}</Text>
              <Text style={styles.youGap}>
                {me!.provisional
                  ? "Unverified — post a video to claim your spot"
                  : `Snatch ${me!.snatchKg ?? "—"} · C&J ${me!.cleanKg ?? "—"}`}
              </Text>
            </View>
            <Text style={styles.youKg}>
              {me!.value}
              <Text style={styles.unitText}> {unit}</Text>
            </Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Filter sheet */}
      <SheetModal visible={filterSheet !== null} onClose={() => setFilterSheet(null)}>
        {filterSheet === "scope" && (
          <SheetOptions
            title="BOARD"
            options={[
              {
                value: "season",
                label: season
                  ? `${season.label} · ends ${fmtDate(season.endsAt)}`
                  : "Season",
              },
              { value: "alltime", label: "All-time records" },
            ]}
            current={scope}
            onPick={(v) => setScope(v as "season" | "alltime")}
            onClose={() => setFilterSheet(null)}
          />
        )}
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
              setSex(v as ApiSex);
              setWclass(v === "M" ? "88" : "69");
            }}
            onClose={() => setFilterSheet(null)}
          />
        )}
        {filterSheet === "age" && (
          <SheetOptions
            title="AGE CATEGORY"
            options={[
              { value: "open", label: "Open · everyone competes" },
              { value: "junior", label: "Junior · 20 and under" },
              { value: "masters", label: "Masters · 35+" },
            ]}
            current={age}
            onPick={(v) => setAge(v as ApiAge)}
            onClose={() => setFilterSheet(null)}
          />
        )}
        {filterSheet === "country" && (
          <CountrySheet
            current={country}
            onPick={(v) => setCountry(v)}
            onClose={() => setFilterSheet(null)}
          />
        )}
      </SheetModal>

      {/* Athlete sheet — card data fetched live per athlete */}
      <SheetModal visible={athlete !== null} onClose={() => setAthlete(null)}>
        {athlete && (
          <AthleteSheet
            a={athlete}
            lift={lift}
            unit={unit}
            params={params}
            onPost={() => {
              setAthlete(null);
              openPostFlow();
            }}
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
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.kavFill}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.sheetBackdrop} onPress={onClose}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            {children}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
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

function CountrySheet({
  current,
  onPick,
  onClose,
}: {
  current: string;
  onPick: (v: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const matches = q
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().startsWith(q)
      )
    : COUNTRIES;
  const pick = (v: string) => {
    onPick(v);
    onClose();
  };
  return (
    <View>
      <Text style={styles.sheetTitle}>REGION</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search country"
        placeholderTextColor={olyColors.text.disabled}
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
        autoCapitalize="none"
      />
      <ScrollView
        style={styles.countryList}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!q && (
          <TouchableOpacity style={styles.sheetOpt} onPress={() => pick("ALL")}>
            <Text style={styles.sheetOptText}>All countries</Text>
            {current === "ALL" && (
              <Ionicons
                name="checkmark"
                size={20}
                color={olyColors.text.primary}
              />
            )}
          </TouchableOpacity>
        )}
        {matches.map((c, i) => (
          <TouchableOpacity
            key={c.code}
            style={[styles.sheetOpt, (i > 0 || !q) && styles.rowBorder]}
            onPress={() => pick(c.code)}
          >
            <View style={styles.countryLeft}>
              <Text style={styles.sheetOptText}>{c.name}</Text>
              <Text style={styles.countryCode}>{c.code}</Text>
            </View>
            {current === c.code && (
              <Ionicons
                name="checkmark"
                size={20}
                color={olyColors.text.primary}
              />
            )}
          </TouchableOpacity>
        ))}
        {matches.length === 0 && (
          <Text style={styles.countryEmpty}>No countries found</Text>
        )}
      </ScrollView>
    </View>
  );
}

function AthleteSheet({
  a,
  lift,
  unit,
  params,
  onPost,
}: {
  a: Ranked;
  lift: LiftKey;
  unit: string;
  params: BoardParams;
  onPost: () => void;
}) {
  // The card hydrates live: proof videos + follow state. The row's numbers
  // render immediately so the sheet never feels blocked on the fetch.
  const cardQ = useGetAthleteCardQuery({
    userId: a.userId,
    ...params,
    class: lift === "sinclair" ? undefined : a.wclass,
  });
  const card = cardQ.data;

  const [follow] = useFollowAthleteMutation();
  const [unfollow] = useUnfollowAthleteMutation();
  const [followingLocal, setFollowingLocal] = useState<boolean | null>(null);
  const following = followingLocal ?? card?.athlete.following ?? false;
  const toggleFollow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = !following;
    setFollowingLocal(next);
    (next ? follow(a.userId) : unfollow(a.userId)).catch(() =>
      setFollowingLocal(!next)
    );
  };

  const sn = a.sn ?? card?.stats.snatchKg ?? null;
  const cj = a.cj ?? card?.stats.cleanKg ?? null;
  const sinclairPts = a.sinclair ?? card?.stats.sinclair ?? null;
  const bw = a.bw ?? card?.stats.bodyweightKg ?? null;
  const snPct = sn && cj ? (sn / (sn + cj)) * 100 : 50;

  const videoFor = (k: "sn" | "cj") =>
    k === "sn" ? card?.videos.snatch : card?.videos.cleanjerk;

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
              <Text style={styles.rankPillText}>#{a.rank}</Text>
            </View>
            {a.pending && (
              <View style={styles.pendingPill}>
                <Text style={styles.pendingPillText}>PENDING</Text>
              </View>
            )}
          </View>
          <Text style={styles.athClub} numberOfLines={1}>
            {a.club ?? "Independent"} · {a.country} · {a.sex}
            {a.wclass}
          </Text>
        </View>
        {!a.isYou && (
          <TouchableOpacity
            style={[styles.followBtn, following && styles.followBtnOn]}
            onPress={toggleFollow}
          >
            <Text style={[styles.followText, following && styles.followTextOn]}>
              {following ? "FOLLOWING" : "FOLLOW"}
            </Text>
          </TouchableOpacity>
        )}
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
              {bw ?? "—"}
              <Text style={styles.unitText}> kg</Text>
            </Text>
            <Text style={styles.sbK}>BODYWEIGHT</Text>
          </View>
          <View style={styles.sbItem}>
            <Text style={styles.sbItemV}>
              {sinclairPts ?? "—"}
              <Text style={styles.unitText}> pts</Text>
            </Text>
            <Text style={styles.sbK}>SINCLAIR</Text>
          </View>
        </View>
        {/* snatch | c&j split */}
        {sn != null && cj != null && (
          <>
            <View style={styles.split}>
              <View style={[styles.splitSn, { flex: snPct }]} />
              <View style={[styles.splitCj, { flex: 100 - snPct }]} />
            </View>
            <View style={styles.splitLabels}>
              <Text style={styles.splitLabel}>SNATCH {sn}</Text>
              <Text style={styles.splitLabel}>C&J {cj}</Text>
            </View>
          </>
        )}
      </View>

      {/* proof videos — the trust signal on every row */}
      <View style={styles.vidDuo}>
        {(["sn", "cj"] as const).map((k) => {
          const v = videoFor(k);
          return (
            <Pressable
              key={k}
              style={styles.vidThumb}
              onPress={() => v?.videoUrl && Linking.openURL(v.videoUrl)}
              disabled={!v?.videoUrl}
            >
              <Text style={styles.vidLift}>
                {k === "sn" ? "SNATCH" : "CLEAN & JERK"}
              </Text>
              {cardQ.isLoading ? (
                <ActivityIndicator size="small" color={olyColors.text.secondary} />
              ) : v ? (
                <>
                  <View style={styles.playBtn}>
                    <Ionicons
                      name="play"
                      size={16}
                      color={olyColors.text.onBrand}
                      style={styles.playIcon}
                    />
                  </View>
                  <Text style={styles.vidKg}>
                    {v.weightKg}
                    <Text style={styles.unitText}> kg</Text>
                  </Text>
                  <Text style={styles.vidDate}>{fmtDate(v.liftDate)}</Text>
                </>
              ) : (
                <Text style={styles.vidNone}>No lift yet</Text>
              )}
            </Pressable>
          );
        })}
      </View>

      {a.isYou && (
        <TouchableOpacity style={styles.sheetPostBtn} onPress={onPost}>
          <Text style={styles.emptyBtnText}>POST A LIFT</Text>
        </TouchableOpacity>
      )}
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
  segmentsSpacing: {
    marginTop: olySpacing[16],
  },
  segments: {
    flexDirection: "row",
    backgroundColor: olyColors.bg.card,
    borderRadius: olyRadius.lg,
    padding: olySpacing[4],
  },
  segment: {
    flex: 1,
    paddingVertical: olySpacing[8],
    alignItems: "center",
    justifyContent: "center",
    borderRadius: NESTED_RADIUS,
  },
  segmentActive: {
    backgroundColor: olyPalette.primary,
  },
  segmentLabel: {
    ...olyTypography.caption,
    fontFamily: olyTypography.label.fontFamily,
  },
  segmentLabelActive: { color: olyColors.text.onBrand },
  segmentLabelIdle: { color: olyColors.text.secondary },
  chipsRow: { flexGrow: 0, marginTop: olySpacing[12] },
  chipsContent: {
    paddingHorizontal: olyLayout.screenPadding,
    gap: olySpacing[8],
  },
  chip: {
    flexDirection: "row",
    gap: olySpacing[4],
    backgroundColor: olyColors.bg.card,
    borderRadius: NESTED_RADIUS,
    paddingVertical: olySpacing[8],
    paddingHorizontal: olySpacing[12],
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: { backgroundColor: olyPalette.primary },
  chipLabel: {
    ...olyTypography.caption,
    fontFamily: olyTypography.label.fontFamily,
    color: olyColors.text.secondary,
  },
  chipLabelActive: { color: olyColors.text.onBrand },
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
  rowNameLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[8],
  },
  rowName: {
    ...olyTypography.body,
    color: olyColors.text.primary,
    flexShrink: 1,
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
  loadMore: {
    alignItems: "center",
    paddingVertical: olySpacing[16],
  },
  loadMoreText: {
    ...olyTypography.caption,
    fontFamily: olyTypography.label.fontFamily,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  pendingPill: {
    backgroundColor: olyColors.bg.cardUnselected,
    borderRadius: olyRadius.sm,
    paddingHorizontal: olySpacing[4],
    paddingVertical: 2,
  },
  pendingPillText: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
    fontSize: 9,
  },
  vidNone: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
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
    backgroundColor: olyPalette.cardElevated,
    borderWidth: 1,
    borderColor: olyColors.border.brand,
    borderRadius: olyRadius.lg,
  },
  youBarInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[12],
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
  kavFill: { flex: 1 },
  searchInput: {
    ...olyTypography.body,
    color: olyColors.text.primary,
    backgroundColor: olyElevation.level2.backgroundColor,
    borderRadius: NESTED_RADIUS,
    paddingVertical: olySpacing[8],
    paddingHorizontal: olySpacing[12],
    marginBottom: olySpacing[8],
  },
  countryList: { height: 360 },
  countryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[8],
    flexShrink: 1,
  },
  countryCode: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
  },
  countryEmpty: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    textAlign: "center",
    paddingVertical: olySpacing[24],
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

  sheetPostBtn: {
    backgroundColor: olyPalette.primary,
    borderRadius: olyRadius.full,
    alignItems: "center",
    paddingVertical: olySpacing[12],
    marginTop: olyLayout.cardGap,
  },
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
