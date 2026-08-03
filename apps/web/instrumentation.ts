import * as Sentry from "@sentry/nextjs";
import { createOnRequestError } from "@axiomhq/nextjs";

import { logger } from "@/lib/axiom";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

const axiomOnRequestError = createOnRequestError(logger);

export const onRequestError: typeof axiomOnRequestError = async (...args) => {
  await Promise.all([Sentry.captureRequestError(...args), axiomOnRequestError(...args)]);
};
