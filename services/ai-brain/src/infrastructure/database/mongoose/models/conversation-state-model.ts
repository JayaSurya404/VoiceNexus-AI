import mongoose, { Schema, type InferSchemaType } from "mongoose";

const stateValues = ["GREETING", "DISCOVERY", "QUALIFICATION", "OBJECTION", "PRICING", "FOLLOWUP", "TRANSFER", "COMPLETED"];

const conversationStateSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    agentSessionId: { type: Schema.Types.ObjectId, required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, default: null, index: true },
    callId: { type: Schema.Types.ObjectId, default: null, index: true },
    state: { type: String, enum: stateValues, required: true, index: true },
    previousState: { type: String, enum: [...stateValues, null], default: null },
    detectedIntent: { type: String, required: true },
    detectedLanguage: { type: String, default: null },
    sentiment: { type: String, enum: ["POSITIVE", "NEUTRAL", "NEGATIVE", "MIXED", "UNKNOWN"], required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    collectedFacts: { type: Map, of: String, default: {} },
    transitionReason: { type: String, required: true },
    updatedAt: { type: Date, required: true, index: true },
  },
  { collection: "conversationstates" },
);

conversationStateSchema.index({ organizationId: 1, agentSessionId: 1 }, { unique: true });
conversationStateSchema.index({ organizationId: 1, state: 1 });

export type ConversationStateDocument = InferSchemaType<typeof conversationStateSchema> & {
  _id: mongoose.Types.ObjectId;
};
export const ConversationStateModel =
  (mongoose.models.ConversationState ?? mongoose.model("ConversationState", conversationStateSchema)) as mongoose.Model<any>;
