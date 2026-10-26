/**
 * Onboarding Screen 6 — Next meet
 *
 * Onboarding: "Got a meet coming up?" Yes / Not yet, the meet (picked
 * from the shared list in MeetPickerSheet, or requested), weight class and
 * target total.
 *
 * Settings: the next-meet card with its countdown, the weight class trend,
 * the total, what meet day pays and past meets.
 *
 * The picked meet maps onto the fields the API already takes:
 * competition_name and compDay / compMonth / compYear. The meet itself is
 * kept in the slice as `meet` for display only; it is never sent.
 *
 * MOCK: meets, bodyweight trend, verified total and past meets come from
 * src/oly-mock/meets.ts.
 */

import { onboardingStyles } from "@/src/oly-components/onboarding/onboarding-styles";
import { OlyButton } from "@/src/oly-components/atoms/OlyButton";
import MeetPickerSheet from "@/src/oly-components/meets/MeetPickerSheet";
import {
  classesFor,
  classLabel,
  classLimit,
  dateFromIso,
  daysUntil,
  deriveWeightClass,
  fmtMeetDay,
  isoFromParts,
  LB_TO_KG,
  meetSubline,
  resolveMeet,
} from "@/src/oly-components/meets/meet-utils";
import { OlyFormField } from "@/src/oly-components/molecules/OlyFormField";
import { Glass, GlowBar, QuietButton } from "@/src/oly-components/shop/ShopKit";
import {
  MEET_PAYS,
  MOCK_PACE_KG_WEEK,
  MOCK_WEIGHED_DAYS_AGO,
  mockBodyweightTrend,
  mockPastMeets,
  mockVerified,
  type Meet,
} from "@/src/oly-mock/meets";
import { olyColors } from "@/src/oly-theme/oly-colors";
import { olyGlow } from "@/src/oly-theme/oly-elevation";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyLayout, olySpacing } from "@/src/oly-theme/oly-spacing";
import { olyFonts, olyTypography } from "@/src/oly-theme/oly-typography";
import {
  saveOnboardingData,
  selectOnboardingData,
} from "@/store/reducer/onboardingSlice";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient as SvgGradient,
  Path,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { useDispatch, useSelector } from "react-redux";

/* ── Types ─────────────────────────────────────────────── */

interface OnboardingScreen6Props {
  onBack?: () => void;
  onComplete?: () => void;
  mode?: "onboarding" | "settings";
  /** Settings only. Height of the floating header above, so content starts below it and scrolls under its fade. */
  topInset?: number;
}

interface OnboardingScreen6Values {
  preparing_for_competition: boolean;
  competition_name: string;
  compDay: string;
  compMonth: string;
  compYear: string;
  weight_class: string;
  target_total: string;
  /** Display only. Never part of the API payload. */
  meet: Meet | null;
}

/* ── Component ─────────────────────────────────────────── */

