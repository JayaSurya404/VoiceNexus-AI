import mongoose, { Schema, type InferSchemaType } from "mongoose";

const routingRuleSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true, trim: true },
    priority: { type: Number, required: true, min: 0, default: 0, index: true },
    requiredSkills: { type: [String], default: [] },
    conditions: { type: Schema.Types.Mixed, default: {} },
    targetQueueId: { type: Schema.Types.ObjectId, default: null, index: true },
    escalationQueueId: { type: Schema.Types.ObjectId, default: null, index: true },
    action: {
      type: String,
      enum: ["ASSIGN_QUEUE", "ESCALATE_QUEUE", "ESCALATE_SUPERVISOR"],
      required: true,
      default: "ASSIGN_QUEUE",
    },
    active: { type: Boolean, required: true, default: true, index: true },
  },
  { collection: "routingrules", timestamps: true },
);

routingRuleSchema.index({ organizationId: 1, active: 1, priority: -1 });
routingRuleSchema.index({ organizationId: 1, name: 1 }, { unique: true });

export type RoutingRuleDocument = InferSchemaType<typeof routingRuleSchema> & { _id: mongoose.Types.ObjectId };
export const RoutingRuleModel =
  (mongoose.models.RoutingRule ?? mongoose.model("RoutingRule", routingRuleSchema)) as mongoose.Model<any>;
