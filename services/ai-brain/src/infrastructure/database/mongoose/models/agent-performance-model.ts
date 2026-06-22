import mongoose, { Schema, type InferSchemaType } from "mongoose";

const agentPerformanceSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    agentId: { type: Schema.Types.ObjectId, required: true, index: true },
    callsHandled: { type: Number, required: true, min: 0, default: 0 },
    averageDuration: { type: Number, required: true, min: 0, default: 0 },
    averageQaScore: { type: Number, required: true, min: 0, max: 100, default: 0 },
    averageSentiment: { type: Number, required: true, min: -1, max: 1, default: 0 },
    transfers: { type: Number, required: true, min: 0, default: 0 },
    conversions: { type: Number, required: true, min: 0, default: 0 },
    leadQuality: { type: Number, required: true, min: 0, default: 0 },
    computedAt: { type: Date, required: true, index: true },
  },
  { collection: "agentperformances", timestamps: true },
);

agentPerformanceSchema.index({ organizationId: 1, agentId: 1 }, { unique: true });
agentPerformanceSchema.index({ organizationId: 1, computedAt: -1 });

export type AgentPerformanceDocument = InferSchemaType<typeof agentPerformanceSchema> & { _id: mongoose.Types.ObjectId };
export const AgentPerformanceModel =
  (mongoose.models.AgentPerformance ??
    mongoose.model("AgentPerformance", agentPerformanceSchema)) as mongoose.Model<any>;