export default function OnboardingScreen6({
  onBack,
  onComplete,
  mode = "onboarding",
  topInset = 0,
}: OnboardingScreen6Props) {
  const isSettings = mode === "settings";
  const dispatch = useDispatch();
  const onboardingData = useSelector(selectOnboardingData);
  const navigation = useNavigation();
  const getValuesRef = useRef<() => OnboardingScreen6Values>(
    () => ({}) as OnboardingScreen6Values,
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [classOpen, setClassOpen] = useState(false);

  const sex: string | undefined = onboardingData?.sex;
  const unit = onboardingData?.weightUnit === "LB" ? "lbs" : "kg";

  const { control, handleSubmit, watch, setValue, getValues } =
    useForm<OnboardingScreen6Values>({
      defaultValues: {
        preparing_for_competition:
          onboardingData?.preparing_for_competition ?? false,
        competition_name: onboardingData?.competition_name ?? "",
        compDay: onboardingData?.compDay ?? "",
        compMonth: onboardingData?.compMonth ?? "",
        compYear: onboardingData?.compYear ?? "",
        // Empty means not chosen yet: start from the entered bodyweight.
        weight_class:
          onboardingData?.weight_class ||
          deriveWeightClass(
            sex,
            onboardingData?.weight,
            onboardingData?.weightUnit,
          ),
        target_total: onboardingData?.target_total ?? "",
        meet: resolveMeet(
          onboardingData?.meet,
          onboardingData?.competition_name ?? "",
          isoFromParts(
            onboardingData?.compYear,
            onboardingData?.compMonth,
            onboardingData?.compDay,
          ),
        ),
      },
    });

  const isCompeting = watch("preparing_for_competition");
  const meet = watch("meet");
  const weightClass = watch("weight_class");
  const targetTotal = watch("target_total");

  /* ── Validation: NEXT needs a meet when competing ── */
  const allFilled = !isCompeting || !!meet;

  /* ── Pick a meet: it fills the name and the date ── */
  const pickMeet = (m: Meet) => {
    const d = dateFromIso(m.date);
    setValue("meet", m);
    setValue("competition_name", m.name);
    setValue("compDay", String(d.getDate()));
    setValue("compMonth", String(d.getMonth() + 1));
    setValue("compYear", String(d.getFullYear()));
    setValue("preparing_for_competition", true);
  };

  /* Settings: keep the slice current so SAVE CHANGES sends what is on screen */
  useEffect(() => {
    if (!isSettings) return;
    const sub = watch((vals) => {
      dispatch(saveOnboardingData(vals as OnboardingScreen6Values));
    });
    return () => sub.unsubscribe();
  }, [isSettings, watch, dispatch]);

  /* Keep ref in sync for auto-save */
  getValuesRef.current = getValues;

  /* Auto-save on back (settings mode). Reverts to "No" if the competition fields are incomplete. */
  useEffect(() => {
    if (!isSettings) return;
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      const vals = getValuesRef.current();
      const competitionComplete =
        vals.preparing_for_competition &&
        vals.competition_name?.trim() &&
        vals.compDay &&
        vals.compMonth &&
        vals.compYear;

      const sanitized = {
        ...onboardingData,
        ...vals,
        preparing_for_competition: !!competitionComplete,
        // Clear competition fields if incomplete
        ...(!competitionComplete && {
          competition_name: "",
          compDay: "",
          compMonth: "",
          compYear: "",
          weight_class: "",
          target_total: "",
          meet: null,
        }),
      };
      dispatch(saveOnboardingData(sanitized));
    });
    return unsubscribe;
  }, [navigation, isSettings, dispatch, onboardingData]);

  /* ── Back (save progress) ── */
  const handleBack = () => {
    dispatch(saveOnboardingData({ ...onboardingData, ...getValues() }));
    if (onBack) onBack();
  };

  /* ── Submit ── */
  const onSubmit = (data: OnboardingScreen6Values) => {
    dispatch(saveOnboardingData({ ...onboardingData, ...data }));
    if (onComplete) onComplete();
  };

  /* ── Pieces ── */

  const classes = classesFor(sex);
  const classChips = classOpen && (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.classChips}
      style={styles.classChipsScroll}
    >
      {classes.map((c) => (
        <Pressable
          key={c}
          onPress={() => {
            setValue("weight_class", c);
            setClassOpen(false);
          }}
          hitSlop={{ top: 4, bottom: 4 }}
          style={[styles.classChip, weightClass === c && styles.classChipOn]}
          accessibilityRole="button"
          accessibilityState={{ selected: weightClass === c }}
        >
          <Text
            style={[
              styles.classChipText,
              weightClass === c && styles.classChipTextOn,
            ]}
          >
            {c} kg
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );

  const changeClass = (
    <Pressable
      onPress={() => setClassOpen((v) => !v)}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Change weight class"
    >
      <Pill label={weightClass ? "Change class" : "Set class"} />
    </Pressable>
  );

  const targetInput = (
    <Controller
      control={control}
      name="target_total"
      render={({ field: { onChange, value } }) => (
        <OlyFormField
          label="TARGET TOTAL"
          placeholder="e.g. 280"
          value={value}
          onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ""))}
          keyboardType="number-pad"
          maxLength={4}
          suffix={unit}
        />
      )}
    />
  );

  /* ── Render ── */
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, topInset > 0 && { paddingTop: topInset }]}
        scrollIndicatorInsets={{ top: topInset }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isSettings ? (
          <View style={styles.formGroup}>
            {isCompeting && meet ? (
              <NextMeetCard
                meet={meet}
                daysPerWeek={Number(onboardingData?.days_per_week) || 3}
                onEdit={() => setPickerOpen(true)}
              />
            ) : (
              <Glass radius={olyRadius.tile} style={styles.cardPad}>
                <Text style={styles.cardTitle}>No meet yet</Text>
                <Text style={styles.emptySub}>
                  Pick one and you get a countdown, a weight class check and
                  your target.
                </Text>
                <OlyButton
                  label="Pick your meet"
                  onPress={() => setPickerOpen(true)}
                  preserveCase
                  fullWidth
                  style={styles.emptyBtn}
                />
              </Glass>
            )}

            {isCompeting && meet && (
              <>
                <View>
                  <Text style={styles.sectionLabel}>WEIGHT CLASS</Text>
                  <WeightClassCard
                    cls={weightClass}
                    sex={sex}
                    savedKg={toKg(
                      onboardingData?.weight,
                      onboardingData?.weightUnit,
                    )}
                    meetIso={meet.date}
                    change={changeClass}
                    chips={classChips}
                  />
                </View>

                <View>
                  <Text style={styles.sectionLabel}>TOTAL</Text>
                  <Glass radius={olyRadius.tile} style={styles.cardPad}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.cardTitle}>Target total</Text>
                      <View style={styles.targetWell}>
                        <View style={styles.targetNum}>
                          <Controller
                            control={control}
                            name="target_total"
                            render={({ field: { onChange, value } }) => (
                              <TextInput
                                value={value}
                                onChangeText={(t) =>
                                  onChange(t.replace(/[^0-9]/g, ""))
                                }
                                placeholder="0"
                                placeholderTextColor={olyColors.text.hint}
                                selectionColor={olyColors.accent}
                                keyboardType="number-pad"
                                maxLength={4}
                                style={styles.targetInput}
                                accessibilityLabel="Target total"
                              />
                            )}
                          />
                          <Text style={styles.unit}>{unit}</Text>
                        </View>
                      </View>
                    </View>
                    <TotalProgress
                      target={Number(targetTotal) || 0}
                      unit={unit}
                    />
                  </Glass>
                </View>
              </>
            )}

            <View>
              <Text style={styles.sectionLabel}>MEET DAY PAYS</Text>
              <Glass radius={olyRadius.tile}>
                {MEET_PAYS.map((r, i) => (
                  <View
                    key={r.title}
                    style={[styles.listRow, i > 0 && styles.rule]}
                  >
                    <View style={styles.flex}>
                      <Text style={styles.rowTitle}>{r.title}</Text>
                      <Text style={styles.rowSub}>{r.sub}</Text>
                    </View>
                    <Text style={styles.rowValue}>+{r.olys}</Text>
                    <Text style={styles.rowUnit}>olys</Text>
                  </View>
                ))}
              </Glass>
            </View>

            {mockPastMeets().length > 0 && (
              <View>
                <Text style={styles.sectionLabel}>PAST MEETS</Text>
                <Glass radius={olyRadius.tile}>
                  {mockPastMeets().map((p, i) => (
                    <View
                      key={p.name}
                      style={[
                        styles.listRow,
                        styles.pastRow,
                        i > 0 && styles.rule,
                      ]}
                    >
                      <View style={styles.flex}>
                        <Text style={styles.rowTitle}>{p.name}</Text>
                        <Text style={styles.rowSub}>
                          {p.when} · {p.cls}
                        </Text>
                      </View>
                      <View style={styles.pastRight}>
                        <Text style={styles.rowValue}>
                          {p.total} <Text style={styles.rowUnit}>kg</Text>
                        </Text>
                        <Text style={styles.pastPlace}>{p.place}</Text>
                      </View>
                    </View>
                  ))}
                </Glass>
              </View>
            )}

            {isCompeting && meet && (
              <QuietButton
                label="I'm not competing"
                onPress={() => setValue("preparing_for_competition", false)}
              />
            )}
          </View>
        ) : (
          <>
            <View style={styles.titleBlock}>
              <Text style={styles.title} maxFontSizeMultiplier={1.2}>
                Got a meet coming up?
              </Text>
              <Text style={styles.subtitle} maxFontSizeMultiplier={1.5}>
                We count you down and tell you what it pays.
              </Text>
            </View>

            <View style={styles.formGroup}>
              {/* Yes, I have one / Not yet */}
              <Controller
                control={control}
                name="preparing_for_competition"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.segmentedTrack}>
                    {[
                      { v: true, label: "Yes, I have one" },
                      { v: false, label: "Not yet" },
                    ].map((o) => (
                      <Pressable
                        key={o.label}
                        style={({ pressed }) => [
                          styles.segmentedOption,
                          value === o.v && styles.segmentedOptionActive,
                          pressed && styles.pressed,
                        ]}
                        onPress={() => onChange(o.v)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: value === o.v }}
                      >
                        <Text
                          style={[
                            styles.segmentedText,
                            value === o.v && styles.segmentedTextActive,
                          ]}
                        >
                          {o.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              />

              {isCompeting && (
                <>
                  <View>
                    <Text style={styles.sectionLabel}>MEET</Text>
                    <Pressable
                      onPress={() => setPickerOpen(true)}
                      style={({ pressed }) => pressed && styles.pressed}
                      accessibilityRole="button"
                      accessibilityLabel={
                        meet ? `Meet: ${meet.name}. Change` : "Pick your meet"
                      }
                    >
                      <Glass radius={olyRadius.tile} style={styles.meetField}>
                        {meet ? (
                          <>
                            <View style={styles.rowBetween}>
                              <Text style={styles.meetName} numberOfLines={1}>
                                {meet.name}
                              </Text>
                              {meet.pending ? (
                                <PendingTag />
                              ) : (
                                <Pill label="Change" />
                              )}
                            </View>
                            <Text style={styles.meetSub}>
                              {meetSubline(meet)}
                            </Text>
                          </>
                        ) : (
                          <View style={styles.rowBetween}>
                            <View style={styles.flex}>
                              <Text style={styles.meetName}>
                                Pick your meet
                              </Text>
                              <Text style={styles.meetSub}>
                                From the federation calendars
                              </Text>
                            </View>
                            <Pill label="Browse" />
                          </View>
                        )}
                      </Glass>
                    </Pressable>
                  </View>

                  {targetInput}

                  <View>
                    <View style={styles.classRow}>
                      <Text style={styles.classText}>
                        Weight class{" "}
                        <Text style={styles.classValue}>
                          {weightClass
                            ? classLabel(sex, weightClass)
                            : "Not set"}
                        </Text>
                      </Text>
                      {changeClass}
                    </View>
                    {classChips}
                  </View>
                </>
              )}
            </View>

            {/* Bottom buttons */}
            <View style={styles.bottomButtons}>
              <OlyButton
                label="BACK"
                variant="secondary"
                onPress={handleBack}
                fullWidth
                style={styles.halfButton}
              />
              <OlyButton
                label="NEXT"
                variant="primary"
                onPress={handleSubmit(onSubmit)}
                disabled={!allFilled}
                fullWidth
                style={styles.halfButton}
              />
            </View>
          </>
        )}
      </ScrollView>

      <MeetPickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedId={meet?.id}
        onPick={pickMeet}
      />
    </View>
  );
}

