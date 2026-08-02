import { adminRouter } from "./routers/admin";
import { billingRouter } from "./routers/billing";
import { companyRouter } from "./routers/company";
import { meRouter } from "./routers/me";
import { phoneRouter } from "./routers/phone";
import { staffRouter } from "./routers/staff";
import { uploadRouter } from "./routers/upload";
import { router } from "./trpc";

export const appRouter = router({
  me: meRouter,
  phone: phoneRouter,
  upload: uploadRouter,
  company: companyRouter,
  staff: staffRouter,
  billing: billingRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
