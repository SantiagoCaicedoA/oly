import { LoginValues, SignUpValues } from "@/types/api/auth";
import * as Yup from "yup";
import * as yup from "yup";

export const loginSchema = Yup.object({
  email: Yup.string()
    .transform((value) => value?.trim())
    .required("Email is required")
    .matches(
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      "Please enter a valid email address",
    ),

  password: Yup.string().required("Password is required"),
}) as Yup.ObjectSchema<LoginValues>;

export const signUpSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),

  email: Yup.string()
    .transform((value) => value?.trim())
    .required("Email is required")
    .matches(
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      "Please enter a valid email address",
    ),

  password: Yup.string()
    .required("Password is required")
    .min(7, "Password must be at least 7 characters")
    .matches(
      /^(?=.*[A-Z])(?=.*\d).+$/,
      "Password must contain at least one uppercase letter and one number",
    ),
}) as Yup.ObjectSchema<SignUpValues>;

export const createPostSchema = yup.object({
  video: yup.string().required("Video is required"),
  liftName: yup.string().required("Please select a lift name"),
  loadLifted: yup
    .string()
    .required("Load lifted is required")
    .test("is-greater-than-zero", "Load must be greater than 0", (value) => {
      return Number(value) > 0;
    }),

  opinion: yup.string().default(""),
  contextEnabled: yup.boolean().default(false),
  contextValue: yup.string().default(""),

  intentEnabled: yup.boolean().default(false),
  intentValue: yup
    .string()
    .default("")
    .test(
      "intent-required",
      "Please select an intent option",
      function (value) {
        const { intentEnabled } = this.parent;
        if (intentEnabled && !value) return false;
        return true;
      },
    ),

  effortEnabled: yup.boolean().default(false),
  effortRating: yup
    .number()
    .default(0)
    .test(
      "effort-required",
      "Please rate the effort from 1-5",
      function (value) {
        const { effortEnabled } = this.parent;
        if (effortEnabled && (!value || value < 1 || value > 5)) return false;
        return true;
      },
    ),
});
export const onboardingScreen1Schema = yup.object({
  name: yup.string().default(""),
  user_name: yup.string().default(""),
  country: yup.string().default(""),
  age: yup.string().required("Age is required"),
  weight: yup.string().required("Body weight is required"),
  weightUnit: yup.string().oneOf(["KG", "LB"]).default("KG"),
  experience: yup.string().required("Experience is required"),
  sex: yup.string().default("male"),
  height: yup.string().default(""),
  height_unit: yup.string().oneOf(["cm", "ft"]).default("cm"),
  measurement_system: yup
    .string()
    .oneOf(["Metric", "Imperial"])
    .default("Metric"),
  bio: yup.string().default(""),
});
