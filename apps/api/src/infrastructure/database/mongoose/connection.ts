import mongoose from "mongoose";

import { env } from "../../../config/env.js";

let connectionPromise: Promise<typeof mongoose> | null = null;

export function connectToDatabase(): Promise<typeof mongoose> {
  if (!connectionPromise) {
    mongoose.set("strictQuery", true);

    connectionPromise = mongoose.connect(env.MONGODB_URI, {
      dbName: env.MONGODB_DB_NAME,
      autoIndex: env.NODE_ENV !== "production",
      serverSelectionTimeoutMS: 10_000,
    });
  }

  return connectionPromise;
}

export async function disconnectFromDatabase(): Promise<void> {
  if (connectionPromise) {
    await mongoose.disconnect();
    connectionPromise = null;
  }
}
