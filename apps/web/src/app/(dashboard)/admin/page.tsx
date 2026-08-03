import { appRouter } from "@rmp/api";
import { auth } from "@clerk/nextjs/server";

import { approveCompanyAction, rejectCompanyAction, reviewDocumentAction } from "./actions";

const DOC_LABELS: Record<string, string> = {
  business_license: "Business license",
  ein: "EIN letter",
  insurance: "Insurance",
  rental_agreement: "Rental agreement",
};

export default async function AdminDashboardPage() {
  const { userId } = await auth();
  const caller = appRouter.createCaller({ userId });
  const pending = await caller.admin.companiesPending();

  return (
    <div>
      <h1 className="text-2xl font-bold">Pending applications</h1>
      <p className="mt-1 text-sm opacity-70">{pending.length} awaiting review</p>

      <div className="mt-6 flex flex-col gap-6">
        {pending.map(({ company, documents }) => {
          const allApproved = documents.every((d) => d.status === "approved");
          return (
            <div key={company.id} className="rounded-xl border border-black/10 p-5 dark:border-white/10">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{company.name}</h2>
                  <p className="text-sm opacity-70">
                    {company.city}, {company.state} · {company.cancellationWindowHours}h cancellation window
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between rounded-lg border border-black/10 px-3 py-2 dark:border-white/10">
                    <a href={doc.url} target="_blank" rel="noreferrer" className="text-sm underline">
                      {DOC_LABELS[doc.type] ?? doc.type}
                    </a>
                    <div className="flex items-center gap-2">
                      <span className="text-xs opacity-70">{doc.status}</span>
                      {doc.status === "pending" ? (
                        <>
                          <form action={reviewDocumentAction.bind(null, doc.id, "approved")}>
                            <button className="rounded-md bg-green-600 px-2 py-1 text-xs text-white" type="submit">
                              Approve
                            </button>
                          </form>
                          <form action={reviewDocumentAction.bind(null, doc.id, "rejected")}>
                            <button className="rounded-md bg-red-600 px-2 py-1 text-xs text-white" type="submit">
                              Reject
                            </button>
                          </form>
                        </>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <form action={approveCompanyAction.bind(null, company.id)}>
                  <button
                    className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
                    type="submit"
                    disabled={!allApproved}
                  >
                    Approve company
                  </button>
                </form>
                <form action={rejectCompanyAction.bind(null, company.id, "Documents did not meet requirements")}>
                  <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white" type="submit">
                    Reject company
                  </button>
                </form>
                {!allApproved ? <span className="text-xs opacity-70">Review every document before approving.</span> : null}
              </div>
            </div>
          );
        })}
        {pending.length === 0 ? <p className="opacity-70">No pending applications.</p> : null}
      </div>
    </div>
  );
}
