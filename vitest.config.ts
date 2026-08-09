import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    testTimeout: 30_000,
    // postgres.js serialises parameters with `instanceof Date`. Vitest's default
    // VM pool gives each test file its own realm, so a Date created in a test is
    // not `instanceof` the driver's Date and falls through to the string path.
    // Forks run in real processes with shared globals. Not a code defect.
    pool: "forks",
    // Tests run against a SEPARATE database. Sharing one with the app meant the
    // suite's TRUNCATE silently wiped seeded data — a foot-gun, not a defect,
    // but the kind that makes people distrust the tests.
    env: { DATABASE_URL: "postgres://app:app@localhost:5432/mos_test" },
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
});
