/**
 * Profile-screen API types — /api/lifts/me and /api/follow/status.
 * Shapes mirror the backend's liftController.publicLift and
 * followController.getFollowStatus exactly.
 */

export type MyLiftStatus = "live" | "held" | "suspended" | "removed";

export interface MyLift {
  id: string;
  liftType: "snatch" | "cleanjerk";
  weightKg: number;
  bodyweightKg: number;
  liftDate: string;
  videoUrl: string;
  status: MyLiftStatus;
  pendingReview: boolean;
  review?: { reason: string; at: string };
  createdAt: string;
}

export interface MyLiftsResponse {
  success: boolean;
  lifts: MyLift[];
}

export interface FollowStatusResponse {
  success: boolean;
  data: {
    isFollowing: boolean;
    isFollowedBy: boolean;
    followers: number;
    following: number;
  };
}
