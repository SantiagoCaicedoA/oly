export interface CreateNewPostResponse {
  success: boolean;
  message: string;
  data: CreateNewPostData;
}

export interface CreateNewPostData {
  _id: string;
  createdAt: string;
  updatedAt: string;
  is_private: boolean;
  is_public: boolean;
  lift_name: string;
  opinion: string;
  status: "DRAFT" | string;
  user: string;
  video_url: string;
  session_detail: {
    context: boolean;
    effort_value: number;
    intent_opt: string;
    isEffort: boolean;
    isIntent: boolean;
    lifted_kg: number;
    rpe: string;
  };
}

export interface GetPostsResponse {
  success: boolean;
  count: number;
  total: number;
  data: Post[];
}
export interface GetPostsParams {
  page: number;
  limit: number;
}
export interface Post {
  _id: string;
  createdAt: string;
  updatedAt: string;
  is_private: boolean;
  is_public: boolean;
  lift_name: string;
  opinion: string;
  status: "DRAFT" | string;
  video_url: string;
  session_detail: SessionDetail | null;
  user: PostUser;
  username: string;
  name: string;
  isLiked: boolean;
  likeCount: number;
  commentCount: number;
  country: string;
}

export interface SessionDetail {
  context: boolean;
  effort_value: number;
  intent_opt: string;
  isEffort: boolean;
  isIntent: boolean;
  lifted_kg: number;
  rpe: string;
  context_value: string;
  /** Athlete's bodyweight at the time of the lift. Drives the x bodyweight cell. */
  bodyweight_kg?: number;
  /** "Fast" | "Moderate" | "Grinder", as the composer's pill sets it. */
  bar_speed?: string;
  /** "Easy" | "Hard" | "Max", as the composer's pill sets it. */
  effort?: string;
  /** True when the athlete marked this the top set of the session. */
  top_set?: boolean;
}

export interface PostUser {
  _id: string;
  username?: string;
  profile_image?: string;
}

export interface GetPostByIdResponse {
  success: boolean;
  data: PostById;
}

export interface PostById {
  _id: string;
  createdAt: string;
  updatedAt: string;
  is_private: boolean;
  is_public: boolean;
  lift_name: string;
  opinion: string;
  status: "DRAFT" | "PUBLISHED" | string;
  video_url: string;
  user: PostUserById;
  session_detail: SessionDetail;
  name: string;
  username: string;
  is_liked: boolean;
  commentCount: number;
  likeCount: number;
  isLiked: boolean;
  thumbnail_url: string;
}
export interface PostUserById {
  _id: string;
  name: string;
  profile: {
    country: string;
  };
}
export interface LikeUnlikeResponse {
  success: boolean;
  message: string;
  likeCount: number;
  isLiked: boolean;
}
