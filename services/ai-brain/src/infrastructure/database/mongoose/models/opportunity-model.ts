import mongoose, { Schema, type InferSchemaType } from "mongoose";

const opportunitySchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, default: null, index: true },
    crmContactId: { type: String, default: null, index: true },
    crmDealId: { type: String, default: null, index: true },
    name: { type: String, required: true },
    value: { type: Number, required: true, min: 0, default: 0 },
    probability: { type: Number, required: true, min: 0, max: 1, default: 0 },
    expectedCloseDate: { type: Date, default: null, index: true },
    stageId: { type: Schema.Types.ObjectId, default: null, index: true },
    stageName: { type: String, required: true, default: "New", index: true },
    source: { type: String, required: true, default: "UNKNOWN", index: true },
    ownerId: { type: Schema.Types.ObjectId, default: null, index: true },
    aiScore: { type: Number, required: true, min: 0, max: 100, default: 0 },
    status: { type: String, enum: ["OPEN", "WON", "LOST"], required: true, default: "OPEN", index: true },
  },
  { collection: "opportunities", timestamps: true },
);

opportunitySchema.index({ organizationId: 1, status: 1, expectedCloseDate: 1 });
opportunitySchema.index({ organizationId: 1, ownerId: 1, status: 1 });
opportunitySchema.index({ organizationId: 1, source: 1, status: 1 });

export type OpportunityDocument = InferSchemaType<typeof opportunitySchema> & { _id: mongoose.Types.ObjectId };
export const OpportunityModel =
  (mongoose.models.Opportunity ?? mongoose.model("Opportunity", opportunitySchema)) as mongoose.Model<any>;
