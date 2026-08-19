import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { loadEnv } from "./config/env.js";
import { createLogger } from "./config/logger.js";
import { bootstrapStore } from "./store/bootstrap.js";
import { createApp } from "./app.js";

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, "../.env") });

async function main() {
  const env = loadEnv();
  const logger = createLogger(env);

  await bootstrapStore();
  logger.info("Demo data loaded from JSON store (server/data/sola.json)");

  const app = createApp(env, logger);
  app.listen(env.PORT, "127.0.0.1", () => {
    logger.info({ port: env.PORT }, "SOLA API listening");
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
