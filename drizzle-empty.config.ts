// drizzle-empty.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/empty-schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
});