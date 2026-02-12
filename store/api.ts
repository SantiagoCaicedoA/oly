import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import { API_BASE_URL, API_ROUTES } from "@/utils/api-routes";

import {
  AuthState,
  LoginValues,
  SignUpValues,
  TokenData,
} from "@/types/api/auth";
import {
  OnboardingApiPayload,
  OnboardingApiResponse,
} from "@/types/api/onboarding";
import { logout } from "./reducer/authSlice";

interface RootState {
  auth: AuthState;
}

const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    const userId = state.auth.user?._id;

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    if (userId) {
      headers.set("x-user-id", userId);
    }

    return headers;
  },
});

const customBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const url = typeof args === "string" ? args : args.url;
  const method = typeof args === "string" ? "GET" : args.method || "POST";
  const body = typeof args === "string" ? undefined : args.body;

  if (body instanceof FormData) {
    const headers = new Headers();

    const state = api.getState() as RootState;
    const token = state.auth.token;
    const userId = state.auth.user?._id;

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    if (userId) {
      headers.set("x-user-id", userId);
    }

    const baseUrl = API_BASE_URL;

    const result = await fetch(`${baseUrl}${url}`, {
      method,
      headers,
      body,
    });

    if (!result.ok) {
      const errorData = await result.json().catch(() => ({}));
      return {
        error: {
          status: result.status,
          data: errorData,
        } as FetchBaseQueryError,
      };
    }

    const data = await result.json();
    return { data };
  }

  return baseQueryWithAuth(args, api, extraOptions);
};

const customBaseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await customBaseQuery(args, api, extraOptions);

  if (
    result?.error &&
    (result.error.status === 401 || result.error.status === 403)
  ) {
    const state = api.getState() as RootState;
    const refreshToken = state.auth.token;

    if (!refreshToken) {
      api.dispatch(logout());
      return result;
    }

    try {
      const refreshResponse = await fetch(
        `${API_BASE_URL}/api/v1/auth/refresh`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        },
      );

      if (!refreshResponse.ok) {
        api.dispatch(logout());
        return result;
      }

      const newTokens = (await refreshResponse.json()) as TokenData;

      // api.dispatch(setTokens(newTokens));

      const retryResult = await customBaseQuery(args, api, extraOptions);
      return retryResult;
    } catch (err) {
      api.dispatch(logout());
      return result;
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: customBaseQueryWithReauth,
  tagTypes: ["Athlete", "Auth"],
  endpoints: (builder) => ({
    signup: builder.mutation<any, SignUpValues>({
      query: (body) => ({
        url: API_ROUTES.AUTH.SIGNUP,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Athlete"],
    }),
    login: builder.mutation<any, LoginValues>({
      query: (body) => ({
        url: API_ROUTES.AUTH.LOGIN,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Athlete"],
    }),

    submitProfile: builder.mutation<
      OnboardingApiResponse,
      OnboardingApiPayload
    >({
      query: (payload) => ({
        url: API_ROUTES.AUTH.ONBOARDING,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["Athlete"],
    }),
    uploadProfileImage: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: API_ROUTES.AUTH.ONBOARDING_IMAGE_UPLOAD,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Athlete"],
    }),
    uploadAthleteVideo: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: API_ROUTES.AUTH.ONBOARDING_VIDEO_UPLOAD,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Athlete"],
    }),
    createNewPost: builder.mutation<any, { formData: FormData }>({
      query: ({ formData }) => ({
        url: API_ROUTES.ATHLETE.CREATE_NEW_POST,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Athlete"],
    }),
    getPosts: builder.query<any, void>({
      query: () => ({
        url: API_ROUTES.ATHLETE.GET_POSTS,
        method: "GET",
      }),
      providesTags: ["Athlete"],
    }),
    getPostById: builder.query<any, string>({
      query: (postId) => ({
        url: `${API_ROUTES.ATHLETE.GET_POST_BY_ID}/${postId}`,
        method: "GET",
      }),
      providesTags: ["Athlete"],
    }),
    submitAI: builder.mutation<OnboardingApiResponse, OnboardingApiPayload>({
      query: (payload) => ({
        url: API_ROUTES.ATHLETE.AI_TRAINING,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Athlete"],
    }),
  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
  useSubmitProfileMutation,
  useUploadProfileImageMutation,
  useUploadAthleteVideoMutation,
  useCreateNewPostMutation,
  useGetPostsQuery,
  useGetPostByIdQuery,
  useSubmitAIMutation,
} = api;
