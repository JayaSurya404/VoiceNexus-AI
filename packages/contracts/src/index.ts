import { z } from "zod";

export const platformRoles = ["SUPER_ADMIN"] as const;
export const organizationRoles = ["OWNER", "MANAGER", "AGENT"] as const;
export const leadStatuses = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "INTERESTED",
  "FOLLOW_UP",
  "WON",
  "LOST",
] as const;
export const activityTypes = ["CALL", "WHATSAPP", "EMAIL", "NOTE", "TASK", "MEETING"] as const;
export const customerTypes = ["LEAD", "CUSTOMER", "PARTNER", "VENDOR"] as const;
export const memorySources = ["CALL", "WHATSAPP", "EMAIL", "NOTE"] as const;
export const telephonyProviders = ["TWILIO", "EXOTEL"] as const;
export const callDirections = ["INBOUND", "OUTBOUND"] as const;
export const callStatuses = [
  "QUEUED",
  "RINGING",
  "IN_PROGRESS",
  "COMPLETED",
  "FAILED",
  "BUSY",
  "NO_ANSWER",
  "CANCELED",
] as const;
export const callEventTypes = [
  "CALL_CREATED",
  "CALL_QUEUED",
  "CALL_RINGING",
  "CALL_ANSWERED",
  "CALL_COMPLETED",
  "CALL_FAILED",
  "CALL_TRANSFERRED",
  "RECORDING_AVAILABLE",
  "WEBHOOK_RECEIVED",
] as const;
export const callRecordingStatuses = ["PROCESSING", "COMPLETED", "FAILED"] as const;
export const callTransferStatuses = ["REQUESTED", "COMPLETED", "FAILED"] as const;
export const aiConversationStatuses = ["CONNECTING", "ACTIVE", "ENDED", "FAILED"] as const;
export const realtimeTranscriptEventTypes = ["PARTIAL", "FINAL"] as const;
export const realtimeTopics = [
  "call.lifecycle",
  "call.audio",
  "transcript.partial",
  "transcript.final",
  "voice.response.requested",
  "voice.response.created",
  "voice.response.playback",
  "speech.state.changed",
  "turn.started",
  "turn.ended",
  "bargein.detected",
  "playback.started",
  "playback.completed",
  "playback.cancelled",
  "agent.takeover",
  "agent.joined",
  "agent.left",
  "queue.created",
  "queue.updated",
  "queue.session.created",
  "queue.session.assigned",
  "routing.completed",
  "routing.failed",
  "escalation.started",
  "takeover.started",
  "takeover.ended",
  "whisper.created",
  "supervisor.joined",
  "supervisor.left",
] as const;
export const timelineEventTypes = [
  "CALL_COMPLETED",
  "LEAD_CREATED",
  "FOLLOW_UP_CREATED",
  "PAYMENT_SENT",
  "PAYMENT_RECEIVED",
  "APPOINTMENT_BOOKED",
  "APPOINTMENT_COMPLETED",
  "WHATSAPP_SENT",
  "NOTE_CREATED",
] as const;
export const memorySentiments = ["POSITIVE", "NEUTRAL", "NEGATIVE", "MIXED"] as const;
export const whatsappConversationStatuses = ["OPEN", "PENDING", "RESOLVED", "ARCHIVED"] as const;
export const whatsappMessageDirections = ["INBOUND", "OUTBOUND"] as const;
export const whatsappMessageStatuses = ["QUEUED", "SENT", "DELIVERED", "READ", "FAILED"] as const;
export const whatsappTemplateCategories = ["MARKETING", "UTILITY", "AUTHENTICATION", "SERVICE"] as const;
export const whatsappTemplateStatuses = ["DRAFT", "PENDING_REVIEW", "APPROVED", "REJECTED"] as const;
export const whatsappAutomationTriggers = [
  "FIRST_MESSAGE",
  "KEYWORD",
  "NO_RESPONSE",
  "BUSINESS_HOURS",
] as const;
export const agentRoles = ["AGENT", "SUPERVISOR", "MANAGER"] as const;
export const agentStatuses = ["AVAILABLE", "BUSY", "OFFLINE", "BREAK"] as const;
export const agentPersonaRoles = ["SALES_AGENT", "SUPPORT_AGENT", "APPOINTMENT_SETTER", "COLLECTIONS_AGENT"] as const;
export const agentVoiceProviders = ["NONE", "OPENAI", "ELEVENLABS", "CARTESIA"] as const;
export const agentRuntimeStatuses = ["READY", "TESTING", "ACTIVE", "PAUSED", "ERROR"] as const;

