import mongoose, { type HydratedDocument, type Model, type Types } from "mongoose";

import type { TurnEventType } from "../../../../domain/entities/turn-event.js";

export interface TurnEventDocument {
  organizationId: Types.ObjectId;
  realtimeConversationId: Types.ObjectId;
  callSessionId: Types.ObjectId;
  type: TurnEventType;
  speaker: "CUSTOMER" | "AI";
  transcript: string | null;
  latencyMs: number | null;
  metadata: Record<string, unknown>;
  occurredAt: Date;
  createdAt: Date;
}

const turnEventSchema = new mongoose.Schema<TurnEventDocument>(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    realtimeConversationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    callSessionId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    type: {
      type: String,
      enum: ["CUSTOMER_TURN_STARTED", "CUSTOMER_TURN_ENDED", "AI_TURN_STARTED", "AI_TURN_ENDED"],
      required: true,
      index: true,
    },
    speaker: { type: String, enum: ["CUSTOMER", "AI"], required: true },
    transcript: { type: String, default: null },
    latencyMs: { type: Number, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    occurredAt: { type: Date, required: true, index: true },
  },
  { collection: "turnevents", timestamps: { createdAt: true, updatedAt: false } },
);

turnEventSchema.index({ organizationId: 1, realtimeConversationId: 1, occurredAt: 1 });

export type TurnEventMongoDocument = HydratedDocument<TurnEventDocument>;
export const TurnEventModel =
  (mongoose.models.TurnEvent as Model<TurnEventDocument> | undefined) ??
  mongoose.model<TurnEventDocument>("TurnEvent", turnEventSchema);
