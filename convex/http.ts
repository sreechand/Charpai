import { httpRouter } from "convex/server";

import { auth } from "./auth";
import { env, httpAction } from "./_generated/server";
import { emailService } from "./notifications";

const http = httpRouter();

auth.addHttpRoutes(http);
http.route({ path: "/resend-webhook", method: "POST", handler: httpAction(async (ctx, request) => {
  if (!env.RESEND_WEBHOOK_SECRET) return new Response("Email webhook is not configured.", { status: 503 });
  return await emailService().handleResendEventWebhook(ctx, request);
}) });

export default http;
