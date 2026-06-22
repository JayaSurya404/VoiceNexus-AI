import mongoose, { Schema, type InferSchemaType } from "mongoose";

const supervisorSessionSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
    supervisorId: { type: Schema.Types.ObjectId, required: true, index: true },
    status: { type: String, enum: ["ACTIVE", "ENDED"], required: true, index: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, default: null },
    watchedSessionIds: { type: [Schema.Types.ObjectId], default: [] },
  },
  { collection: "supervisorsessions", timestamps: true },
);

supervisorSessionSchema.index({ organizationId: 1, status: 1, updatedAt: -1 });

export type SupervisorSessionDocument = InferSchemaType<typeof supervisorSessionSchema> & {
  _id: mongoose.Types.ObjectId;
};
export const SupervisorSessionModel =
  (mongoose.models.SupervisorSession ??
    mongoose.model("SupervisorSession", supervisorSessionSchema)) as mongoose.Model<any>;
