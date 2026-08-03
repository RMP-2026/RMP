import ImageKit from "imagekit";

const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

/** Null until real ImageKit credentials are set — see PLAN.md Phase 2 open items. */
export const imagekit =
  publicKey && privateKey && urlEndpoint ? new ImageKit({ publicKey, privateKey, urlEndpoint }) : null;

if (!imagekit) {
  console.warn("[@rmp/api] IMAGEKIT_* env vars not set — document/photo upload endpoints will throw until configured.");
}
