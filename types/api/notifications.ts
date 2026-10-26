/** Shape of GET /api/notifications, as notificationController.list sends it. */
export type NotificationType =
  | "like"
  | "comment"
  | "follow"
  | "follow_request"
  | "lift_verified"
  | "lift_rejected"
  | "rank_up"
  | "rank_down"
  | "proximity"
  // Not in the backend yet. Planned for the MVP; the screen already draws them.
  | "comment_reply"
  | "comment_like"
  | "olys_earned"
  | "challenge_ending"
  | "challenge_completed"
  | "following_pr";

export interface NotificationActor {
  _id: string;
  name?: string;
  username?: string;
  profile?: { display_name?: string; profile_image_url?: string };
}

export interface OlyNotification {
  _id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, any> | null;
  count: number;
  actor: NotificationActor | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  page: number;
  limit: number;
  total?: number;
  totalPages: number;
  data: OlyNotification[];
}

/** GET/PUT /api/notifications/preferences. "mute" means no push; the inbox still fills. */
export interface NotificationPrefs {
  muteSocial: boolean;
  muteLifts: boolean;
  muteRank: boolean;
  quietHoursOff: boolean;
}
