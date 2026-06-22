import mongoose, { Schema, type InferSchemaType } from "mongoose";

const executiveDashboardSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    revenueOverview: { type: Schema.Types.Mixed, default: {} },
    salesOverview: { type: Schema.Types.Mixed, default: {} },
    coachingOverview: { type: Schema.Types.Mixed, default: {} },
    knowledgeOverview: { type: Schema.Types.Mixed, default: {} },
    agentOverview: { type: Schema.Types.Mixed, default: {} },
    aiPerformanceOverview: { type: Schema.Types.Mixed, default: {} },
    computedAt: { type: Date, required: true, default: Date.now, index: true },
  },
  { collection: "executivedashboards", timestamps: true },
);

executiveDashboardSchema.index({ organizationId: 1, computedAt: -1 });

export type ExecutiveDashboardDocument = InferSchemaType<typeof executiveDashboardSchema> & { _id: mongoose.Types.ObjectId };
export const ExecutiveDashboardModel =
  (mongoose.models.ExecutiveDashboard ?? mongoose.model("ExecutiveDashboard", executiveDashboardSchema)) as mongoose.Model<any>;
