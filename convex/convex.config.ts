import { defineApp } from "convex/server";
import { v } from "convex/values";
import workflow from "@convex-dev/workflow/convex.config.js";
import resend from "@convex-dev/resend/convex.config.js";

const app = defineApp({
  env: {
    GENERATION_WORKER_URL: v.optional(v.string()),
    GENERATION_BACKEND_URL: v.optional(v.string()),
    PAYMENT_BACKEND_TOKEN: v.optional(v.string()),
    RAZORPAY_KEY_ID: v.optional(v.string()),
    RAZORPAY_KEY_SECRET: v.optional(v.string()),
    RAZORPAY_AMOUNT_PAISE: v.optional(v.string()),
    SITE_URL: v.optional(v.string()),
    JWT_PRIVATE_KEY: v.optional(v.string()),
    JWKS: v.optional(v.string()),
    GOOGLE_CLIENT_ID: v.optional(v.string()),
    GOOGLE_CLIENT_SECRET: v.optional(v.string()),
    RESEND_API_KEY: v.optional(v.string()),
    RESEND_WEBHOOK_SECRET: v.optional(v.string()),
    EMAIL_FROM: v.optional(v.string()),
    EMAIL_OWNER_TO: v.optional(v.string()),
    EMAIL_ENABLED: v.optional(v.string()),
    EMAIL_USER_EVENTS_TO: v.optional(v.string())
  }
});
app.use(resend);
app.use(workflow);

export default app;
