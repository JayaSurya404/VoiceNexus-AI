import mongoose from "mongoose";

import { env } from "../../../config/env.js";

export async function connectToDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGODB_URI);
  console.log("[automation-worker] MongoDB connected");
}

export async function disconnectFromDatabase(): Promise<void> {
  await mongoose.disconnect();
}