/* ── Small pieces ──────────────────────────────────────── */

function Pill({ label }: { label: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

/** Yellow "Pending" tag. The tints are the warning ink at low opacity. */
function PendingTag() {
  return (
    <View style={styles.pending}>
      <View style={[StyleSheet.absoluteFill, styles.pendingFill]} />
      <View style={[StyleSheet.absoluteFill, styles.pendingEdge]} />
      <Text style={styles.pendingText}>Pending</Text>
    </View>
  );
}

function NextMeetCard({
  meet,
  daysPerWeek,
  onEdit,
}: {
  meet: Meet;
  daysPerWeek: number;
  onEdit: () => void;
}) {
  const days = Math.max(0, daysUntil(meet.date));
  const weeks = Math.floor(days / 7);
  const cols: [string, number][] = [
    ["DAYS", days],
    ["WEEKS", weeks],
    ["SESSIONS", weeks * daysPerWeek],
  ];
  return (
    <Glass
      radius={olyRadius.xl}
      colors={olyColors.glass.ticket}
      borderColor={olyColors.glass.accentBorder}
      style={styles.cardPad}
    >
      <View style={styles.rowBetween}>
        <View style={styles.inlineRow}>
          <Text style={styles.overline}>NEXT MEET</Text>
          {meet.pending && <PendingTag />}
        </View>
        <Pressable
          onPress={onEdit}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Edit meet"
        >
          <Pill label="Edit" />
        </Pressable>
      </View>
      <View style={[styles.rowBaseline, styles.mt10]}>
        <Text style={styles.nextName} numberOfLines={1}>
          {meet.name}
        </Text>
        <Text style={styles.muted13}>{fmtMeetDay(meet.date)}</Text>
      </View>
      {!!meet.city && (
        <Text style={[styles.muted13, styles.mt2]}>
          {meet.city.split(",")[0]}
        </Text>
      )}
      <View style={styles.cols}>
        {cols.map(([k, v], i) => (
          <View key={k} style={[styles.col, i > 0 && styles.colRule]}>
            <Text style={styles.colLabel}>{k}</Text>
            <Text style={styles.colValue}>{v}</Text>
          </View>
        ))}
      </View>
    </Glass>
  );
}

function WeightClassCard({
  cls,
  sex,
  savedKg,
  meetIso,
  change,
  chips,
}: {
  cls: string;
  sex?: string;
  /** The bodyweight saved on the profile, in kg. The trend ends on it. */
  savedKg: number | null;
  meetIso: string;
  change: React.ReactNode;
  chips: React.ReactNode;
}) {
  const limit = classLimit(cls);
  const raw = limit ? mockBodyweightTrend(limit) : [];
  /* Mock history, shifted so its last point is the real saved bodyweight. */
  const shift = savedKg && raw.length ? savedKg - raw[raw.length - 1] : 0;
  const trend = raw.map((v) => Math.round((v + shift) * 10) / 10);
  const now = savedKg ?? trend[trend.length - 1];
  const header = (
    <View style={styles.rowBetween}>
      <Text style={styles.cardTitle}>
        {cls ? classLabel(sex, cls) : "No class set"}
      </Text>
      {change}
    </View>
  );

  if (!limit || !now) {
    return (
      <Glass radius={olyRadius.tile} style={styles.cardPad}>
        {header}
        {chips}
      </Glass>
    );
  }

  const left = Math.max(0, Math.round((now - limit) * 10) / 10);
  return (
    <Glass radius={olyRadius.tile} style={styles.cardPad}>
      {header}
      {chips}
      <View style={[styles.rowBetweenTop, styles.numsRow]}>
        <View>
          <Text style={styles.muted13}>Your bodyweight</Text>
          <Text style={styles.bigNum}>
            {now}
            <Text style={styles.bigUnit}> kg</Text>
          </Text>
        </View>
        <View style={styles.alignEnd}>
          <Text style={styles.muted13}>
            {left > 0 ? "Left to cut" : "Under the limit"}
          </Text>
          <Text style={styles.bigNum}>
            {left > 0 ? left : Math.round((limit - now) * 10) / 10}
            <Text style={styles.bigUnit}> kg</Text>
          </Text>
        </View>
      </View>
      {trend.length > 1 && (
        <TrendChart
          points={trend}
          limit={limit}
          meetLabel={`Meet · ${fmtMeetDay(meetIso)}`}
        />
      )}
      <View style={styles.trendFoot}>
        <View style={styles.dot} />
        <Text style={styles.muted13}>
          On pace at{" "}
          <Text style={styles.ink}>
            {MOCK_PACE_KG_WEEK < 0 ? "−" : "+"}
            {Math.abs(MOCK_PACE_KG_WEEK)} kg a week
          </Text>
        </Text>
        <View style={styles.flex} />
        <Text style={styles.hint12}>
          Weighed {MOCK_WEIGHED_DAYS_AGO}{" "}
          {MOCK_WEIGHED_DAYS_AGO === 1 ? "day" : "days"} ago
        </Text>
      </View>
    </Glass>
  );
}

/** Saved bodyweight in kg, or null when none is entered. */
function toKg(v: unknown, unit?: string): number | null {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return null;
  return (
    Math.round((unit === "LB" || unit === "lbs" ? n * LB_TO_KG : n) * 10) / 10
  );
}

/** Catmull-Rom through the points, as cubic beziers. */
function smoothPath(p: [number, number][]): string {
  let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(i - 1, 0)];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[Math.min(i + 2, p.length - 1)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

const CHART_H = 96;

function TrendChart({
  points,
  limit,
  meetLabel,
}: {
  points: number[];
  limit: number;
  meetLabel: string;
}) {
  const [w, setW] = useState(0);
  const onLayout = (e: LayoutChangeEvent) =>
    setW(Math.round(e.nativeEvent.layout.width));
  const lo = limit - 0.6;
  const hi = limit + 1.8;
  const todayX = w * 0.66;
  const X = (i: number) => (i * todayX) / (points.length - 1);
  const Y = (v: number) => 8 + ((hi - v) / (hi - lo)) * (CHART_H - 16);
  const pts = points.map((v, i) => [X(i), Y(v)] as [number, number]);
  const [lx, ly] = pts[pts.length - 1];
  const ex = w - 4;
  const ey = Y(limit - 0.15);
  const line = w ? smoothPath(pts) : "";
  const area = w ? `${line} L${lx.toFixed(1)},${CHART_H} L0,${CHART_H} Z` : "";
  const limitY = Y(limit);
  const font = { fontFamily: olyFonts.regular, fontSize: 11 };

  return (
    <View style={styles.chart} onLayout={onLayout}>
      {w > 0 && (
        <Svg width={w} height={CHART_H + 22}>
          <Defs>
            <SvgGradient id="wcArea" x1="0" y1="0" x2="0" y2="1">
              <Stop
                offset="0"
                stopColor={olyColors.accent}
                stopOpacity={0.28}
              />
              <Stop offset="1" stopColor={olyColors.accent} stopOpacity={0} />
            </SvgGradient>
            <SvgGradient id="wcProj" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={olyColors.accent} stopOpacity={0.8} />
              <Stop
                offset="1"
                stopColor={olyColors.accent}
                stopOpacity={0.15}
              />
            </SvgGradient>
          </Defs>
          <Line
            x1={0}
            x2={w}
            y1={limitY}
            y2={limitY}
            stroke={olyColors.glass.bar}
            strokeDasharray="2 5"
            strokeLinecap="round"
          />
          <SvgText x={0} y={limitY + 16} fill={olyColors.text.hint} {...font}>
            {`${limit.toFixed(1)} limit`}
          </SvgText>
          <Path d={area} fill="url(#wcArea)" />
          <Path
            d={line}
            fill="none"
            stroke={olyColors.accent}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <Path
            d={`M${lx.toFixed(1)},${ly.toFixed(1)} Q${((lx + ex) / 2).toFixed(1)},${((ly + ey) / 2 - 2).toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`}
            fill="none"
            stroke="url(#wcProj)"
            strokeWidth={2}
            strokeDasharray="1 6"
            strokeLinecap="round"
          />
          <Circle
            cx={lx}
            cy={ly}
            r={9}
            fill={olyColors.accent}
            opacity={0.18}
          />
          <Circle cx={lx} cy={ly} r={4} fill={olyColors.text.primary} />
          <Circle
            cx={ex}
            cy={ey}
            r={3.5}
            fill="none"
            stroke={olyColors.text.hint}
            strokeWidth={1.5}
          />
          <SvgText
            x={lx}
            y={CHART_H + 18}
            textAnchor="middle"
            fill={olyColors.text.secondary}
            {...font}
          >
            Today
          </SvgText>
          <SvgText
            x={w}
            y={CHART_H + 18}
            textAnchor="end"
            fill={olyColors.text.secondary}
            {...font}
          >
            {meetLabel}
          </SvgText>
        </Svg>
      )}
    </View>
  );
}

function TotalProgress({ target, unit }: { target: number; unit: string }) {
  const verified = mockVerified();
  if (!verified || !target) return null;
  const toGo = Math.max(0, target - verified.total);
  return (
    <>
      <View style={[styles.rowBaseline, styles.mt10]}>
        <Text style={styles.muted13}>
          Verified today{" "}
          <Text style={styles.ink}>
            {verified.total} {unit}
          </Text>
        </Text>
        <Text style={styles.muted13}>
          {toGo > 0 ? (
            <>
              <Text style={styles.ink}>
                {toGo} {unit}
              </Text>{" "}
              to go
            </>
          ) : (
            "Target hit"
          )}
        </Text>
      </View>
      <View style={styles.mt16}>
        <GlowBar pct={verified.total / target} />
      </View>
      {toGo > 0 && (
        <Text style={[styles.muted12, styles.mt8]}>
          Hit it and you move to #{verified.rankAtTarget}
        </Text>
      )}
    </>
  );
}

/* ── Styles ─────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  flex: { flex: 1 },
  pressed: { opacity: 0.8 },

  /* Title */
  titleBlock: onboardingStyles.titleBlock,
  title: onboardingStyles.title,
  subtitle: onboardingStyles.subtitle,

  /* Form */
  formGroup: { gap: olySpacing[24], paddingBottom: olySpacing[8] },
  sectionLabel: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: olySpacing[8],
    marginHorizontal: olySpacing[4],
  },

  /* Yes / Not yet segmented control */
  segmentedTrack: {
    flexDirection: "row",
    gap: 2,
    padding: 3,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.card,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
  },
  segmentedOption: {
    flex: 1,
    height: olyLayout.minTouchTarget,
    borderRadius: olyRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentedOptionActive: {
    backgroundColor: olyColors.glass.selected,
  },
  segmentedText: {
    fontFamily: olyFonts.regular,
    fontSize: 15,
    color: olyColors.text.secondary,
  },
  segmentedTextActive: {
    fontFamily: olyFonts.bold,
    color: olyColors.text.primary,
  },

  /* Meet field */
  meetField: { padding: 18 },
  meetName: {
    flexShrink: 1,
    fontFamily: olyFonts.bold,
    fontSize: 17,
    color: olyColors.text.primary,
  },
  meetSub: {
    marginTop: 6,
    fontFamily: olyFonts.regular,
    fontSize: 13,
    color: olyColors.text.secondary,
  },
  pill: {
    paddingHorizontal: olySpacing[12],
    paddingVertical: olySpacing[4],
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.control,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
  },
  pillText: {
    fontFamily: olyFonts.bold,
    fontSize: 12,
    color: olyColors.text.primary,
  },
  pending: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: olyRadius.full,
    overflow: "hidden",
  },
  pendingFill: { backgroundColor: olyColors.text.warning, opacity: 0.12 },
  pendingEdge: {
    borderRadius: olyRadius.full,
    borderWidth: 1,
    borderColor: olyColors.text.warning,
    opacity: 0.45,
  },
  pendingText: {
    fontFamily: olyFonts.bold,
    fontSize: 12,
    color: olyColors.text.warning,
  },

  /* Weight class row (onboarding) */
  classRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: olyLayout.minTouchTarget,
    paddingHorizontal: olySpacing[4],
  },
  classText: {
    fontFamily: olyFonts.regular,
    fontSize: 14,
    color: olyColors.text.secondary,
  },
  classValue: { fontFamily: olyFonts.bold, color: olyColors.text.primary },
  classChipsScroll: { flexGrow: 0, marginTop: olySpacing[12] },
  classChips: { gap: olySpacing[8] },
  classChip: {
    minHeight: 36,
    paddingHorizontal: 14,
    justifyContent: "center",
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.card,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
  },
  classChipOn: onboardingStyles.selected,
  classChipText: {
    fontFamily: olyFonts.bold,
    fontSize: 13,
    color: olyColors.text.secondary,
  },
  classChipTextOn: { color: olyColors.text.primary },

  /* Cards (settings) */
  cardPad: { padding: 18 },
  emptySub: {
    marginTop: 6,
    fontFamily: olyFonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: olyColors.text.secondary,
  },
  emptyBtn: { marginTop: olySpacing[16] },
  cardTitle: {
    fontFamily: olyFonts.bold,
    fontSize: 17,
    color: olyColors.text.primary,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: olySpacing[12],
  },
  numsRow: { marginTop: olySpacing[16] },
  rowBetweenTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  rowBaseline: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: olySpacing[12],
  },
  inlineRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  alignEnd: { alignItems: "flex-end" },
  overline: {
    fontFamily: olyFonts.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: olyColors.text.secondary,
  },
  nextName: {
    flexShrink: 1,
    fontFamily: olyFonts.bold,
    fontSize: 24,
    letterSpacing: -0.4,
    color: olyColors.text.primary,
  },
  muted13: {
    fontFamily: olyFonts.regular,
    fontSize: 13,
    color: olyColors.text.secondary,
  },
  muted12: {
    fontFamily: olyFonts.regular,
    fontSize: 12,
    color: olyColors.text.secondary,
  },
  hint12: {
    fontFamily: olyFonts.regular,
    fontSize: 12,
    color: olyColors.text.hint,
  },
  ink: { fontFamily: olyFonts.bold, color: olyColors.text.primary },
  mt2: { marginTop: 2 },
  mt8: { marginTop: olySpacing[8] },
  mt10: { marginTop: 10 },
  mt16: { marginTop: olySpacing[16] },
  cols: {
    flexDirection: "row",
    marginTop: olySpacing[16],
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: olyColors.glass.rule,
  },
  col: { flex: 1 },
  colRule: {
    borderLeftWidth: 1,
    borderLeftColor: olyColors.glass.rule,
    paddingLeft: 14,
  },
  colLabel: {
    fontFamily: olyFonts.regular,
    fontSize: 11,
    letterSpacing: 1,
    color: olyColors.text.secondary,
  },
  colValue: {
    marginTop: 2,
    fontFamily: olyFonts.bold,
    fontSize: 18,
    color: olyColors.text.primary,
  },

  /* Weight class trend */
  bigNum: {
    marginTop: olySpacing[4],
    fontFamily: olyFonts.bold,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1.2,
    color: olyColors.text.primary,
  },
  bigUnit: {
    fontFamily: olyFonts.bold,
    fontSize: 13,
    letterSpacing: 0,
    color: olyColors.text.secondary,
  },
  chart: { marginTop: olySpacing[20], height: CHART_H + 22 },
  trendFoot: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[8],
    marginTop: olySpacing[16],
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: olyColors.glass.rule,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: olyColors.accent,
    ...olyGlow.sm,
  },

  /* Total */
  targetWell: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[4],
    height: 44,
    paddingLeft: 14,
    paddingRight: 14,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.glass.inset,
    borderWidth: 1,
    borderColor: olyColors.glass.border,
  },
  targetNum: { flexDirection: "row", alignItems: "flex-end", gap: olySpacing[4] },
  targetInput: {
    minWidth: 32,
    height: 24,
    textAlign: "right",
    fontFamily: olyFonts.bold,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.4,
    color: olyColors.text.primary,
    paddingVertical: 0,
  },
  // Sits on the number's baseline, same size and ink as the record pills.
  unit: {
    marginBottom: olySpacing[4],
    fontFamily: olyFonts.medium,
    fontSize: 11,
    lineHeight: 13,
    color: olyColors.text.secondary,
  },

  /* Rows: meet day pays, past meets */
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[12],
    minHeight: 60,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  pastRow: { minHeight: 64 },
  rule: { borderTopWidth: 1, borderTopColor: olyColors.glass.rule },
  rowTitle: {
    fontFamily: olyFonts.bold,
    fontSize: 15,
    color: olyColors.text.primary,
  },
  rowSub: {
    marginTop: 2,
    fontFamily: olyFonts.regular,
    fontSize: 12,
    color: olyColors.text.hint,
  },
  rowValue: {
    fontFamily: olyFonts.bold,
    fontSize: 15,
    color: olyColors.text.primary,
  },
  rowUnit: {
    marginLeft: -8,
    fontFamily: olyFonts.regular,
    fontSize: 12,
    color: olyColors.text.secondary,
  },
  pastRight: { alignItems: "flex-end" },
  pastPlace: {
    marginTop: 2,
    fontFamily: olyFonts.regular,
    fontSize: 12,
    color: olyColors.text.secondary,
  },

  /* Bottom buttons */
  bottomButtons: onboardingStyles.bottomButtons,
  halfButton: {
    flex: 1,
  },
});
