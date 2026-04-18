import Fastify from "fastify";
import formbody from "@fastify/formbody";
import sensible from "@fastify/sensible";
import { registerHealthRoutes } from "./routes/health.js";
import { registerSimulationRoutes } from "./routes/simulate.js";
import { registerTwilioRoutes } from "./routes/twilio.js";
export function buildApp() {
    const app = Fastify({
        logger: true,
    });
    app.register(sensible);
    app.register(formbody);
    app.register(registerHealthRoutes);
    app.register(registerSimulationRoutes);
    app.register(registerTwilioRoutes, { prefix: "/webhooks/twilio" });
    return app;
}