export const PlatformRoleSchema = z.enum(platformRoles);
export const OrganizationRoleSchema = z.enum(organizationRoles);
export const LeadStatusSchema = z.enum(leadStatuses);
export const ActivityTypeSchema = z.enum(activityTypes);
export const CustomerTypeSchema = z.enum(customerTypes);
export const MemorySourceSchema = z.enum(memorySources);
export const TelephonyProviderSchema = z.enum(telephonyProviders);
export const CallDirectionSchema = z.enum(callDirections);
export const CallStatusSchema = z.enum(callStatuses);
export const CallEventTypeSchema = z.enum(callEventTypes);
export const CallRecordingStatusSchema = z.enum(callRecordingStatuses);
export const CallTransferStatusSchema = z.enum(callTransferStatuses);
export const AiConversationStatusSchema = z.enum(aiConversationStatuses);
export const RealtimeTranscriptEventTypeSchema = z.enum(realtimeTranscriptEventTypes);
export const RealtimeTopicSchema = z.enum(realtimeTopics);
export const TimelineEventTypeSchema = z.enum(timelineEventTypes);
export const MemorySentimentSchema = z.enum(memorySentiments);
export const WhatsappConversationStatusSchema = z.enum(whatsappConversationStatuses);
export const WhatsappMessageDirectionSchema = z.enum(whatsappMessageDirections);
export const WhatsappMessageStatusSchema = z.enum(whatsappMessageStatuses);
export const WhatsappTemplateCategorySchema = z.enum(whatsappTemplateCategories);
export const WhatsappTemplateStatusSchema = z.enum(whatsappTemplateStatuses);
export const WhatsappAutomationTriggerSchema = z.enum(whatsappAutomationTriggers);
export const AgentRoleSchema = z.enum(agentRoles);
export const AgentStatusSchema = z.enum(agentStatuses);
export const AgentPersonaRoleSchema = z.enum(agentPersonaRoles);
export const AgentVoiceProviderSchema = z.enum(agentVoiceProviders);
export const AgentRuntimeStatusSchema = z.enum(agentRuntimeStatuses);

export type PlatformRole = z.infer<typeof PlatformRoleSchema>;
export type OrganizationRole = z.infer<typeof OrganizationRoleSchema>;
export type LeadStatus = z.infer<typeof LeadStatusSchema>;
export type ActivityType = z.infer<typeof ActivityTypeSchema>;
export type CustomerType = z.infer<typeof CustomerTypeSchema>;
export type MemorySource = z.infer<typeof MemorySourceSchema>;
export type TelephonyProvider = z.infer<typeof TelephonyProviderSchema>;
export type CallDirection = z.infer<typeof CallDirectionSchema>;
export type CallStatus = z.infer<typeof CallStatusSchema>;
export type CallEventType = z.infer<typeof CallEventTypeSchema>;
export type CallRecordingStatus = z.infer<typeof CallRecordingStatusSchema>;
export type CallTransferStatus = z.infer<typeof CallTransferStatusSchema>;
export type AiConversationStatus = z.infer<typeof AiConversationStatusSchema>;
export type RealtimeTranscriptEventType = z.infer<typeof RealtimeTranscriptEventTypeSchema>;
export type RealtimeTopic = z.infer<typeof RealtimeTopicSchema>;
export type TimelineEventType = z.infer<typeof TimelineEventTypeSchema>;
export type MemorySentiment = z.infer<typeof MemorySentimentSchema>;
export type WhatsappConversationStatus = z.infer<typeof WhatsappConversationStatusSchema>;
export type WhatsappMessageDirection = z.infer<typeof WhatsappMessageDirectionSchema>;
export type WhatsappMessageStatus = z.infer<typeof WhatsappMessageStatusSchema>;
export type WhatsappTemplateCategory = z.infer<typeof WhatsappTemplateCategorySchema>;
export type WhatsappTemplateStatus = z.infer<typeof WhatsappTemplateStatusSchema>;
export type WhatsappAutomationTrigger = z.infer<typeof WhatsappAutomationTriggerSchema>;
export type AgentRole = z.infer<typeof AgentRoleSchema>;
export type AgentStatus = z.infer<typeof AgentStatusSchema>;
export type AgentPersonaRole = z.infer<typeof AgentPersonaRoleSchema>;
export type AgentVoiceProvider = z.infer<typeof AgentVoiceProviderSchema>;
export type AgentRuntimeStatus = z.infer<typeof AgentRuntimeStatusSchema>;

const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address")
  .max(254)
  .transform((email) => email.toLowerCase());

const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(128)
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number");

