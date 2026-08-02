import { db } from "@/db";
import { rolePermissions } from "@/db/schema";
import { PERMISSIONS, ROLE_KEYS, ROLE_METADATA } from "@/lib/permissions/catalog";
import { withPermission } from "@/lib/permissions/middleware";

/** Admin-only: every role with its currently-granted permissions, plus the full permission catalog — backs the Roles & Permissions admin screen. */
export const GET = withPermission("permissions:manage", async () => {
  const grants = await db.select().from(rolePermissions);

  const roles = ROLE_KEYS.map((key) => ({
    key,
    ...ROLE_METADATA[key],
    permissionKeys: grants.filter((g) => g.roleKey === key).map((g) => g.permissionKey),
  }));

  return Response.json({ roles, permissions: PERMISSIONS });
});
