import { db, users } from "@rmp/db";
import { eq } from "drizzle-orm";

import { protectedProcedure, router } from "../trpc";

export const meRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.query.users.findFirst({ where: eq(users.id, ctx.userId) });
    return user ?? null;
  }),
});
