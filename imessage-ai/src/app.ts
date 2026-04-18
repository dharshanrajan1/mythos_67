import Fastify from "fastify";
import cors from "@fastify/cors";
import formbody from "@fastify/formbody";
import sensible from "@fastify/sensible";

import { registerDashboardRoutes } from "./routes/dashboard.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerSimulationRoutes } from "./routes/simulate.js";
import { registerTelnyxRoutes } from "./routes/telnyx.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.register(sensible);
  app.register(formbody);
  app.register(cors, { origin: true });

  app.register(registerHealthRoutes);
  app.register(registerSimulationRoutes);
  app.register(registerDashboardRoutes);
  app.register(registerTelnyxRoutes, { prefix: "/webhooks/telnyx" });

  return app;
}
