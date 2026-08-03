import { db, users } from "@rmp/db";
import { TRPCError } from "@trpc/server";
import twilio from "twilio";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, router } from "../trpc";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

function verifyService() {
  if (!accountSid || !authToken || !verifyServiceSid) {
    // Decoupled from Clerk sign-in by design (Phase 1) — missing Twilio config disables
    // only this feature, not sign-in. No account access available to provision Twilio
    // automatically; see PLAN.md Phase 1 open items.
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Phone verification isn't configured yet.",
    });
  }
  return twilio(accountSid, authToken).verify.v2.services(verifyServiceSid);
}

export const phoneRouter = router({
  sendCode: protectedProcedure.input(z.object({ phone: z.string().min(8) })).mutation(async ({ input }) => {
    await verifyService().verifications.create({ to: input.phone, channel: "sms" });
    return { sent: true };
  }),

  verifyCode: protectedProcedure
    .input(z.object({ phone: z.string().min(8), code: z.string().min(4) }))
    .mutation(async ({ ctx, input }) => {
      const check = await verifyService().verificationChecks.create({ to: input.phone, code: input.code });
      if (check.status !== "approved") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired code." });
      }

      await db
        .update(users)
        .set({ phone: input.phone, phoneVerifiedAt: new Date(), updatedAt: new Date() })
        .where(eq(users.id, ctx.userId));

      return { verified: true };
    }),
});
