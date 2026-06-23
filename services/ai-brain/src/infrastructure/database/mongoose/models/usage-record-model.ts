import mongoose from "mongoose";

const usageRecordSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    metric: {
      type: String,
      enum: ["calls", "messages", "ai_requests", "tokens", "storage_gb", "workflow_executions", "minutes"],
      required: true,
      index: true,
    },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    source: { type: String, default: "system", index: true },
    occurredAt: { type: Date, required: true, index: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

usageRecordSchema.index({ organizationId: 1, metric: 1, occurredAt: -1 });

export const UsageRecordModel: mongoose.Model<any> =
  (mongoose.models.UsageRecord as mongoose.Model<any> | undefined) ??
  mongoose.model<any>("UsageRecord", usageRecordSchema, "usagerecords");