export const RegisterInputSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: emailSchema,
  password: passwordSchema,
  organizationName: z.string().trim().min(2).max(120),
});

export const LoginInputSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

export const RefreshInputSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

export const CreateOrganizationInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  timezone: z.string().trim().min(1).max(100).default("UTC"),
});

const idSchema = z.string().trim().min(1).max(64);
const optionalEmailSchema = emailSchema.optional().or(z.literal("").transform(() => undefined));
const optionalPhoneSchema = z
  .string()
  .trim()
  .min(5)
  .max(32)
  .optional()
  .or(z.literal("").transform(() => undefined));

export const ListLeadsQuerySchema = z.object({
  organizationId: idSchema,
  search: z.string().trim().max(120).optional(),
  status: LeadStatusSchema.optional(),
  assignedTo: z.string().trim().max(64).optional(),
  tag: z.string().trim().max(64).optional(),
});

export const CreateLeadInputSchema = z.object({
  organizationId: idSchema,
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: optionalEmailSchema,
  phone: optionalPhoneSchema,
  company: z.string().trim().max(120).optional().default(""),
  source: z.string().trim().max(80).optional().default("Manual"),
  status: LeadStatusSchema.default("NEW"),
  score: z.coerce.number().int().min(0).max(100).default(0),
  language: z.string().trim().min(2).max(24).default("en"),
  assignedTo: z.string().trim().max(64).nullable().optional().default(null),
  tags: z.array(idSchema).max(20).default([]),
});

export const UpdateLeadInputSchema = z.object({
  organizationId: idSchema,
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  email: optionalEmailSchema,
  phone: optionalPhoneSchema,
  company: z.string().trim().max(120).optional(),
  source: z.string().trim().max(80).optional(),
  status: LeadStatusSchema.optional(),
  score: z.coerce.number().int().min(0).max(100).optional(),
  language: z.string().trim().min(2).max(24).optional(),
  assignedTo: z.string().trim().max(64).nullable().optional(),
  tags: z.array(idSchema).max(20).optional(),
});

export const CreateContactInputSchema = z.object({
  organizationId: idSchema,
  leadId: idSchema,
  email: optionalEmailSchema,
  phone: optionalPhoneSchema,
  preferredLanguage: z.string().trim().min(2).max(24).default("en"),
  timezone: z.string().trim().min(1).max(100).default("UTC"),
  customerType: CustomerTypeSchema.default("LEAD"),
});

export const CreateActivityInputSchema = z.object({
  organizationId: idSchema,
  leadId: idSchema,
  type: ActivityTypeSchema,
  title: z.string().trim().min(1).max(140),
  description: z.string().trim().max(2000).optional().default(""),
});

export const CreateNoteInputSchema = z.object({
  organizationId: idSchema,
  leadId: idSchema,
  content: z.string().trim().min(1).max(5000),
});

export const CreateTagInputSchema = z.object({
  organizationId: idSchema,
  name: z.string().trim().min(1).max(48),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Use a 6-digit hex color")
    .default("#0ea5e9"),
});

export const OrganizationScopedQuerySchema = z.object({
  organizationId: idSchema,
  leadId: idSchema.optional(),
});

export const CreateCustomerMemoryInputSchema = z.object({
  organizationId: idSchema,
  leadId: idSchema,
  summary: z.string().trim().min(1).max(5000),
  relationshipScore: z.coerce.number().int().min(0).max(100).default(50),
  memoryTags: z.array(idSchema).max(20).default([]),
});

export const CreateConversationMemoryInputSchema = z.object({
  organizationId: idSchema,
  leadId: idSchema,
  source: MemorySourceSchema,
  content: z.string().trim().min(1).max(10_000),
  sentiment: MemorySentimentSchema.default("NEUTRAL"),
  importance: z.coerce.number().int().min(1).max(5).default(3),
});

export const CreateTimelineEventInputSchema = z.object({
  organizationId: idSchema,
  leadId: idSchema,
  eventType: TimelineEventTypeSchema,
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(3000).default(""),
  metadata: z.record(z.unknown()).default({}),
});

export const CreateCustomerPreferenceInputSchema = z.object({
  organizationId: idSchema,
  leadId: idSchema,
  language: z.string().trim().min(2).max(24).default("en"),
  timezone: z.string().trim().min(1).max(100).default("UTC"),
  preferredContactTime: z.string().trim().min(1).max(120).default("Business hours"),
  communicationStyle: z.string().trim().min(1).max(500).default("Friendly and concise"),
});

const e164PhoneSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{7,14}$/, "Use E.164 format, for example +14155552671");

