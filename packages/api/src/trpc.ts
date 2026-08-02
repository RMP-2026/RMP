import { companyStaff, db, users } from "@rmp/db";
import { TRPCError, initTRPC } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import type { Context } from "./context";
import { ratelimit } from "./ratelimit";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const middleware = t.middleware;

/** No auth required. */
export const publicProcedure = t.procedure;

/**
 * Any signed-in user. Rate-limited first — this is the base every other tier builds
 * on, so it's the first middleware any authenticated call passes through.
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  if (ratelimit) {
    const { success } = await ratelimit.limit(ctx.userId);
    if (!success) {
      throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
    }
  }

  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

/** Signed-in AND staff (owner or staff) on the target company — checked via company_staff membership, never a role string. */
export const companyProcedure = protectedProcedure.input(z.object({ companyId: z.string().uuid() })).use(async ({ ctx, input, next }) => {
  const membership = await db.query.companyStaff.findFirst({
    where: and(eq(companyStaff.companyId, input.companyId), eq(companyStaff.userId, ctx.userId)),
  });
  if (!membership) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx: { ...ctx, companyId: input.companyId, companyRole: membership.role } });
});

/** Signed-in AND users.role === "admin". */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const user = await db.query.users.findFirst({ where: eq(users.id, ctx.userId) });
  if (user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});
