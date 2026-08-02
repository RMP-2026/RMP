export {};

declare global {
  interface UserPublicMetadata {
    role?: "customer" | "host" | "admin" | "support" | "moderator";
  }
}