export const ListCallsQuerySchema = z.object({
  organizationId: idSchema,
  leadId: idSchema.optional(),
  status: CallStatusSchema.optional(),
});

export const CreateOutboundCallInputSchema = z.object({
  organizationId: idSchema,
  leadId: idSchema,
  to: e164PhoneSchema,
  from: e164PhoneSchema.optional(),
  record: z.coerce.boolean().default(true),
  initialMessage: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .default("Hello from VoiceNexus AI. Please hold while we connect your assistant."),
});

export const TransferCallInputSchema = z.object({
  organizationId: idSchema,
  callSessionId: idSchema,
  toPhoneNumber: e164PhoneSchema,
  reason: z.string().trim().max(500).default("Human handoff requested"),
});

export const ListWhatsappQuerySchema = z.object({
  organizationId: idSchema,
  search: z.string().trim().max(120).optional(),
  status: WhatsappConversationStatusSchema.optional(),
});

export const CreateWhatsappContactInputSchema = z.object({
  organizationId: idSchema,
  leadId: idSchema.optional().nullable().default(null),
  displayName: z.string().trim().min(1).max(120),
  phone: e164PhoneSchema,
  email: optionalEmailSchema,
  tags: z.array(z.string().trim().min(1).max(48)).max(20).default([]),
  notes: z.string().trim().max(2000).default(""),
});

export const UpdateWhatsappContactInputSchema = CreateWhatsappContactInputSchema.omit({
  organizationId: true,
}).partial().extend({
  organizationId: idSchema,
});

export const CreateWhatsappConversationInputSchema = z.object({
  organizationId: idSchema,
  contactId: idSchema,
  subject: z.string().trim().max(160).default("WhatsApp conversation"),
});

export const UpdateWhatsappConversationInputSchema = z.object({
  organizationId: idSchema,
  status: WhatsappConversationStatusSchema.optional(),
  assignedTo: z.string().trim().max(64).nullable().optional(),
  aiEnabled: z.boolean().optional(),
});

export const SendWhatsappMessageInputSchema = z.object({
  organizationId: idSchema,
  conversationId: idSchema,
  body: z.string().trim().min(1).max(4096),
  useAi: z.boolean().default(false),
});

export const CreateWhatsappTemplateInputSchema = z.object({
  organizationId: idSchema,
  name: z.string().trim().min(1).max(80),
  category: WhatsappTemplateCategorySchema.default("UTILITY"),
  language: z.string().trim().min(2).max(16).default("en"),
  body: z.string().trim().min(1).max(4096),
  variables: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  status: WhatsappTemplateStatusSchema.default("DRAFT"),
});

export const CreateWhatsappBroadcastInputSchema = z.object({
  organizationId: idSchema,
  name: z.string().trim().min(1).max(120),
  templateId: idSchema.optional().nullable().default(null),
  messageBody: z.string().trim().min(1).max(4096),
  contactIds: z.array(idSchema).min(1).max(500),
  scheduledAt: z.string().datetime().nullable().optional().default(null),
});

export const CreateWhatsappAutomationInputSchema = z.object({
  organizationId: idSchema,
  name: z.string().trim().min(1).max(120),
  trigger: WhatsappAutomationTriggerSchema,
  keyword: z.string().trim().max(80).optional().default(""),
  responseBody: z.string().trim().min(1).max(4096),
  isEnabled: z.boolean().default(true),
});

export const ListAgentsQuerySchema = z.object({
  organizationId: idSchema,
  search: z.string().trim().max(120).optional(),
  status: AgentStatusSchema.optional(),
});

export const CreateAgentInputSchema = z.object({
  organizationId: idSchema,
  name: z.string().trim().min(1).max(120),
  email: emailSchema,
  role: AgentRoleSchema.default("AGENT"),
  skills: z.array(z.string().trim().min(1).max(48)).max(30).default([]),
  personaId: idSchema.nullable().optional().default(null),
  voiceProvider: AgentVoiceProviderSchema.default("NONE"),
  voiceId: z.string().trim().max(120).default(""),
  knowledgeBaseIds: z.array(idSchema).max(20).default([]),
  prompt: z.string().trim().max(12_000).default(""),
});

export const UpdateAgentInputSchema = CreateAgentInputSchema.omit({ organizationId: true }).partial().extend({
  organizationId: idSchema,
  status: AgentStatusSchema.optional(),
  runtimeStatus: AgentRuntimeStatusSchema.optional(),
});

