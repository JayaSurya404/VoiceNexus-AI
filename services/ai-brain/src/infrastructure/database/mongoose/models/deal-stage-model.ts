import mongoose, { Schema, type InferSchemaType } from "mongoose";

const dealStageSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true },
    order: { type: Number, required: true, default: 0, index: true },
    probability: { type: Number, required: true, min: 0, max: 1, default: 0 },
    active: { type: Boolean, required: true, default: true, index: true },
  },
  { collection: "dealstages", timestamps: true },
);

dealStageSchema.index({ organizationId: 1, active: 1, order: 1 });
dealStageSchema.index({ organizationId: 1, name: 1 }, { unique: true });

export type DealStageDocument = InferSchemaType<typeof dealStageSchema> & { _id: mongoose.Types.ObjectId };
export const DealStageModel =
  (mongoose.models.DealStage ?? mongoose.model("DealStage", dealStageSchema)) as mongoose.Model<any>;
