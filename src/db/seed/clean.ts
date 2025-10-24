/**
 * Clean Database Script
 *
 * Deletes ALL data from the database.
 *
 * Usage:
 *   pnpm db:clean
 *
 * WARNING: This is destructive and cannot be undone!
 */

async function main() {
  // Load .env.local FIRST
  const { loadEnv } = await import("../../lib/load-env.js");
  loadEnv();

  // Import cleanDatabase
  const { cleanDatabase } = await import("./factories.js");

  console.log("🗑️  Cleaning database...\n");
  console.log("⚠️  WARNING: This will delete ALL data!\n");

  await cleanDatabase();

  console.log("✅ Database cleaned successfully\n");
}

main()
  .then(() => {
    console.log("✅ Clean script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Clean script failed:", error);
    process.exit(1);
  });
