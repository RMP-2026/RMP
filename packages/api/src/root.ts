import { meRouter } from "./routers/me";
import { phoneRouter } from "./routers/phone";
import { router } from "./trpc";

export const appRouter = router({
  me: meRouter,
  phone: phoneRouter,
});

export type AppRouter = typeof appRouter;
