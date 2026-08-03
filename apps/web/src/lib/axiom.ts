import { Axiom } from "@axiomhq/js";
import { AxiomJSTransport, ConsoleTransport, Logger } from "@axiomhq/logging";
import { nextJsFormatters } from "@axiomhq/nextjs";

const token = process.env.AXIOM_TOKEN;
const dataset = process.env.AXIOM_DATASET;

/**
 * Falls back to console-only logging when Axiom isn't configured yet (no account
 * access available to provision it automatically — see PLAN.md Phase 0 open items).
 * Fail-open: server code can log unconditionally, same scaffolding tradeoff as
 * ratelimit.ts.
 */
export const logger = new Logger({
  transports:
    token && dataset
      ? [new AxiomJSTransport({ axiom: new Axiom({ token }), dataset })]
      : [new ConsoleTransport()],
  formatters: nextJsFormatters,
});

if (!token || !dataset) {
  console.warn("[apps/web] AXIOM_TOKEN/AXIOM_DATASET not set — Axiom log drain disabled, logging to console only.");
}
