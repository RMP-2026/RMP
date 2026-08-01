import { createClerkClient, verifyToken } from "@clerk/backend";

const secretKey = process.env.CLERK_SECRET_KEY;

if (!secretKey) {
  throw new Error("Add your Clerk Secret Key to the .env file");
}

const authorizedParties = (process.env.CLERK_AUTHORIZED_PARTIES ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const clerkClient = createClerkClient({ secretKey });

// Simple in-memory cooldown to blunt repeated self-service role-escalation calls.
// Resets on redeploy/cold start; a durable per-user application record with admin
// approval would be the real fix but that requires new schema/UI out of scope here.
const APPLY_COOLDOWN_MS = 60_000;
const lastApplyAttempt = new Map<string, number>();

export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const bearerToken = authHeader?.match(/^Bearer\s+(.+)$/)?.[1];
  if (!bearerToken) {
    return Response.json({ error: "Missing authorization token" }, { status: 401 });
  }

  let userId: string;
  try {
    const payload = await verifyToken(bearerToken, {
      secretKey,
      authorizedParties: authorizedParties.length ? authorizedParties : undefined,
    });
    userId = payload.sub;
  } catch (err) {
    console.error("Host apply: token verification failed:", err instanceof Error ? err.message : String(err));
    return Response.json({ error: "Invalid or expired session" }, { status: 401 });
  }

  const lastAttempt = lastApplyAttempt.get(userId);
  if (lastAttempt && Date.now() - lastAttempt < APPLY_COOLDOWN_MS) {
    return Response.json({ error: "Please wait a moment before trying again." }, { status: 429 });
  }
  lastApplyAttempt.set(userId, Date.now());

  let existing;
  try {
    existing = await clerkClient.users.getUser(userId);
  } catch (err) {
    console.error("Host apply: failed to fetch user:", err instanceof Error ? err.message : String(err));
    return Response.json({ error: "Couldn't verify your account. Please try again." }, { status: 502 });
  }

  if (existing.publicMetadata.role === "admin") {
    // Admins keep their role; hosting is granted, not swapped.
    return Response.json({ role: "admin" });
  }

  try {
    const updated = await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { role: "host" },
    });
    return Response.json({ role: updated.publicMetadata.role });
  } catch (err) {
    console.error("Host apply: failed to update role:", err instanceof Error ? err.message : String(err));
    return Response.json({ error: "Couldn't update your account. Please try again." }, { status: 502 });
  }
}
