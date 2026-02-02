import { LoginValues, SignUpValues } from "@/types/api/auth";
import * as Yup from "yup";

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
