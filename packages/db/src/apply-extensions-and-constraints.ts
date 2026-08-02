import { readFileSync } from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Add your Neon DATABASE_URL to the environment");
}

const sql = neon(databaseUrl);

async function run() {
  const filePath = path.join(__dirname, "extensions-and-constraints.sql");
  const withoutComments = readFileSync(filePath, "utf-8")
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");
  const statements = withoutComments
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    console.log(`Running: ${statement.slice(0, 80).replace(/\s+/g, " ")}...`);
    await sql.query(statement);
  }
  console.log(`Applied ${statements.length} statements.`);
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed to apply extensions/constraints:", err);
    process.exit(1);
  });
