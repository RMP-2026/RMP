import { db } from "@/db";
import { auditLog } from "@/db/schema";

export async function logAudit(entry: {
  actorUserId: string | null;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(auditLog).values(entry);
}
