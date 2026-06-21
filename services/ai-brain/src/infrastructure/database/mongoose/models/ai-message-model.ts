import mongoose, { Schema, type InferSchemaType } from "mongoose";

const aiMessageSchema = new Schema(
  {
    conversationId: { type: Schema.Types.ObjectId, required: true, index: true },
    role: { type: String, enum: ["system", "user", "assistant", "tool"], required: true },
    content: { type: String, required: true },
    tokens: { type: Number, required: true, min: 0 },
    timestamp: { type: Date, required: true, index: true },
  },
  { collection: "aimessages" },
);

aiMessageSchema.index({ conversationId: 1, timestamp: 1 });

export type AIMessageDocument = InferSchemaType<typeof aiMessageSchema> & { _id: mongoose.Types.ObjectId };
export const AIMessageModel = (mongoose.models.AIMessage ?? mongoose.model("AIMessage", aiMessageSchema)) as mongoose.Model<any>;
