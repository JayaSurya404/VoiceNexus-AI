import mongoose, { Schema, type InferSchemaType } from "mongoose";

const routingDecisionSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    queueSessionId: { type: Schema.Types.ObjectId, default: null, index: true },
    queueId: { type: Schema.Types.ObjectId, default: null, index: true },
    agentId: { type: Schema.Types.ObjectId, default: null, index: true },
    escalationQueueId: { type: Schema.Types.ObjectId, default: null, index: true },
    status: { type: String, enum: ["COMPLETED", "FAILED"], required: true, index: true },
    reason: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    inputs: { type: Schema.Types.Mixed, default: {} },
    decisionPath: { type: [String], default: [] },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { collection: "routingdecisions" },
);

routingDecisionSchema.index({ organizationId: 1, createdAt: -1 });
routingDecisionSchema.index({ organizationId: 1, status: 1, createdAt: -1 });

export type RoutingDecisionDocument = InferSchemaType<typeof routingDecisionSchema> & { _id: mongoose.Types.ObjectId };
export const RoutingDecisionModel =
  (mongoose.models.RoutingDecision ?? mongoose.model("RoutingDecision", routingDecisionSchema)) as mongoose.Model<any>;