export const CreateAgentPersonaInputSchema = z.object({
  organizationId: idSchema,
  name: z.string().trim().min(1).max(120),
  role: AgentPersonaRoleSchema,
  systemPrompt: z.string().trim().min(1).max(12_000),
  tone: z.string().trim().min(1).max(500),
  goals: z.array(z.string().trim().min(1).max(240)).max(20).default([]),
  constraints: z.array(z.string().trim().min(1).max(240)).max(20).default([]),
  isDefault: z.boolean().default(false),
});

export const UpdateAgentPersonaInputSchema = CreateAgentPersonaInputSchema.omit({ organizationId: true }).partial().extend({
  organizationId: idSchema,
});

export const CreateAgentSkillInputSchema = z.object({
  organizationId: idSchema,
  agentId: idSchema,
  skill: z.string().trim().min(1).max(48),
  level: z.coerce.number().int().min(1).max(5).default(1),
  certified: z.boolean().default(false),
  active: z.boolean().default(true),
});

export const UpdateAgentSkillInputSchema = CreateAgentSkillInputSchema.omit({ organizationId: true, agentId: true }).partial().extend({
  organizationId: idSchema,
});

export const UpsertAgentAvailabilityInputSchema = z.object({
  organizationId: idSchema,
  agentId: idSchema,
  status: AgentStatusSchema,
  statusReason: z.string().trim().max(500).nullable().optional().default(null),
  capacity: z.coerce.number().int().min(1).max(20).default(1),
  schedule: z.array(z.object({
    dayOfWeek: z.coerce.number().int().min(0).max(6),
    startTime: z.string().trim().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().trim().regex(/^\d{2}:\d{2}$/),
    timezone: z.string().trim().min(1).max(100).default("UTC"),
    active: z.boolean().default(true),
  })).max(21).default([]),
});

export const TestAgentInputSchema = z.object({
  organizationId: idSchema,
  agentId: idSchema,
  message: z.string().trim().min(1).max(3000),
  crmContext: z.string().trim().max(3000).default(""),
  memoryContext: z.string().trim().max(3000).default(""),
});

