/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as files from "../files.js";
import type * as funnel from "../funnel.js";
import type * as funnelAction from "../funnelAction.js";
import type * as generation from "../generation.js";
import type * as generationTelemetry from "../generationTelemetry.js";
import type * as generationWorker from "../generationWorker.js";
import type * as generationWorkerRequest from "../generationWorkerRequest.js";
import type * as generationWorkflow from "../generationWorkflow.js";
import type * as http from "../http.js";
import type * as notifications from "../notifications.js";
import type * as payments from "../payments.js";
import type * as photoAnalysis from "../photoAnalysis.js";
import type * as photoAnalysisFields from "../photoAnalysisFields.js";
import type * as razorpay from "../razorpay.js";
import type * as runs from "../runs.js";
import type * as storybookPages from "../storybookPages.js";
import type * as storybookPhotos from "../storybookPhotos.js";
import type * as telemetry from "../telemetry.js";
import type * as waitlist from "../waitlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  files: typeof files;
  funnel: typeof funnel;
  funnelAction: typeof funnelAction;
  generation: typeof generation;
  generationTelemetry: typeof generationTelemetry;
  generationWorker: typeof generationWorker;
  generationWorkerRequest: typeof generationWorkerRequest;
  generationWorkflow: typeof generationWorkflow;
  http: typeof http;
  notifications: typeof notifications;
  payments: typeof payments;
  photoAnalysis: typeof photoAnalysis;
  photoAnalysisFields: typeof photoAnalysisFields;
  razorpay: typeof razorpay;
  runs: typeof runs;
  storybookPages: typeof storybookPages;
  storybookPhotos: typeof storybookPhotos;
  telemetry: typeof telemetry;
  waitlist: typeof waitlist;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  resend: import("@convex-dev/resend/_generated/component.js").ComponentApi<"resend">;
  workflow: import("@convex-dev/workflow/_generated/component.js").ComponentApi<"workflow">;
  funnelRateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"funnelRateLimiter">;
};
