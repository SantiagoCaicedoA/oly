/**
 * Notifications — SAMPLE DATA for development.
 *
 * Written in the exact shape GET /api/notifications returns, so the screen
 * runs the same code on sample and real rows. useNotificationFeed() shows
 * these only in a dev build, and only while the account has no real
 * notifications yet. Release builds never see them.
 */
import type { OlyNotification } from "@/types/api/notifications";
import { useGetNotificationsQuery } from "@/store/api";

const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();
const actor = (id: string, name: string) => ({ _id: id, name, profile: { display_name: name } });

export const SAMPLE_NOTIFICATIONS: OlyNotification[] = [
  { _id: "n1", type: "rank_up", title: "You moved up", body: "You're now #12 in Men 94 kg, Colombia", data: { rank: 12 }, count: 1, actor: null, read: false, createdAt: ago(12) },
  { _id: "n2", type: "like", title: "New likes", body: "Valentina Ospina and 13 others liked your 120 kg snatch", data: { postId: "" }, count: 14, actor: actor("u1", "Valentina Ospina"), read: false, createdAt: ago(40) },
  { _id: "n3", type: "following_pr", title: "Valentina Ospina hit a PR", body: "105 kg clean and jerk, up 3 kg", data: { kg: 105 }, count: 1, actor: actor("u1", "Valentina Ospina"), read: false, createdAt: ago(60) },
  { _id: "n4", type: "follow_request", title: "Follow request", body: "Julián Rentería wants to follow you", data: { userId: "u2" }, count: 1, actor: actor("u2", "Julián Rentería"), read: false, createdAt: ago(70) },
  { _id: "n5", type: "comment_reply", title: "Laura Gómez replied", body: "Haha same, my hips were way too early", data: {}, count: 1, actor: actor("u3", "Laura Gómez"), read: false, createdAt: ago(120) },
  { _id: "n6", type: "challenge_ending", title: "Challenge ends tomorrow", body: "One more single at 90% of your snatch", data: { done: 2, total: 3 }, count: 1, actor: null, read: false, createdAt: ago(180) },
  { _id: "n8", type: "comment_like", title: "Diego Arango liked your comment", body: "Clean bar path on that one", data: {}, count: 1, actor: actor("u4", "Diego Arango"), read: true, createdAt: ago(240) },
  { _id: "n9", type: "olys_earned", title: "You earned 200 olys", body: "For your verified clean and jerk", data: { olys: 200 }, count: 1, actor: null, read: false, createdAt: ago(300) },
  { _id: "n10", type: "lift_verified", title: "Lift verified", body: "Your 150 kg clean and jerk is on the board", data: { kg: 150 }, count: 1, actor: null, read: true, createdAt: ago(305) },
  { _id: "n11", type: "comment", title: "New comment", body: "Camilo Ortiz: That turnover though. What did you change?", data: { postId: "" }, count: 1, actor: actor("u5", "Camilo Ortiz"), read: true, createdAt: ago(360) },
  { _id: "n12", type: "lift_rejected", title: "Lift needs another look", body: "The 118 kg snatch video cut off before the lockout", data: { kg: 118 }, count: 1, actor: null, read: true, createdAt: ago(60 * 26) },
  { _id: "n13", type: "proximity", title: "Within reach", body: "2 kg behind #11 in your class", data: { kg: 2 }, count: 1, actor: null, read: true, createdAt: ago(60 * 60) },
  { _id: "n14", type: "follow", title: "New follower", body: "Mara Ríos started following you", data: { userId: "u6" }, count: 1, actor: actor("u6", "Mara Ríos"), read: true, createdAt: ago(60 * 80) },
  { _id: "n15", type: "rank_down", title: "Someone passed you", body: "Diego Arango moved past you. You're #14", data: { rank: 14 }, count: 1, actor: actor("u4", "Diego Arango"), read: true, createdAt: ago(60 * 100) },
  { _id: "n16", type: "challenge_completed", title: "Challenge completed", body: "Three singles at 90%. 200 olys on the way", data: { done: 3, total: 3 }, count: 1, actor: null, read: true, createdAt: ago(60 * 120) },
];

/**
 * The notification list. Real rows when there are any; in a dev build with
 * an empty account, the sample above so the screen can be reviewed.
 */
export function useNotificationFeed() {
  const q = useGetNotificationsQuery({ page: 1, limit: 50 });
  const real = q.data?.data ?? [];
  const sample = __DEV__ && !q.isLoading && real.length === 0;
  return {
    items: sample ? SAMPLE_NOTIFICATIONS : real,
    isSample: sample,
    isLoading: q.isLoading,
    isError: q.isError && !sample,
    refetch: q.refetch,
    isFetching: q.isFetching,
  };
}