export type RegisterInput = z.input<typeof RegisterInputSchema>;
export type LoginInput = z.input<typeof LoginInputSchema>;
export type RefreshInput = z.input<typeof RefreshInputSchema>;
export type CreateOrganizationInput = z.input<typeof CreateOrganizationInputSchema>;
export type ListLeadsQuery = z.input<typeof ListLeadsQuerySchema>;
export type CreateLeadInput = z.input<typeof CreateLeadInputSchema>;
export type UpdateLeadInput = z.input<typeof UpdateLeadInputSchema>;
export type CreateContactInput = z.input<typeof CreateContactInputSchema>;
export type CreateActivityInput = z.input<typeof CreateActivityInputSchema>;
export type CreateNoteInput = z.input<typeof CreateNoteInputSchema>;
export type CreateTagInput = z.input<typeof CreateTagInputSchema>;
export type OrganizationScopedQuery = z.input<typeof OrganizationScopedQuerySchema>;
export type CreateCustomerMemoryInput = z.input<typeof CreateCustomerMemoryInputSchema>;
export type CreateConversationMemoryInput = z.input<typeof CreateConversationMemoryInputSchema>;
export type CreateTimelineEventInput = z.input<typeof CreateTimelineEventInputSchema>;
export type CreateCustomerPreferenceInput = z.input<typeof CreateCustomerPreferenceInputSchema>;
export type ListCallsQuery = z.input<typeof ListCallsQuerySchema>;
export type CreateOutboundCallInput = z.input<typeof CreateOutboundCallInputSchema>;
export type TransferCallInput = z.input<typeof TransferCallInputSchema>;
export type ListWhatsappQuery = z.input<typeof ListWhatsappQuerySchema>;
export type CreateWhatsappContactInput = z.input<typeof CreateWhatsappContactInputSchema>;
export type UpdateWhatsappContactInput = z.input<typeof UpdateWhatsappContactInputSchema>;
export type CreateWhatsappConversationInput = z.input<typeof CreateWhatsappConversationInputSchema>;
export type UpdateWhatsappConversationInput = z.input<typeof UpdateWhatsappConversationInputSchema>;
export type SendWhatsappMessageInput = z.input<typeof SendWhatsappMessageInputSchema>;
export type CreateWhatsappTemplateInput = z.input<typeof CreateWhatsappTemplateInputSchema>;
export type CreateWhatsappBroadcastInput = z.input<typeof CreateWhatsappBroadcastInputSchema>;
export type CreateWhatsappAutomationInput = z.input<typeof CreateWhatsappAutomationInputSchema>;
export type ListAgentsQuery = z.input<typeof ListAgentsQuerySchema>;
export type CreateAgentInput = z.input<typeof CreateAgentInputSchema>;
export type UpdateAgentInput = z.input<typeof UpdateAgentInputSchema>;
export type CreateAgentPersonaInput = z.input<typeof CreateAgentPersonaInputSchema>;
export type UpdateAgentPersonaInput = z.input<typeof UpdateAgentPersonaInputSchema>;
export type CreateAgentSkillInput = z.input<typeof CreateAgentSkillInputSchema>;
export type UpdateAgentSkillInput = z.input<typeof UpdateAgentSkillInputSchema>;
export type UpsertAgentAvailabilityInput = z.input<typeof UpsertAgentAvailabilityInputSchema>;
export type TestAgentInput = z.input<typeof TestAgentInputSchema>;
export type RegisterPayload = z.infer<typeof RegisterInputSchema>;
export type LoginPayload = z.infer<typeof LoginInputSchema>;
export type RefreshPayload = z.infer<typeof RefreshInputSchema>;
export type CreateOrganizationPayload = z.infer<typeof CreateOrganizationInputSchema>;
export type ListLeadsPayload = z.infer<typeof ListLeadsQuerySchema>;
export type CreateLeadPayload = z.infer<typeof CreateLeadInputSchema>;
export type UpdateLeadPayload = z.infer<typeof UpdateLeadInputSchema>;
export type CreateContactPayload = z.infer<typeof CreateContactInputSchema>;
export type CreateActivityPayload = z.infer<typeof CreateActivityInputSchema>;
export type CreateNotePayload = z.infer<typeof CreateNoteInputSchema>;
export type CreateTagPayload = z.infer<typeof CreateTagInputSchema>;
export type OrganizationScopedQueryPayload = z.infer<typeof OrganizationScopedQuerySchema>;
export type CreateCustomerMemoryPayload = z.infer<typeof CreateCustomerMemoryInputSchema>;
export type CreateConversationMemoryPayload = z.infer<typeof CreateConversationMemoryInputSchema>;
export type CreateTimelineEventPayload = z.infer<typeof CreateTimelineEventInputSchema>;
export type CreateCustomerPreferencePayload = z.infer<typeof CreateCustomerPreferenceInputSchema>;
export type ListCallsPayload = z.infer<typeof ListCallsQuerySchema>;
export type CreateOutboundCallPayload = z.infer<typeof CreateOutboundCallInputSchema>;
export type TransferCallPayload = z.infer<typeof TransferCallInputSchema>;
export type ListWhatsappPayload = z.infer<typeof ListWhatsappQuerySchema>;
export type CreateWhatsappContactPayload = z.infer<typeof CreateWhatsappContactInputSchema>;
export type UpdateWhatsappContactPayload = z.infer<typeof UpdateWhatsappContactInputSchema>;
export type CreateWhatsappConversationPayload = z.infer<typeof CreateWhatsappConversationInputSchema>;
export type UpdateWhatsappConversationPayload = z.infer<typeof UpdateWhatsappConversationInputSchema>;
export type SendWhatsappMessagePayload = z.infer<typeof SendWhatsappMessageInputSchema>;
export type CreateWhatsappTemplatePayload = z.infer<typeof CreateWhatsappTemplateInputSchema>;
export type CreateWhatsappBroadcastPayload = z.infer<typeof CreateWhatsappBroadcastInputSchema>;
export type CreateWhatsappAutomationPayload = z.infer<typeof CreateWhatsappAutomationInputSchema>;
export type ListAgentsPayload = z.infer<typeof ListAgentsQuerySchema>;
export type CreateAgentPayload = z.infer<typeof CreateAgentInputSchema>;
export type UpdateAgentPayload = z.infer<typeof UpdateAgentInputSchema>;
export type CreateAgentPersonaPayload = z.infer<typeof CreateAgentPersonaInputSchema>;
export type UpdateAgentPersonaPayload = z.infer<typeof UpdateAgentPersonaInputSchema>;
export type CreateAgentSkillPayload = z.infer<typeof CreateAgentSkillInputSchema>;
export type UpdateAgentSkillPayload = z.infer<typeof UpdateAgentSkillInputSchema>;
export type UpsertAgentAvailabilityPayload = z.infer<typeof UpsertAgentAvailabilityInputSchema>;
export type TestAgentPayload = z.infer<typeof TestAgentInputSchema>;

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  platformRole: PlatformRole | null;
  createdAt: string;
}

export interface OrganizationDto {
  id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "SUSPENDED";
  timezone: string;
  role: OrganizationRole | PlatformRole;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  user: UserDto;
  organizations: OrganizationDto[];
}

