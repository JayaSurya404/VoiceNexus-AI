import { connectToDatabase, disconnectFromDatabase } from "./infrastructure/database/mongoose/connection.js";
import { createContainer } from "./container.js";

async function main(): Promise<void> {
  await connectToDatabase();
  const container = createContainer();
  container.services.runtime.start();

  const shutdown = async () => {
    console.log("[automation-worker] Shutting down");
    container.services.runtime.stop();
    await disconnectFromDatabase();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown());
  process.on("SIGTERM", () => void shutdown());
}

main().catch((error) => {
  console.error("[automation-worker] Fatal startup error", error);
  process.exit(1);
});
