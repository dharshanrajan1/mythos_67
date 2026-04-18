export async function registerHealthRoutes(app) {
    app.get("/health", async () => {
        return {
            ok: true,
            service: "sam-nutrition-agent",
            timestamp: new Date().toISOString(),
        };
    });
}
