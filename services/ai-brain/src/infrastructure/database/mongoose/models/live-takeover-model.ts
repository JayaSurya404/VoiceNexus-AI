import mongoose, { Schema, type InferSchemaType } from "mongoose";

const liveTakeoverSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    sessionId: { type: Schema.Types.ObjectId, required: true, index: true },
    agentId: { type: Schema.Types.ObjectId, required: true, index: true },
    supervisorId: { type: Schema.Types.ObjectId, default: null, index: true },
    status: { type: String, enum: ["REQUESTED", "APPROVED", "ACTIVE", "ENDED", "REJECTED"], required: true, index: true },
    reason: { type: String, required: true },
    requestedAt: { type: Date, required: true },
    approvedAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    returnedToAiAt: { type: Date, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { collection: "livetakeovers", timestamps: true },
);

liveTakeoverSchema.index({ organizationId: 1, status: 1, updatedAt: -1 });
liveTakeoverSchema.index({ organizationId: 1, sessionId: 1, status: 1 });

export type LiveTakeoverDocument = InferSchemaType<typeof liveTakeoverSchema> & { _id: mongoose.Types.ObjectId };
export const LiveTakeoverModel =
  (mongoose.models.LiveTakeover ?? mongoose.model("LiveTakeover", liveTakeoverSchema)) as mongoose.Model<any>;
