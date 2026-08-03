import { appRouter, createContext } from "@rmp/api";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

export const runtime = "nodejs";

function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext({ req }),
  });
}

export { handler as GET, handler as POST };
