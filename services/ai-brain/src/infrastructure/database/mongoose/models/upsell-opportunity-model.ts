import mongoose, { Schema, type InferSchemaType } from "mongoose";

const upsellOpportunitySchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, default: null, index: true },
    opportunityId: { type: Schema.Types.ObjectId, default: null, index: true },
    product: { type: String, required: true, index: true },
    estimatedValue: { type: Number, required: true, min: 0, default: 0 },
    fitScore: { type: Number, required: true, min: 0, max: 100, default: 0, index: true },
    reasons: { type: [String], default: [] },
    recommendedActions: { type: [String], default: [] },
    status: { type: String, enum: ["OPEN", "ACCEPTED", "DISMISSED"], required: true, default: "OPEN", index: true },
  },
  { collection: "upsellopportunities", timestamps: true },
);

upsellOpportunitySchema.index({ organizationId: 1, status: 1, fitScore: -1 });

export type UpsellOpportunityDocument = InferSchemaType<typeof upsellOpportunitySchema> & { _id: mongoose.Types.ObjectId };
export const UpsellOpportunityModel =
  (mongoose.models.UpsellOpportunity ?? mongoose.model("UpsellOpportunity", upsellOpportunitySchema)) as mongoose.Model<any>;
