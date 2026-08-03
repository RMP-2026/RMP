import { Axiom } from "@axiomhq/js";
import { AxiomJSTransport, ConsoleTransport, Logger } from "@axiomhq/logging";

const token = process.env.AXIOM_TOKEN;
const dataset = process.env.AXIOM_DATASET;

/**
 * Falls back to console-only logging when Axiom isn't configured yet (no account
 * access available to provision it automatically — see PLAN.md Phase 0 open items).
 * Reuses apps/web's AXIOM_TOKEN/AXIOM_DATASET since Inngest functions run inside
 * apps/web's process (mounted at /api/inngest), not as a standalone deploy target.
 */
export const logger = new Logger({
  transports:
    token && dataset
      ? [new AxiomJSTransport({ axiom: new Axiom({ token }), dataset })]
      : [new ConsoleTransport()],
});

if (!token || !dataset) {
  console.warn("[@rmp/jobs] AXIOM_TOKEN/AXIOM_DATASET not set — Axiom log drain disabled, logging to console only.");
}
