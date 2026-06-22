import { env } from "./config/env.js";
import { createContainer } from "./container.js";
import { connectToDatabase, disconnectFromDatabase } from "./infrastructure/database/mongoose/connection.js";
import { connectRedis, disconnectRedis } from "./infrastructure/redis/redis-client.js";
import { createRealtimeHttpServer } from "./http/realtime-http-server.js";

await connectToDatabase();
await connectRedis();

const container = createContainer();
await container.services.eventBus.connect();
await container.services.voiceResponseEventSubscriber.start();
await container.services.realtimeRuntimeEventSubscriber.start();
const server = await createRealtimeHttpServer(container);

server.listen(env.REALTIME_GATEWAY_PORT, () => {
  console.log(`Realtime gateway listening on port ${env.REALTIME_GATEWAY_PORT}`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`Received ${signal}; shutting down realtime gateway`);
  server.close();
  await disconnectRedis();
  await disconnectFromDatabase();
  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
