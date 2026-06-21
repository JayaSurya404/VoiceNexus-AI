import mongoose, { Schema } from "mongoose";

const looseSchema = new Schema({}, { strict: false, timestamps: false });

export const LeadModel = (mongoose.models.AiBrainLead ?? mongoose.model("AiBrainLead", looseSchema, "leads")) as mongoose.Model<any>;
export const NoteModel = (mongoose.models.AiBrainNote ?? mongoose.model("AiBrainNote", looseSchema, "notes")) as mongoose.Model<any>;
export const ContactModel =
  (mongoose.models.AiBrainContact ?? mongoose.model("AiBrainContact", looseSchema, "contacts")) as mongoose.Model<any>;
export const ActivityModel =
  (mongoose.models.AiBrainActivity ?? mongoose.model("AiBrainActivity", looseSchema, "activities")) as mongoose.Model<any>;
export const CustomerMemoryModel =
  (mongoose.models.AiBrainCustomerMemory ?? mongoose.model("AiBrainCustomerMemory", looseSchema, "customermemories")) as mongoose.Model<any>;
export const ConversationMemoryModel =
  (mongoose.models.AiBrainConversationMemory ??
    mongoose.model("AiBrainConversationMemory", looseSchema, "conversationmemories")) as mongoose.Model<any>;
export const TimelineEventModel =
  (mongoose.models.AiBrainTimelineEvent ?? mongoose.model("AiBrainTimelineEvent", looseSchema, "timelineevents")) as mongoose.Model<any>;
export const CustomerPreferenceModel =
  (mongoose.models.AiBrainCustomerPreference ??
    mongoose.model("AiBrainCustomerPreference", looseSchema, "customerpreferences")) as mongoose.Model<any>;
export const CallSessionModel =
  (mongoose.models.AiBrainCallSession ?? mongoose.model("AiBrainCallSession", looseSchema, "callsessions")) as mongoose.Model<any>;
export const CallTransferModel =
  (mongoose.models.AiBrainCallTransfer ?? mongoose.model("AiBrainCallTransfer", looseSchema, "calltransfers")) as mongoose.Model<any>;
export const OrganizationMemberModel =
  (mongoose.models.AiBrainOrganizationMember ??
    mongoose.model("AiBrainOrganizationMember", looseSchema, "organizationmembers")) as mongoose.Model<any>;
