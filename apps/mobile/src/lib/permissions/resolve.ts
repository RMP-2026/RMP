import { eq } from "drizzle-orm";

import { db } from "@/db";
import { rolePermissions } from "@/db/schema";
import type { PermissionKey, RoleKey } from "@/lib/permissions/catalog";

const TTL_MS = 60_000;
const cache = new Map<RoleKey, { permissions: PermissionKey[]; expiresAt: number }>();

/** Role -> effective permissions, resolved from the admin-editable `role_permissions` table and cached briefly (cardinality is 5, so a per-instance TTL cache is plenty). */
export async function getEffectivePermissions(role: RoleKey): Promise<PermissionKey[]> {
  const cached = cache.get(role);
  if (cached && cached.expiresAt > Date.now()) return cached.permissions;

  const rows = await db
    .select({ permissionKey: rolePermissions.permissionKey })
    .from(rolePermissions)
    .where(eq(rolePermissions.roleKey, role));

  const permissions = rows.map((row) => row.permissionKey as PermissionKey);
  cache.set(role, { permissions, expiresAt: Date.now() + TTL_MS });
  return permissions;
}

export function userHasPermission(permissions: readonly PermissionKey[], key: PermissionKey): boolean {
  return permissions.includes(key);
}

/** Drops a role's cached permission set so an admin edit is reflected on the next check instead of waiting out the TTL. */
export function invalidateRoleCache(role: RoleKey) {
  cache.delete(role);
}
