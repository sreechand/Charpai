import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { ConvexCredentialsUserConfig } from "@convex-dev/auth/providers/ConvexCredentials";

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
  try {
    return await authorizePassword(params, ctx);
  } catch (error) {
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
      const eventKey = `login:${userId}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
      await ctx.scheduler.runAfter(0, internal.notifications.login, { userId, eventKey });
    },
    async afterUserCreatedOrUpdated(ctx, { userId, existingUserId }) {
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
