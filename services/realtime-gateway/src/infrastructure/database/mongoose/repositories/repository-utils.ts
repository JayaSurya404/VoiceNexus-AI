import mongoose from "mongoose";

export function objectId(value: string | null | undefined): mongoose.Types.ObjectId | null {
  return value ? new mongoose.Types.ObjectId(value) : null;
}

export function objectIdOrThrow(value: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(value);
}
