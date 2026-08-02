import { db } from "@/db";
import { permissions, rolePermissions, roles } from "@/db/schema";
import { PERMISSIONS, ROLE_KEYS, ROLE_METADATA, ROLE_PERMISSIONS } from "@/lib/permissions/catalog";

/** Idempotent upsert of the permission catalog into Postgres. Safe to re-run after editing catalog.ts. */
async function seed() {
  for (const permission of PERMISSIONS) {
    await db
      .insert(permissions)
      .values(permission)
      .onConflictDoUpdate({
        target: permissions.key,
        set: { resource: permission.resource, action: permission.action, description: permission.description },
      });
  }
  console.log(`Seeded ${PERMISSIONS.length} permissions.`);

  for (const roleKey of ROLE_KEYS) {
    const meta = ROLE_METADATA[roleKey];
    await db
      .insert(roles)
      .values({ key: roleKey, name: meta.name, description: meta.description, isSystem: true })
      .onConflictDoUpdate({
        target: roles.key,
        set: { name: meta.name, description: meta.description, updatedAt: new Date() },
      });
  }
  console.log(`Seeded ${ROLE_KEYS.length} roles.`);

  let rolePermissionCount = 0;
  for (const roleKey of ROLE_KEYS) {
    for (const permissionKey of ROLE_PERMISSIONS[roleKey]) {
      await db
        .insert(rolePermissions)
        .values({ roleKey, permissionKey })
        .onConflictDoNothing();
      rolePermissionCount++;
    }
  }
  console.log(`Seeded ${rolePermissionCount} role-permission grants.`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Permission seed failed:", err);
    process.exit(1);
  });
