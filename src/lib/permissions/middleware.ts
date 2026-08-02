import { verifyToken } from "@clerk/backend";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import type { PermissionKey, RoleKey } from "@/lib/permissions/catalog";
import { getEffectivePermissions, userHasPermission } from "@/lib/permissions/resolve";

const secretKey = process.env.CLERK_SECRET_KEY;

if (!secretKey) {
  throw new Error("Add your Clerk Secret Key to the .env file");
}

const authorizedParties = (process.env.CLERK_AUTHORIZED_PARTIES ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export type PermissionContext = { userId: string; role: RoleKey; permissions: PermissionKey[] };

async function authenticate(request: Request): Promise<{ userId: string } | { error: Response }> {
  const authHeader = request.headers.get("Authorization");
  const bearerToken = authHeader?.match(/^Bearer\s+(.+)$/)?.[1];
  if (!bearerToken) {
    return { error: Response.json({ error: "Missing authorization token" }, { status: 401 }) };
  }

  try {
    const payload = await verifyToken(bearerToken, {
      secretKey,
      authorizedParties: authorizedParties.length ? authorizedParties : undefined,
    });
    return { userId: payload.sub };
  } catch (err) {
    console.error("Permission check: token verification failed:", err instanceof Error ? err.message : String(err));
    return { error: Response.json({ error: "Invalid or expired session" }, { status: 401 }) };
  }
}

/** Resolves the caller's role + effective permissions from Postgres. Returns a 401/403 Response in place of a context on failure. */
export async function resolvePermissionContext(request: Request): Promise<PermissionContext | { error: Response }> {
  const auth = await authenticate(request);
  if ("error" in auth) return auth;

  const [user] = await db.select({ role: users.role }).from(users).where(eq(users.id, auth.userId)).limit(1);
  if (!user) {
    return { error: Response.json({ error: "User not found" }, { status: 403 }) };
  }

  const permissions = await getEffectivePermissions(user.role);
  return { userId: auth.userId, role: user.role, permissions };
}

/** Wraps an Expo Router `+api.ts` handler so it only runs once the caller's role grants `permissionKey`. The `params` arg forwards dynamic route segments (e.g. `[roleKey]+api.ts`). */
export function withPermission(
  permissionKey: PermissionKey,
  handler: (request: Request, ctx: PermissionContext, params: Record<string, string>) => Promise<Response>,
) {
  return async (request: Request, params: Record<string, string> = {}): Promise<Response> => {
    const ctx = await resolvePermissionContext(request);
    if ("error" in ctx) return ctx.error;

    if (!userHasPermission(ctx.permissions, permissionKey)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    return handler(request, ctx, params);
  };
}
