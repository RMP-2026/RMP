"use server";

import { appRouter } from "@rmp/api";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

async function caller() {
  const { userId } = await auth();
  return appRouter.createCaller({ userId });
}

export async function approveCompanyAction(companyId: string) {
  await (await caller()).admin.approveCompany({ companyId });
  revalidatePath("/admin");
}

export async function rejectCompanyAction(companyId: string, reason: string) {
  await (await caller()).admin.rejectCompany({ companyId, reason });
  revalidatePath("/admin");
}

export async function reviewDocumentAction(documentId: string, decision: "approved" | "rejected") {
  await (await caller()).admin.reviewDocument({ documentId, decision });
  revalidatePath("/admin");
}
