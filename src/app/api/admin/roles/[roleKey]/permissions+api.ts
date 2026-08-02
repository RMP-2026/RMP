import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { rolePermissions } from "@/db/schema";
import { logAudit } from "@/lib/permissions/audit";
import { PERMISSIONS, ROLE_KEYS, type RoleKey } from "@/lib/permissions/catalog";
import { withPermission } from "@/lib/permissions/middleware";
import { invalidateRoleCache } from "@/lib/permissions/resolve";

const PERMISSION_KEY_SET: Set<string> = new Set(PERMISSIONS.map((p) => p.key));

/** Admin-only: grant or revoke a permission for a role. Never lets an admin revoke `admin`'s own `permissions:manage`/`roles:manage`, to avoid locking every admin out. */
export const PATCH = withPermission("permissions:manage", async (request, ctx, params) => {
  const roleKey = params.roleKey as RoleKey;
  if (!ROLE_KEYS.includes(roleKey)) {
    return Response.json({ error: "Unknown role" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const permissionKey = body?.permissionKey as string | undefined;
  const grant = body?.grant as boolean | undefined;

  if (!permissionKey || !PERMISSION_KEY_SET.has(permissionKey) || typeof grant !== "boolean") {
    return Response.json({ error: "Body must include a known permissionKey and a boolean grant" }, { status: 400 });
  }

  if (roleKey === "admin" && (permissionKey === "permissions:manage" || permissionKey === "roles:manage")) {
    return Response.json({ error: "Can't revoke the admin role's own permission-management access" }, { status: 400 });
  }

  if (grant) {
    await db.insert(rolePermissions).values({ roleKey, permissionKey }).onConflictDoNothing();
  } else {
    await db
      .delete(rolePermissions)
      .where(and(eq(rolePermissions.roleKey, roleKey), eq(rolePermissions.permissionKey, permissionKey)));
  }

  invalidateRoleCache(roleKey);

  await logAudit({
    actorUserId: ctx.userId,
    action: grant ? "role_permission.granted" : "role_permission.revoked",
    targetType: "role",
    targetId: roleKey,
    metadata: { permissionKey },
  });

  return Response.json({ roleKey, permissionKey, grant });
});
