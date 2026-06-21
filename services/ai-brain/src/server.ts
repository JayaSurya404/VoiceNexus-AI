import { createAiBrainHttpServer } from "./http/ai-brain-http-server.js";
import { createContainer } from "./container.js";
import { env } from "./config/env.js";
import { connectToDatabase, disconnectFromDatabase } from "./infrastructure/database/mongoose/connection.js";
import { closeRedis } from "./infrastructure/redis/redis-client.js";

async function main(): Promise<void> {
  await connectToDatabase();
  const container = createContainer();
  await container.services.transcriptFinalSubscriber.start();
  const server = createAiBrainHttpServer(container);

  server.listen(env.AI_BRAIN_PORT, () => {
    console.log(`[ai-brain] HTTP server listening on ${env.AI_BRAIN_PORT}`);
  });

  const shutdown = async () => {
    console.log("[ai-brain] Shutting down");
    server.close();
    await closeRedis();
    await disconnectFromDatabase();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown());
  process.on("SIGTERM", () => void shutdown());
}

main().catch((error) => {
  console.error("[ai-brain] Fatal startup error", error);
  process.exit(1);
});
