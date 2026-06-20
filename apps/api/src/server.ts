import { createServer } from "node:http";

import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectToDatabase, disconnectFromDatabase } from "./infrastructure/database/mongoose/connection.js";

async function main(): Promise<void> {
  await connectToDatabase();

  const app = createApp();
  const server = createServer(app);

  server.listen(env.PORT, () => {
    console.log(`VoiceNexus API listening on port ${env.PORT}`);
  });

  const shutdown = (signal: NodeJS.Signals): void => {
    console.log(`${signal} received. Shutting down VoiceNexus API.`);

    server.close(() => {
      disconnectFromDatabase()
        .then(() => process.exit(0))
        .catch((error: unknown) => {
          console.error(error);
          process.exit(1);
        });
    });

    setTimeout(() => {
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
