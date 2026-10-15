import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { ConvexCredentialsUserConfig } from "@convex-dev/auth/providers/ConvexCredentials";

import { journeyContext, writeConfirmed } from "./funnel";
import { safeFunnelWrite } from "./funnelAction";
import { funnelErrorCode } from "../lib/funnel-events";
import { env } from "./_generated/server";
import { internal } from "./_generated/api";

const passwordProvider = Password({
      profile(params) {
        const email = typeof params.email === "string" ? params.email.trim().toLowerCase() : "";
        const name = typeof params.name === "string" ? params.name.trim() : "";

        if (!email) {
          throw new Error("Email is required.");
        }

        return {
          email,
          ...(name ? { name } : {})
        };
      }
    });
// Convex Auth applies the provider's options after its placeholder fields.
const passwordOptions = (passwordProvider as typeof passwordProvider & { options: ConvexCredentialsUserConfig }).options;
const authorizePassword = passwordOptions.authorize;
passwordOptions.authorize = async (params, ctx) => {
  const context = journeyContext({visitId: params.telemetryVisitId, attemptId: params.telemetryAttemptId});
  const flow = params.flow === "signUp" ? "signup" : "login";
  const key = `password:${Date.now()}:${Math.random()}`;
  const startedAt = Date.now();
  await safeFunnelWrite(ctx, {...context, eventId: `${key}:start`, name: "auth_started", method: "password", flow});
  try {
    const result = await authorizePassword(params, ctx);
    if (result) await safeFunnelWrite(ctx, {...context, eventId: `${key}:accepted`, name: "auth_credentials_accepted", method: "password", flow, userId: result.userId, elapsedMs: Date.now()-startedAt});
    return result;
  } catch (error) {
    await safeFunnelWrite(ctx, {...context, eventId: `${key}:failed`, name: "auth_failed", method: "password", flow, errorCode: funnelErrorCode(error), elapsedMs: Date.now()-startedAt});
    const message = error instanceof Error ? error.message : "";
    if (message.includes("InvalidAccountId")) {
      throw new ConvexError({ code: "ACCOUNT_NOT_FOUND" });
    }
    if (message.includes("InvalidSecret") || message === "Invalid credentials") {
      throw new ConvexError({ code: "INCORRECT_PASSWORD" });
    }
    throw error;
  }
};

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  callbacks: {
    async beforeSessionCreation(ctx, { userId }) {
      try { await writeConfirmed(ctx, {eventId: `session:${userId}:${Date.now()}:${Math.random()}`, name: "session_created", userId}); } catch { console.error("funnel_write_failed:session_created"); }
      const eventKey = `login:${userId}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
      await ctx.scheduler.runAfter(0, internal.notifications.login, { userId, eventKey });
    },
    async afterUserCreatedOrUpdated(ctx, { userId, existingUserId, provider }) {
      if (provider.id === "google") {try {await writeConfirmed(ctx,{eventId:`oauth:${userId}:${Date.now()}:${Math.random()}`,name:"auth_credentials_accepted",method:"google",userId});}catch {console.error("funnel_write_failed:oauth_accepted");}}
      if (!existingUserId) { try { await writeConfirmed(ctx, {eventId: `account:${userId}`, name: "account_created", userId, ...(provider.id === "google" || provider.id === "password" ? {method: provider.id} : {})}); } catch { console.error("funnel_write_failed:account_created"); } }
      if (!existingUserId) await ctx.scheduler.runAfter(0, internal.notifications.accountSignup, { userId });
    }
  },
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    }),
    passwordProvider
  ]
});