export interface TagDto {
  id: string;
  organizationId: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadDto {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  company: string;
  source: string;
  status: LeadStatus;
  score: number;
  language: string;
  assignedTo: string | null;
  tags: TagDto[];
  notesCount: number;
  lastActivityAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactDto {
  id: string;
  organizationId: string;
  leadId: string;
  email: string | null;
  phone: string | null;
  preferredLanguage: string;
  timezone: string;
  customerType: CustomerType;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityDto {
  id: string;
  organizationId: string;
  leadId: string;
  type: ActivityType;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

export interface NoteDto {
  id: string;
  organizationId: string;
  leadId: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

export interface LeadMetricsDto {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  wonLeads: number;
}

export interface MemoryTagDto {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerMemoryDto {
  id: string;
  organizationId: string;
  leadId: string;
  summary: string;
  relationshipScore: number;
  lastInteractionAt: string | null;
  memoryTags: MemoryTagDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMemoryDto {
  id: string;
  organizationId: string;
  leadId: string;
  source: MemorySource;
  content: string;
  sentiment: MemorySentiment;
  importance: number;
  createdAt: string;
}

export interface TimelineEventDto {
  id: string;
  organizationId: string;
  leadId: string;
  eventType: TimelineEventType;
  title: string;
  description: string;
  metadata: Record<string, unknown>;
  createdBy: string;
  createdAt: string;
}

export interface CustomerPreferenceDto {
  id: string;
  organizationId: string;
  leadId: string;
  language: string;
  timezone: string;
  preferredContactTime: string;
  communicationStyle: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryBundleDto {
  memory: CustomerMemoryDto;
  conversationMemories: ConversationMemoryDto[];
  timelineEvents: TimelineEventDto[];
  preferences: CustomerPreferenceDto | null;
}

export interface PhoneNumberDto {
  id: string;
  organizationId: string;
  provider: TelephonyProvider;
  phoneNumber: string;
  label: string;
  providerSid: string | null;
  status: "ACTIVE" | "INACTIVE";
  capabilities: {
    voice: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CallSessionDto {
  id: string;
  organizationId: string;
  leadId: string | null;
  phoneNumberId: string | null;
  provider: TelephonyProvider;
  providerCallSid: string | null;
  direction: CallDirection;
  status: CallStatus;
  from: string;
  to: string;
  initiatedBy: string | null;
  startedAt: string | null;
  endedAt: string | null;
  durationSeconds: number | null;
  recordingEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CallEventDto {
  id: string;
  organizationId: string;
  callSessionId: string;
  type: CallEventType;
  title: string;
  description: string;
  providerStatus: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface CallRecordingDto {
  id: string;
  organizationId: string;
  callSessionId: string;
  providerRecordingSid: string;
  recordingUrl: string;
  status: CallRecordingStatus;
  durationSeconds: number | null;
  createdAt: string;
}

export interface CallTransferDto {
  id: string;
  organizationId: string;
  callSessionId: string;
  fromUserId: string;
  toPhoneNumber: string;
  status: CallTransferStatus;
  reason: string;
  createdAt: string;
}

export interface CallDetailsDto {
  call: CallSessionDto;
  events: CallEventDto[];
  recordings: CallRecordingDto[];
  transfers: CallTransferDto[];
  lead: LeadDto | null;
  memory: CustomerMemoryDto | null;
}

export interface CallMetricsDto {
  totalCalls: number;
  inboundCalls: number;
  outboundCalls: number;
  completedCalls: number;
}

export interface ActiveCallSessionDto {
  organizationId: string;
  callSessionId: string;
  providerCallSid: string | null;
  streamSid: string | null;
  status: AiConversationStatus;
  connectedAt: string;
  updatedAt: string;
  from: string | null;
  to: string | null;
}

export interface RealtimeTranscriptEventDto {
  id: string;
  organizationId: string;
  callSessionId: string;
  aiConversationSessionId: string | null;
  type: RealtimeTranscriptEventType;
  speaker: "CUSTOMER" | "ASSISTANT" | "SYSTEM";
  text: string;
  language: string | null;
  confidence: number | null;
  sequenceNumber: number;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface RealtimeEventEnvelopeDto<TPayload = Record<string, unknown>> {
  id: string;
  topic: RealtimeTopic;
  organizationId: string;
  callSessionId: string | null;
  occurredAt: string;
  payload: TPayload;
}

export interface LiveCallsSnapshotMessageDto {
  type: "SNAPSHOT";
  organizationId: string;
  calls: ActiveCallSessionDto[];
}

export interface LiveCallsEventMessageDto {
  type: "EVENT";
  event: RealtimeEventEnvelopeDto;
}

export type LiveCallsWebSocketMessageDto = LiveCallsSnapshotMessageDto | LiveCallsEventMessageDto;

export interface WhatsappContactDto {
  id: string;
  organizationId: string;
  leadId: string | null;
  displayName: string;
  phone: string;
  email: string | null;
  tags: string[];
  notes: string;
  lastConversationAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsappMessageDto {
  id: string;
  organizationId: string;
  conversationId: string;
  contactId: string;
  direction: WhatsappMessageDirection;
  body: string;
  status: WhatsappMessageStatus;
  sentBy: string | null;
  isAiGenerated: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface WhatsappConversationDto {
  id: string;
  organizationId: string;
  contactId: string;
  leadId: string | null;
  subject: string;
  status: WhatsappConversationStatus;
  assignedTo: string | null;
  aiEnabled: boolean;
  lastMessagePreview: string;
  lastMessageAt: string | null;
  unreadCount: number;
  runtimeState: {
    state: "IDLE" | "WAITING_FOR_CUSTOMER" | "WAITING_FOR_AGENT" | "AI_REPLYING";
    updatedAt: string;
  };
  contact: WhatsappContactDto | null;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsappConversationDetailsDto {
  conversation: WhatsappConversationDto;
  messages: WhatsappMessageDto[];
  lead: LeadDto | null;
  memory: CustomerMemoryDto | null;
}

export interface WhatsappTemplateDto {
  id: string;
  organizationId: string;
  name: string;
  category: WhatsappTemplateCategory;
  language: string;
  body: string;
  variables: string[];
  status: WhatsappTemplateStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsappBroadcastDto {
  id: string;
  organizationId: string;
  name: string;
  templateId: string | null;
  messageBody: string;
  contactIds: string[];
  status: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "FAILED";
  scheduledAt: string | null;
  sentAt: string | null;
  metrics: {
    total: number;
    queued: number;
    sent: number;
    failed: number;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsappAutomationDto {
  id: string;
  organizationId: string;
  name: string;
  trigger: WhatsappAutomationTrigger;
  keyword: string;
  responseBody: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsappDashboardDto {
  totalContacts: number;
  openConversations: number;
  unreadMessages: number;
  aiRepliesEnabled: number;
  broadcastsSent: number;
  templatesApproved: number;
}

export interface AgentPersonaWorkspaceDto {
  id: string;
  organizationId: string;
  name: string;
  role: AgentPersonaRole;
  systemPrompt: string;
  tone: string;
  goals: string[];
  constraints: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgentVoiceAssignmentDto {
  provider: AgentVoiceProvider;
  voiceId: string;
}

export interface AgentAvailabilityScheduleDto {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  active: boolean;
}

export interface AgentAvailabilityWorkspaceDto {
  id: string;
  organizationId: string;
  agentId: string;
  status: AgentStatus;
  statusReason: string | null;
  capacity: number;
  activeSessionCount: number;
  schedule: AgentAvailabilityScheduleDto[];
  updatedAt: string;
}

export interface AgentSkillWorkspaceDto {
  id: string;
  organizationId: string;
  agentId: string;
  skill: string;
  level: number;
  certified: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgentWorkspaceDto {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: AgentRole;
  status: AgentStatus;
  runtimeStatus: AgentRuntimeStatus;
  activeSessionId: string | null;
  skills: string[];
  personaId: string | null;
  voice: AgentVoiceAssignmentDto;
  knowledgeBaseIds: string[];
  prompt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentPerformanceWorkspaceDto {
  id: string;
  organizationId: string;
  agentId: string;
  callsHandled: number;
  averageDuration: number;
  averageQaScore: number;
  averageSentiment: number;
  transfers: number;
  conversions: number;
  leadQuality: number;
  computedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentDashboardDto {
  totalAgents: number;
  availableAgents: number;
  activeAgents: number;
  personas: number;
  skills: number;
  averageQaScore: number;
}

export interface AgentDetailsDto {
  agent: AgentWorkspaceDto;
  persona: AgentPersonaWorkspaceDto | null;
  skills: AgentSkillWorkspaceDto[];
  availability: AgentAvailabilityWorkspaceDto | null;
  performance: AgentPerformanceWorkspaceDto | null;
}

export interface AgentTestResultDto {
  agentId: string;
  organizationId: string;
  input: string;
  response: string;
  runtimeStatus: AgentRuntimeStatus;
  confidence: number;
  usedPersonaId: string | null;
  usedKnowledgeBaseIds: string[];
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  requestId: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  requestId: string;
}
