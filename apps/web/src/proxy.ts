import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)", // signature-verified separately, not Clerk-session-gated
  "/api/trpc(.*)", // "public" tRPC procedures stay reachable; "protected"/"company"/"admin" procedures self-gate in packages/api's context
]);

const isAdminRoute = createRouteMatcher(["/(dashboard)/admin(.*)"]);

// Company-tier access (is this user staff on the target company?) is a DB lookup —
// checked in packages/api's "company" procedure builder, not here. Middleware only
// handles the checks that are cheap from session claims alone: signed-in, and the
// platform-level "admin" role (synced into publicMetadata.role -> session claims).
export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  await auth.protect();

  if (isAdminRoute(req)) {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
    if (role !== "admin") {
      return NextResponse.rewrite(new URL("/404", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
