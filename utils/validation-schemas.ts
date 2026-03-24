import { LoginValues, SignUpFormValues, SignUpValues } from "@/types/api/auth";
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

/**
 * Legacy schema — kept for backwards compatibility.
 * New sign-up screen uses signUpFormSchema below.
 */
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

/**
 * Redesigned sign-up form schema.
 * Split name → firstName + lastName, added confirmPassword.
 */
export const signUpFormSchema = Yup.object({
  firstName: Yup.string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters"),

  lastName: Yup.string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters"),

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
      "Must contain at least one uppercase letter and one number",
    ),

  confirmPassword: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("password")], "Passwords do not match"),
}) as Yup.ObjectSchema<SignUpFormValues>;

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
/**
 * Legacy onboarding screen 1 schema — kept for reference.
 * Replaced by onboardingScreen1Schema below.
 */
// export const _legacyOnboardingScreen1Schema = yup.object({
//   name: yup.string().default(""),
//   user_name: yup.string().default(""),
//   country: yup.string().default(""),
//   age: yup.string().required("Age is required"),
//   weight: yup.string().required("Body weight is required"),
//   weightUnit: yup.string().oneOf(["KG", "LB"]).default("KG"),
//   experience: yup.string().required("Experience is required"),
//   sex: yup.string().default("male"),
//   height: yup.string().default(""),
//   height_unit: yup.string().oneOf(["cm", "ft"]).default("cm"),
//   measurement_system: yup.string().oneOf(["Metric", "Imperial"]).default("Metric"),
//   bio: yup.string().default(""),
// });

/**
 * Redesigned onboarding screen 1 schema (v2).
 * DOB replaces age, weightlifting exposure replaces experience counter,
 * height added with unit toggle, bio & measurement_system removed.
 */
export const onboardingScreen1Schema = yup.object({
  name: yup.string().default(""),
  user_name: yup
    .string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters")
    .matches(
      /^[a-zA-Z0-9._]+$/,
      "Only letters, numbers, dots and underscores",
    ),
  country: yup.string().required("Country is required"),
  dobDay: yup
    .string()
    .required("Day is required")
    .matches(/^\d{1,2}$/, "Invalid day")
    .test("valid-day", "Day must be 1-31", (v) => {
      const n = parseInt(v || "", 10);
      return n >= 1 && n <= 31;
    }),
  dobMonth: yup
    .string()
    .required("Month is required")
    .matches(/^\d{1,2}$/, "Invalid month")
    .test("valid-month", "Month must be 1-12", (v) => {
      const n = parseInt(v || "", 10);
      return n >= 1 && n <= 12;
    }),
  dobYear: yup
    .string()
    .required("Year is required")
    .matches(/^\d{4}$/, "Enter a 4-digit year")
    .test("valid-year-range", "You must be between 10 and 110 years old", (v) => {
      const year = parseInt(v || "", 10);
      const now = new Date().getFullYear();
      return year >= now - 110 && year <= now - 10;
    }),
  sex: yup.string().default("male"),
  weight: yup.string().required("Body weight is required"),
  weightUnit: yup.string().oneOf(["KG", "LB"]).default("KG"),
  height: yup.string().default(""),
  height_unit: yup.string().oneOf(["cm", "ft"]).default("cm"),
  weightliftingExposure: yup
    .string()
    .required("Please select your experience level")
    .oneOf(["new", "developing", "experienced", "competitive"]),
}).test(
  "valid-date",
  "Please enter a valid date of birth",
  function (values) {
    const { dobDay, dobMonth, dobYear } = values;
    if (!dobDay || !dobMonth || !dobYear) return true; // individual field validators handle empty
    const day = parseInt(dobDay, 10);
    const month = parseInt(dobMonth, 10);
    const year = parseInt(dobYear, 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return true;
    const date = new Date(year, month - 1, day);
    // Check the date constructor didn't roll over (e.g. Aug 32 → Sep 1)
    const isRealDate =
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day;
    if (!isRealDate) {
      return this.createError({
        path: "dobDay",
        message: "This date doesn't exist",
      });
    }
    return true;
  },
);
