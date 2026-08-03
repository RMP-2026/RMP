import { verifyToken } from "@clerk/backend";

export type Context = {
  userId: string | null;
};

/**
 * Both apps attach `Authorization: Bearer <clerk-session-token>` explicitly (via
 * `getToken()` from @clerk/expo / @clerk/nextjs) rather than relying on cookies, so
 * context creation is identical regardless of which app is calling.
 */
export async function createContext({ req }: { req: Request }): Promise<Context> {
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.match(/^Bearer\s+(.+)$/)?.[1];
  if (!bearerToken) return { userId: null };

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Add your Clerk Secret Key to the environment");
  }

  try {
    const payload = await verifyToken(bearerToken, { secretKey });
    return { userId: payload.sub };
  } catch {
    return { userId: null };
  }
}
