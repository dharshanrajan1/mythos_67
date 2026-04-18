import "dotenv/config";

import { buildApp } from "./app.js";
import { env } from "./lib/env.js";

const port = env.PORT;
const host = "0.0.0.0";

const app = buildApp();

async function start() {
  try {
    await app.listen({ port, host });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

start();
