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
