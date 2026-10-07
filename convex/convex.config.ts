import { defineApp } from "convex/server";
import { v } from "convex/values";

const app = defineApp({
  env: {
    PAYMENT_BACKEND_TOKEN: v.optional(v.string()),
    RAZORPAY_KEY_ID: v.optional(v.string()),
    RAZORPAY_KEY_SECRET: v.optional(v.string()),
    RAZORPAY_AMOUNT_PAISE: v.optional(v.string()),
    SITE_URL: v.optional(v.string()),
    JWT_PRIVATE_KEY: v.optional(v.string()),
    JWKS: v.optional(v.string()),
    GOOGLE_CLIENT_ID: v.optional(v.string()),
    GOOGLE_CLIENT_SECRET: v.optional(v.string())
  }
});

export default app;
