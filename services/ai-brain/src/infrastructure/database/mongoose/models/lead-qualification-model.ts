import mongoose, { Schema, type InferSchemaType } from "mongoose";

const leadQualificationSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, required: true, index: true },
    conversationId: { type: Schema.Types.ObjectId, default: null, index: true },
    agentSessionId: { type: Schema.Types.ObjectId, default: null, index: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    hotScore: { type: Number, required: true, min: 0, max: 100 },
    warmScore: { type: Number, required: true, min: 0, max: 100 },
    coldScore: { type: Number, required: true, min: 0, max: 100 },
    budgetDetected: { type: Boolean, required: true },
    authorityDetected: { type: Boolean, required: true },
    needDetected: { type: Boolean, required: true },
    timelineDetected: { type: Boolean, required: true },
    urgencyDetected: { type: Boolean, required: true },
    decisionMakerDetected: { type: Boolean, required: true },
    objections: { type: [String], default: [] },
    interestLevel: { type: String, enum: ["HOT", "WARM", "COLD", "UNKNOWN"], required: true },
    qualificationReason: { type: String, required: true },
    updatedAt: { type: Date, required: true, index: true },
  },
  { collection: "leadqualifications" },
);

leadQualificationSchema.index({ organizationId: 1, leadId: 1 }, { unique: true });
leadQualificationSchema.index({ organizationId: 1, score: -1 });

export type LeadQualificationDocument = InferSchemaType<typeof leadQualificationSchema> & {
  _id: mongoose.Types.ObjectId;
};
export const LeadQualificationModel =
  (mongoose.models.LeadQualification ?? mongoose.model("LeadQualification", leadQualificationSchema)) as mongoose.Model<any>;
