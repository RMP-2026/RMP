import { TRPCError } from "@trpc/server";

import { imagekit } from "../imagekit";
import { protectedProcedure, router } from "../trpc";

export const uploadRouter = router({
  /**
   * Client (mobile/web) uploads the file directly to ImageKit using these params —
   * the file itself never passes through our server. See PLAN.md Phase 2: "ImageKit
   * doc upload for business license / EIN / insurance" and the rental-agreement PDF.
   */
  getAuthParams: protectedProcedure.query(() => {
    if (!imagekit) {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Uploads aren't configured yet." });
    }
    return imagekit.getAuthenticationParameters();
  }),
});
