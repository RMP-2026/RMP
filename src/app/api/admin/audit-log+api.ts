import { desc } from "drizzle-orm";

import { db } from "@/db";
import { auditLog } from "@/db/schema";
import { withPermission } from "@/lib/permissions/middleware";

const PAGE_SIZE = 100;

/** Admin-only: the most recent audit_log entries (role/permission edits + subscription lifecycle events). */
export const GET = withPermission("system_settings:manage", async () => {
  const entries = await db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(PAGE_SIZE);
  return Response.json({ entries });
});
