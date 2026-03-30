import { Images } from "@/assets";
import Context from "@/components/context";
import DetailLift from "@/components/detail-lift";
import Effort from "@/components/effort";
import { useTheme } from "@/context/theme-context";
import { useGetPostByIdQuery, useLikePostMutation, useUnLikePostMutation } from "@/store/api";
import { olyTypography, olyFonts, olyLetterSpacing } from "@/src/oly-theme/oly-typography";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olySpacing, olyLayout } from "@/src/oly-theme/oly-spacing";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyElevation } from "@/src/oly-theme/oly-elevation";
import { Ionicons } from "@expo/vector-icons";
import { getRelativeTime } from "@/utils/time";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { ResizeMode, Video } from "expo-av";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
/* ── Constants ──────────────────────────────────────── */

const AVATAR_SIZE = 40;
const NAV_ICON_SIZE = 20;

/* ── Helpers ────────────────────────────────────────── */

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
}

export default function PostExpanded() {
  const { colors } = useTheme();
  const { post_id } = useLocalSearchParams();
  const [videoPressed, setVideoPressed] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnLikePostMutation();
  const hasInteractedLike = useRef(false);
  const [activeTab, setActiveTab] = useState<"details" | "notes">("details");
  const [expandedSet, setExpandedSet] = useState<number | null>(null);
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fullscreenVideo, setFullscreenVideo] = useState(false);
  const fullscreenVideoRef = useRef<Video>(null);
  const { data, isLoading, error, isError } = useGetPostByIdQuery(
    post_id as string,
  );

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const post = data?.data;
  const session = post?.session_detail;
  useEffect(() => {
    if (post && !hasInteractedLike.current) {
      setIsLiked(post.isLiked ?? false);
      setLikeCount(post.likeCount ?? 0);
    }
  }, [post]);
  const handleBackPress = () => {
    router.back();
  };
  const handleOpenFullscreenVideo = () => {
    setFullscreenVideo(true);
  };

  const handleCloseFullscreenVideo = () => {
    setFullscreenVideo(false);
  };

  const handleLike = async () => {
    if (!post_id) return;
    hasInteractedLike.current = true;
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((prev) => prev - 1);
      try {
        await unlikePost(post_id as string).unwrap();
      } catch {
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } else {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
      try {
        await likePost(post_id as string).unwrap();
      } catch {
        setIsLiked(false);
        setLikeCount((prev) => prev - 1);
      }
    }
  };

  const handleCommentPress = () => {
    bottomSheetRef.current?.present();
  };

  const initials = getInitials(post?.name || post?.username);
  const liftedKg = session?.lifted_kg;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={olyPalette.primary} />
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      {/* ── Section 1: Header Nav ── */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.navBackButton}
          hitSlop={olySpacing[8]}
        >
          <Ionicons
            name="chevron-back"
            size={NAV_ICON_SIZE}
            color={olyColors.text.primary}
          />
          <Text style={styles.navTitle}>Feed</Text>
        </TouchableOpacity>
        <View style={styles.navRight}>
          <TouchableOpacity hitSlop={olySpacing[8]} activeOpacity={0.6}>
            <Ionicons
              name="share-outline"
              size={NAV_ICON_SIZE}
              color={olyColors.text.secondary}
            />
          </TouchableOpacity>
          <TouchableOpacity hitSlop={olySpacing[8]} activeOpacity={0.6}>
            <Ionicons
              name="ellipsis-vertical"
              size={NAV_ICON_SIZE}
              color={olyColors.text.secondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Section 2: User Info + Stats ── */}
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {post?.name || post?.username}
            </Text>
            <Text style={styles.userTime}>
              {getRelativeTime(post?.createdAt)}
            </Text>
          </View>
          <View style={styles.statsRow}>
            <TouchableOpacity onPress={handleLike} style={styles.statItem} activeOpacity={0.7}>
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={18}
                color={isLiked ? olyPalette.white : olyColors.text.secondary}
              />
              <Text style={[styles.statCount, isLiked && { color: olyPalette.white }]}>
                {likeCount}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCommentPress} style={styles.statItem} activeOpacity={0.7}>
              <Ionicons
                name="chatbubble-outline"
                size={16}
                color={olyColors.text.secondary}
              />
              <Text style={styles.statCount}>{post?.commentCount ?? 0}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Section 3: Exercise Summary ── */}
        <View style={styles.exerciseSummary}>
          <Text style={styles.exerciseLabel}>EXERCISE</Text>
          <View style={styles.exerciseRow}>
            <Text style={styles.liftName}>{post?.lift_name}</Text>
            <View style={styles.weightContainer}>
              {liftedKg != null && (
                <>
                  <Text style={styles.weightValue}>{liftedKg}</Text>
                  <Text style={styles.weightUnit}> kg</Text>
                </>
              )}
              {(post as any)?.isPR && (
                <View style={styles.prBadge}>
                  <Text style={styles.prBadgeText}>PR</Text>
                </View>
              )}
            </View>
          </View>
          {post?.opinion ? (
            <Text style={styles.caption}>
              <Text style={styles.captionUsername}>@{post.username} </Text>
              {post.opinion}
            </Text>
          ) : null}
        </View>

        {/* ── Section 4: Tab Switcher ── */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "details" && styles.tabActive]}
            onPress={() => setActiveTab("details")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "details" && styles.tabTextActive,
              ]}
            >
              DETAILS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "notes" && styles.tabActive]}
            onPress={() => setActiveTab("notes")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "notes" && styles.tabTextActive,
              ]}
            >
              NOTES
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Tab Content ── */}
        {activeTab === "details" ? (
          <>
            {/* ── Section 5: Stats Cards ── */}
            <View style={styles.statsCardsRow}>
              <View style={styles.statsCard}>
                <Text style={styles.statsCardLabel}>TOP SET</Text>
                <Text style={styles.statsCardValue}>
                  {session?.lifted_kg ?? "—"}
                </Text>
                {session?.lifted_kg != null && (
                  <Text style={styles.statsCardUnit}>kg</Text>
                )}
              </View>
              <View style={styles.statsCard}>
                <Text style={styles.statsCardLabel}>% OF 1RM</Text>
                <Text style={[styles.statsCardValue, styles.statsCardValueEmpty]}>—</Text>
                <Text style={styles.statsCardSubtitle}>Not tracked</Text>
              </View>
              <View style={styles.statsCard}>
                <Text style={styles.statsCardLabel}>MAKE RATE</Text>
                <Text style={[styles.statsCardValue, styles.statsCardValueEmpty]}>—</Text>
                <Text style={styles.statsCardSubtitle}>Not tracked</Text>
              </View>
            </View>

            {/* ── Section 6: Working Sets ── */}
            <View style={styles.workingSetsSection}>
              <Text style={styles.workingSetsTitle}>WORKING SETS</Text>

              {/* Mock sets — will be replaced with real data from backend */}
              {(() => {
                const mockSets = session?.lifted_kg != null ? [
                  { set_number: 1, reps: "1+1", weight: Math.round(session.lifted_kg * 0.85), percent: "78%", barSpeed: 2, barSpeedLabel: "SLOW", position: 3, positionLabel: "GOOD", isMiss: false, isPostSet: false, isTopSet: false, isPR: false },
                  { set_number: 2, reps: "1+1", weight: Math.round(session.lifted_kg * 0.9), percent: "83%", barSpeed: 3, barSpeedLabel: "ACCEPTABLE", position: 4, positionLabel: "EXCELLENT", isMiss: false, isPostSet: false, isTopSet: false, isPR: false },
                  { set_number: 3, reps: "1+1", weight: Math.round(session.lifted_kg * 0.95), percent: "87%", barSpeed: 3, barSpeedLabel: "ACCEPTABLE", position: 4, positionLabel: "EXCELLENT", isMiss: false, isPostSet: false, isTopSet: false, isPR: false },
                  { set_number: 4, reps: "1", weight: session.lifted_kg, percent: "92%", barSpeed: 5, barSpeedLabel: "EXCELLENT", position: 3, positionLabel: "GOOD", isMiss: false, isPostSet: true, isTopSet: true, isPR: true },
                  { set_number: 5, reps: "1", weight: Math.round(session.lifted_kg * 1.05), percent: "94%", barSpeed: 0, barSpeedLabel: "—", position: 0, positionLabel: "—", isMiss: true, isPostSet: false, isTopSet: false, isPR: false },
                ] : [];

                return mockSets.length > 0 ? mockSets.map((set) => {
                  const isExpanded = expandedSet === set.set_number;
                  const isMiss = set.isMiss;
                  const isPostSet = set.isPostSet;

                  return (
                    <View key={set.set_number} style={isMiss ? styles.setRowMiss : undefined}>
                      <TouchableOpacity
                        style={[
                          styles.setRow,
                          isExpanded && styles.setRowExpanded,
                          isPostSet && !isExpanded && styles.setRowHighlighted,
                          isPostSet && isExpanded && styles.setRowHighlightedExpanded,
                        ]}
                        onPress={() =>
                          setExpandedSet(isExpanded ? null : set.set_number)
                        }
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.setAccentBar,
                            isExpanded && styles.setAccentBarActive,
                            isPostSet && styles.setAccentBarActive,
                            isMiss && styles.setAccentBarMiss,
                          ]}
                        />
                        <Text style={[styles.setLabel, isMiss && styles.setTextMiss]}>
                          SET {set.set_number}
                        </Text>
                        <Text style={[styles.setReps, isMiss && styles.setTextMiss]}>
                          {set.reps}
                        </Text>
                        <View style={{ flex: 1 }} />
                        {isPostSet && (
                          <View style={styles.postedDot} />
                        )}
                        {isMiss && (
                          <View style={styles.missDot} />
                        )}
                        <Text
                          style={[
                            styles.setWeight,
                            isPostSet && styles.setWeightHighlighted,
                            isMiss && styles.setWeightMiss,
                          ]}
                        >
                          {set.weight} kg
                        </Text>
                        <Text
                          style={[
                            styles.setPercent,
                            isMiss && styles.setTextMiss,
                          ]}
                        >
                          {set.percent}
                        </Text>
                        <Ionicons
                          name={isExpanded ? "chevron-up" : "chevron-down"}
                          size={16}
                          color={isMiss ? olyColors.text.disabled : olyColors.text.secondary}
                          style={{ marginLeft: olySpacing[8] }}
                        />
                      </TouchableOpacity>

                      {/* Expanded content */}
                      {isExpanded && (
                        <View
                          style={[
                            styles.setExpandedContent,
                            isPostSet && styles.setExpandedContentHighlighted,
                          ]}
                        >
                          {/* Video placeholder */}
                          {!isMiss && (
                            <TouchableOpacity
                              style={styles.setVideoPlaceholder}
                              onPress={handleOpenFullscreenVideo}
                              activeOpacity={0.8}
                            >
                              {post?.thumbnail_url && (
                                <Image
                                  source={{ uri: post.thumbnail_url }}
                                  style={styles.setVideoThumb}
                                  resizeMode="cover"
                                />
                              )}
                              <View style={styles.setPlayButton}>
                                <Ionicons
                                  name="play"
                                  size={24}
                                  color={olyPalette.white}
                                />
                              </View>
                            </TouchableOpacity>
                          )}

                          {/* Bar Speed */}
                          <View style={styles.metricRow}>
                            <Text style={styles.metricLabel}>BAR SPEED</Text>
                            <Text style={[styles.metricValue, isMiss && styles.setTextMiss]}>
                              {set.barSpeedLabel}
                            </Text>
                          </View>
                          <View style={styles.segmentedBarRow}>
                            {[1, 2, 3, 4].map((seg) => (
                              <View
                                key={seg}
                                style={[
                                  styles.segmentedBar,
                                  isMiss
                                    ? styles.segmentedBarMiss
                                    : seg === set.barSpeed
                                      ? styles.segmentedBarActive
                                      : styles.segmentedBarInactive,
                                ]}
                              />
                            ))}
                          </View>

                          {/* Position */}
                          <View style={styles.metricRow}>
                            <Text style={styles.metricLabel}>POSITION</Text>
                            <Text style={[styles.metricValue, isMiss && styles.setTextMiss]}>
                              {set.positionLabel}
                            </Text>
                          </View>
                          <View style={styles.segmentedBarRow}>
                            {[1, 2, 3, 4].map((seg) => (
                              <View
                                key={seg}
                                style={[
                                  styles.segmentedBar,
                                  isMiss
                                    ? styles.segmentedBarMiss
                                    : seg === set.position
                                      ? styles.segmentedBarActive
                                      : styles.segmentedBarInactive,
                                ]}
                              />
                            ))}
                          </View>

                          {/* Target */}
                          <View style={styles.targetSection}>
                            <Text style={styles.targetLabel}>TARGET</Text>
                            <View style={styles.targetPillsRow}>
                              <View style={styles.targetPill}>
                                <Text style={styles.targetPillText}>
                                  {set.weight} kg
                                </Text>
                              </View>
                              <View style={styles.targetPill}>
                                <Text style={styles.targetPillText}>
                                  {set.reps === "1" ? "1 rep" : set.reps}
                                </Text>
                              </View>
                              {set.isPostSet && (
                                <View style={styles.targetPill}>
                                  <Text style={styles.targetPillText}>
                                    +5 kg
                                  </Text>
                                </View>
                              )}
                            </View>

                            {/* Badges — only on highlighted set */}
                            {(set.isTopSet || set.isPR) && (
                              <View style={styles.badgePillsRow}>
                                {set.isTopSet && (
                                  <View style={styles.badgePillFilled}>
                                    <Text style={styles.badgePillFilledText}>
                                      TOP SET
                                    </Text>
                                  </View>
                                )}
                                {set.isPR && (
                                  <View style={styles.badgePillFilled}>
                                    <Text style={styles.badgePillFilledText}>
                                      PR
                                    </Text>
                                  </View>
                                )}
                              </View>
                            )}
                          </View>
                        </View>
                      )}
                    </View>
                  );
                }) : (
                  <Text style={styles.noSetsText}>No sets recorded.</Text>
                );
              })()}
            </View>

            {/* Coach's Insight */}
            <View style={styles.insightContainer}>
              <Text style={styles.insightTitle}>Coach's Insight</Text>
              <Text style={styles.insightDetail}>
                This was a top set late in the session, where effort naturally
                rises. Completing the lift at an RPE of 8.5 suggests the load was
                challenging without being excessive. Sets like this are often used
                to reinforce confidence before heavier singles appear in the
                program.
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.notesContainer}>
            <Text style={styles.notesEmpty}>No notes yet.</Text>
          </View>
        )}
      </ScrollView>

      {/* Fullscreen Video Modal */}
      <Modal
        visible={fullscreenVideo}
        animationType="fade"
        supportedOrientations={["portrait", "landscape"]}
        onRequestClose={handleCloseFullscreenVideo}
      >
        <View style={styles.fullscreenContainer}>
          <Video
            ref={fullscreenVideoRef}
            source={{ uri: post?.video_url ?? "" }}
            style={styles.fullscreenVideo}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            isLooping
            useNativeControls
          />
          <TouchableOpacity
            style={styles.fullscreenClose}
            onPress={handleCloseFullscreenVideo}
            hitSlop={olySpacing[12]}
          >
            <Ionicons name="close" size={28} color={olyPalette.white} />
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ── Styles ──────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: olyPalette.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* Section 1: Nav Bar */
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: olyLayout.screenPadding,
    paddingVertical: olySpacing[12],
  },
  navBackButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[4],
  },
  navTitle: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  navRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[20],
  },

  /* Section 2: User Info */
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: olyLayout.screenPadding,
    paddingVertical: olySpacing[12],
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.text.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: olySpacing[12],
  },
  avatarText: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyPalette.white,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  userTime: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    marginTop: olySpacing[4],
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[16],
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: olySpacing[4],
  },
  statCount: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
  },

  /* Section 3: Exercise Summary */
  exerciseSummary: {
    paddingHorizontal: olyLayout.screenPadding,
    paddingVertical: olySpacing[8],
  },
  exerciseLabel: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
    marginBottom: olySpacing[4],
  },
  exerciseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  liftName: {
    ...olyTypography.title2,
    color: olyColors.text.primary,
  },
  weightContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: olySpacing[8],
  },
  weightValue: {
    ...olyTypography.title2,
    color: olyColors.text.primary,
  },
  weightUnit: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
  },
  prBadge: {
    backgroundColor: olyPalette.primary,
    borderRadius: olyRadius.sm,
    paddingHorizontal: olySpacing[8],
    paddingVertical: olySpacing[4],
  },
  prBadgeText: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyPalette.white,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  caption: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    marginTop: olySpacing[12],
  },
  captionUsername: {
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  captionBold: {
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },

  /* Section 4: Tab Switcher */
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: olyLayout.screenPadding,
    marginTop: olySpacing[16],
    borderBottomWidth: 1,
    borderBottomColor: olyColors.border.default,
  },
  tab: {
    paddingBottom: olySpacing[12],
    marginRight: olySpacing[24],
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: olyPalette.white,
  },
  tabText: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  tabTextActive: {
    color: olyColors.text.primary,
  },

  /* Section 5: Stats Cards */
  statsCardsRow: {
    flexDirection: "row",
    paddingHorizontal: olyLayout.screenPadding,
    marginTop: olySpacing[16],
    gap: olySpacing[8],
  },
  statsCard: {
    flex: 1,
    backgroundColor: olyElevation.level1.backgroundColor,
    borderWidth: olyElevation.level1.borderWidth,
    borderColor: olyElevation.level1.borderColor,
    borderRadius: olyRadius.lg,
    paddingHorizontal: olySpacing[12],
    paddingVertical: olySpacing[12],
  },
  statsCardLabel: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
    marginBottom: olySpacing[4],
  },
  statsCardValue: {
    ...olyTypography.number,
    color: olyColors.text.primary,
  },
  statsCardValueEmpty: {
    color: olyColors.text.disabled,
  },
  statsCardUnit: {
    ...olyTypography.caption,
    color: olyColors.text.secondary,
    marginTop: olySpacing[4],
  },
  statsCardSubtitle: {
    ...olyTypography.caption,
    color: olyColors.text.disabled,
    marginTop: olySpacing[4],
  },

  /* Section 6: Working Sets */
  workingSetsSection: {
    paddingHorizontal: olyLayout.screenPadding,
    marginTop: olySpacing[32],
  },
  workingSetsTitle: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
    marginBottom: olySpacing[12],
  },

  /* Set Row — base */
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: olyElevation.level1.backgroundColor,
    borderWidth: olyElevation.level1.borderWidth,
    borderColor: olyElevation.level1.borderColor,
    borderRadius: olyRadius.lg,
    paddingVertical: olySpacing[16],
    paddingHorizontal: olySpacing[12],
    marginBottom: olySpacing[8],
  },
  /* Set Row — expanded (normal) */
  setRowExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
    borderColor: olyElevation.level1.borderColor,
  },
  /* Set Row — miss state dim */
  setRowMiss: {
    opacity: 0.5,
  },
  /* Set Row — highlighted (this post's set) */
  setRowHighlighted: {
    borderColor: olyPalette.primary,
  },
  setRowHighlightedExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
    borderColor: olyPalette.primary,
  },

  /* Accent bar */
  setAccentBar: {
    width: 3,
    height: 20,
    borderRadius: olyRadius.sm,
    backgroundColor: olyColors.border.default,
    marginRight: olySpacing[12],
  },
  setAccentBarActive: {
    backgroundColor: olyPalette.primary,
  },
  setAccentBarMiss: {
    backgroundColor: olyColors.border.default,
  },

  /* Set text */
  setLabel: {
    ...olyTypography.label,
    color: olyColors.text.primary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  setReps: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    marginLeft: olySpacing[8],
  },
  setWeight: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
    backgroundColor: olyColors.bg.activeHighlight,
    borderWidth: 1,
    borderColor: olyPalette.primary,
    borderRadius: olyRadius.full,
    paddingHorizontal: olySpacing[12],
    paddingVertical: olySpacing[4],
    overflow: "hidden",
  },
  setPercent: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    marginLeft: olySpacing[8],
  },

  /* MISS dot — small red indicator */
  missDot: {
    width: 6,
    height: 6,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.red,
    marginRight: olySpacing[8],
  },

  /* POSTED dot — small indicator */
  postedDot: {
    width: 6,
    height: 6,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.primary,
    marginRight: olySpacing[8],
  },

  /* Highlighted set weight — filled blue */
  setWeightHighlighted: {
    backgroundColor: olyPalette.primary,
    borderColor: olyPalette.primary,
    color: olyPalette.white,
  },

  /* Miss state */
  setTextMiss: {
    color: olyColors.text.disabled,
  },
  setWeightMiss: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.disabled,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: olyColors.border.default,
    borderRadius: olyRadius.full,
    paddingHorizontal: olySpacing[12],
    paddingVertical: olySpacing[4],
    overflow: "hidden",
    textDecorationLine: "line-through",
  },

  /* Expanded content */
  setExpandedContent: {
    backgroundColor: olyElevation.level1.backgroundColor,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: olyElevation.level1.borderColor,
    borderBottomLeftRadius: olyRadius.lg,
    borderBottomRightRadius: olyRadius.lg,
    paddingHorizontal: olySpacing[16],
    paddingTop: olySpacing[16],
    paddingBottom: olySpacing[12],
    marginBottom: olySpacing[8],
  },
  setExpandedContentHighlighted: {
    borderColor: olyPalette.primary,
  },

  /* Video */
  setVideoPlaceholder: {
    width: "100%",
    height: 160,
    borderRadius: olyRadius.lg,
    backgroundColor: olyColors.bg.overlay,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: olySpacing[16],
  },
  setVideoThumb: {
    ...StyleSheet.absoluteFillObject,
  },
  setPlayButton: {
    width: olyLayout.minTouchTarget,
    height: olyLayout.minTouchTarget,
    borderRadius: olyRadius.full,
    backgroundColor: olyPalette.primary,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },

  /* Metrics */
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: olySpacing[8],
  },
  metricLabel: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
  },
  metricValue: {
    ...olyTypography.label,
    color: olyColors.text.primary,
  },
  metricDivider: {
    height: 1,
    backgroundColor: olyColors.border.default,
    marginVertical: olySpacing[12],
  },

  /* Segmented progress bars */
  segmentedBarRow: {
    flexDirection: "row",
    gap: olySpacing[8],
    marginBottom: olySpacing[16],
  },
  segmentedBar: {
    flex: 1,
    height: olySpacing[4],
    borderRadius: olyRadius.sm,
  },
  segmentedBarActive: {
    backgroundColor: olyPalette.white,
  },
  segmentedBarInactive: {
    backgroundColor: olyColors.border.default,
  },
  segmentedBarMiss: {
    backgroundColor: olyColors.bg.subtleHighlight,
  },

  /* Target */
  targetSection: {
    marginTop: olySpacing[4],
  },
  targetLabel: {
    ...olyTypography.label,
    color: olyColors.text.secondary,
    letterSpacing: olyLetterSpacing.uppercase,
    marginBottom: olySpacing[8],
  },
  targetPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: olySpacing[8],
  },
  targetPill: {
    backgroundColor: olyColors.bg.subtleHighlight,
    borderRadius: olyRadius.full,
    paddingHorizontal: olySpacing[16],
    paddingVertical: olySpacing[8],
  },
  targetPillText: {
    ...olyTypography.bodySmall,
    fontFamily: olyFonts.medium,
    color: olyColors.text.secondary,
  },

  /* Badge pills (TOP SET, PR) — filled */
  badgePillsRow: {
    flexDirection: "row",
    gap: olySpacing[8],
    marginTop: olySpacing[12],
  },
  badgePillFilled: {
    backgroundColor: olyPalette.primary,
    borderRadius: olyRadius.full,
    paddingHorizontal: olySpacing[12],
    paddingVertical: olySpacing[4],
  },
  badgePillFilledText: {
    ...olyTypography.caption,
    fontFamily: olyFonts.medium,
    color: olyPalette.white,
    letterSpacing: olyLetterSpacing.uppercase,
  },

  noSetsText: {
    ...olyTypography.body,
    color: olyColors.text.secondary,
    textAlign: "center",
    paddingVertical: olySpacing[24],
  },

  /* Notes tab */
  notesContainer: {
    paddingHorizontal: olyLayout.screenPadding,
    paddingVertical: olySpacing[40],
    alignItems: "center",
  },
  notesEmpty: {
    ...olyTypography.body,
    color: olyColors.text.secondary,
  },

  /* Fullscreen video */
  fullscreenContainer: {
    flex: 1,
    backgroundColor: olyPalette.black,
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenVideo: {
    width: "100%",
    height: "100%",
  },
  fullscreenClose: {
    position: "absolute",
    top: 56,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: olyRadius.full,
    backgroundColor: olyColors.bg.overlay,
    justifyContent: "center",
    alignItems: "center",
  },

  /* Scroll content */
  scrollContent: {
    paddingBottom: olySpacing[40],
  },

  /* Existing detail sections (legacy — to be redesigned) */
  detailContainer: {
    paddingHorizontal: olyLayout.screenPadding,
    gap: olySpacing[8],
    marginTop: olySpacing[16],
  },

  /* Coach's Insight */
  insightContainer: {
    marginHorizontal: olyLayout.screenPadding,
    marginTop: olySpacing[24],
    backgroundColor: olyColors.bg.activeHighlight,
    borderColor: olyPalette.primary,
    borderWidth: 1,
    borderRadius: olyRadius.lg,
    paddingHorizontal: olySpacing[16],
    paddingVertical: olySpacing[16],
    gap: olySpacing[8],
  },
  insightTitle: {
    ...olyTypography.body,
    fontFamily: olyFonts.medium,
    color: olyColors.text.primary,
  },
  insightDetail: {
    ...olyTypography.bodySmall,
    color: olyColors.text.secondary,
    lineHeight: 20,
  },
});
