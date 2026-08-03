import type { createTrpcClient } from "./trpc";

/**
 * Uploads directly to ImageKit from the device using server-signed auth params
 * (packages/api's upload.getAuthParams) — the file itself never passes through our
 * API. See PLAN.md Phase 2.
 */
export async function uploadToImageKit(
  trpc: ReturnType<typeof createTrpcClient>,
  file: { uri: string; name: string; mimeType: string },
) {
  const auth = await trpc.upload.getAuthParams.query();

  const publicKey = process.env.EXPO_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  if (!publicKey) {
    throw new Error("Uploads aren't configured yet (missing EXPO_PUBLIC_IMAGEKIT_PUBLIC_KEY).");
  }

  const formData = new FormData();
  formData.append("file", { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob);
  formData.append("fileName", file.name);
  formData.append("publicKey", publicKey);
  formData.append("signature", auth.signature);
  formData.append("expire", String(auth.expire));
  formData.append("token", auth.token);

  const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`ImageKit upload failed (${response.status})`);
  }
  const result = (await response.json()) as { fileId: string; url: string };
  return { imagekitFileId: result.fileId, url: result.url };
}
