import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Add your Neon DATABASE_URL to the environment");
}

export const db = drizzle(neon(databaseUrl), { schema });
