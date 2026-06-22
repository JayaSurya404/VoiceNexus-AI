import mongoose, { Schema, type InferSchemaType } from "mongoose";

const crossSellOpportunitySchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, default: null, index: true },
    opportunityId: { type: Schema.Types.ObjectId, default: null, index: true },
    product: { type: String, required: true, index: true },
    affinityScore: { type: Number, required: true, min: 0, max: 100, default: 0, index: true },
    estimatedValue: { type: Number, required: true, min: 0, default: 0 },
    complementaryServices: { type: [String], default: [] },
    reasons: { type: [String], default: [] },
    status: { type: String, enum: ["OPEN", "ACCEPTED", "DISMISSED"], required: true, default: "OPEN", index: true },
  },
  { collection: "crosssellopportunities", timestamps: true },
);

crossSellOpportunitySchema.index({ organizationId: 1, status: 1, affinityScore: -1 });

export type CrossSellOpportunityDocument = InferSchemaType<typeof crossSellOpportunitySchema> & { _id: mongoose.Types.ObjectId };
export const CrossSellOpportunityModel =
  (mongoose.models.CrossSellOpportunity ?? mongoose.model("CrossSellOpportunity", crossSellOpportunitySchema)) as mongoose.Model<any>;
