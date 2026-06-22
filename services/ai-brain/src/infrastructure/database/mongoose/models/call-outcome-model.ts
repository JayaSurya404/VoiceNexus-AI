import mongoose, { Schema, type InferSchemaType } from "mongoose";

const callOutcomeSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    conversationId: { type: Schema.Types.ObjectId, default: null, index: true },
    agentSessionId: { type: Schema.Types.ObjectId, default: null, index: true },
    leadId: { type: Schema.Types.ObjectId, default: null, index: true },
    callId: { type: Schema.Types.ObjectId, default: null, index: true },
    outcome: {
      type: String,
      enum: ["SALE", "BOOKED_MEETING", "FOLLOW_UP", "TRANSFERRED", "VOICEMAIL", "NO_INTEREST", "FAILED"],
      required: true,
      index: true,
    },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    reasoning: { type: String, required: true },
    occurredAt: { type: Date, required: true, index: true },
  },
  { collection: "calloutcomes", timestamps: true },
);

callOutcomeSchema.index({ organizationId: 1, conversationId: 1, outcome: 1 }, { unique: true, sparse: true });
callOutcomeSchema.index({ organizationId: 1, occurredAt: -1 });

export type CallOutcomeDocument = InferSchemaType<typeof callOutcomeSchema> & { _id: mongoose.Types.ObjectId };
export const CallOutcomeModel =
  (mongoose.models.CallOutcome ?? mongoose.model("CallOutcome", callOutcomeSchema)) as mongoose.Model<any>;
