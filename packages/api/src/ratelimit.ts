import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

/**
 * Null when Upstash isn't configured yet (no account access available to provision it
 * automatically — see PLAN.md Phase 1 open items). Callers must treat null as
 * fail-open, not throw, so the rest of the API stays usable pre-configuration; this is
 * a deliberate scaffolding tradeoff, not the intended production behavior.
 */
export const ratelimit =
  redisUrl && redisToken
    ? new Ratelimit({
        redis: new Redis({ url: redisUrl, token: redisToken }),
        limiter: Ratelimit.slidingWindow(10, "10 s"),
        analytics: true,
        prefix: "rmp",
      })
    : null;

if (!ratelimit) {
  console.warn(
    "[@rmp/api] UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN not set — rate limiting is disabled (fail-open). Set them before production.",
  );
}
