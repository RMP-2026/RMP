import { createClerkClient, verifyToken } from "@clerk/backend";

const secretKey = process.env.CLERK_SECRET_KEY;

if (!secretKey) {
  throw new Error("Add your Clerk Secret Key to the .env file");
}

const clerkClient = createClerkClient({ secretKey });

export async function POST(request: Request) {
  const bearerToken = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!bearerToken) {
    return Response.json({ error: "Missing authorization token" }, { status: 401 });
  }

  let userId: string;
  try {
    const payload = await verifyToken(bearerToken, { secretKey });
    userId = payload.sub;
  } catch (err) {
    console.error("Host apply: token verification failed:", err instanceof Error ? err.message : String(err));
    return Response.json({ error: "Invalid or expired session" }, { status: 401 });
  }

  const existing = await clerkClient.users.getUser(userId);
  if (existing.publicMetadata.role === "admin") {
    // Admins keep their role; hosting is granted, not swapped.
    return Response.json({ role: "admin" });
  }

  const updated = await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: { role: "host" },
  });

  return Response.json({ role: updated.publicMetadata.role });
}
