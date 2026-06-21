import mongoose from "mongoose";

export function objectId(value: string | null | undefined): mongoose.Types.ObjectId | null {
  return value ? new mongoose.Types.ObjectId(value) : null;
}

export function objectIdOrThrow(value: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(value);
}

export function serialize(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (JSON.parse(JSON.stringify(value)) as Record<string, unknown>) : {};
}
