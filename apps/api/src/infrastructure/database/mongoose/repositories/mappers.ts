import type { Activity } from "../../../../domain/entities/activity.js";
import type { CallEvent } from "../../../../domain/entities/call-event.js";
import type { CallRecording } from "../../../../domain/entities/call-recording.js";
import type { CallSession } from "../../../../domain/entities/call-session.js";
import type { CallTransfer } from "../../../../domain/entities/call-transfer.js";
import type { Contact } from "../../../../domain/entities/contact.js";
import type { ConversationMemory } from "../../../../domain/entities/conversation-memory.js";
import type { CustomerMemory } from "../../../../domain/entities/customer-memory.js";
import type { CustomerPreference } from "../../../../domain/entities/customer-preference.js";
import type { Lead } from "../../../../domain/entities/lead.js";
import type { MemoryTag } from "../../../../domain/entities/memory-tag.js";
import type { Note } from "../../../../domain/entities/note.js";
import type { PhoneNumber } from "../../../../domain/entities/phone-number.js";
import type { OrganizationMember } from "../../../../domain/entities/organization-member.js";
import type { Organization } from "../../../../domain/entities/organization.js";
import type { RefreshSession } from "../../../../domain/entities/refresh-session.js";
import type { Tag } from "../../../../domain/entities/tag.js";
import type { TimelineEvent } from "../../../../domain/entities/timeline-event.js";
import type { User } from "../../../../domain/entities/user.js";
import type {
  AgentAvailabilityWorkspace,
  AgentPerformanceWorkspace,
  AgentPersonaWorkspace,
  AgentSkillWorkspace,
  AgentWorkspace,
} from "../../../../domain/entities/agent-workspace.js";
import type {
  WhatsappAutomation,
  WhatsappBroadcast,
  WhatsappContact,
  WhatsappConversation,
  WhatsappMessage,
  WhatsappTemplate,
} from "../../../../domain/entities/whatsapp.js";
import type { ActivityMongoDocument } from "../models/activity-model.js";
import type { CallEventMongoDocument } from "../models/call-event-model.js";
import type { CallRecordingMongoDocument } from "../models/call-recording-model.js";
import type { CallSessionMongoDocument } from "../models/call-session-model.js";
import type { CallTransferMongoDocument } from "../models/call-transfer-model.js";
import type { ContactMongoDocument } from "../models/contact-model.js";
import type { ConversationMemoryMongoDocument } from "../models/conversation-memory-model.js";
import type { CustomerMemoryMongoDocument } from "../models/customer-memory-model.js";
import type { CustomerPreferenceMongoDocument } from "../models/customer-preference-model.js";
import type { LeadMongoDocument } from "../models/lead-model.js";
import type { MemoryTagMongoDocument } from "../models/memory-tag-model.js";
import type { NoteMongoDocument } from "../models/note-model.js";
import type { PhoneNumberMongoDocument } from "../models/phone-number-model.js";
import type { OrganizationMemberMongoDocument } from "../models/organization-member-model.js";
import type { OrganizationMongoDocument } from "../models/organization-model.js";
import type { RefreshSessionMongoDocument } from "../models/refresh-session-model.js";
import type { TagMongoDocument } from "../models/tag-model.js";
import type { TimelineEventMongoDocument } from "../models/timeline-event-model.js";
import type { UserMongoDocument } from "../models/user-model.js";
import type {
  AgentAvailabilityWorkspaceMongoDocument,
  AgentPerformanceWorkspaceMongoDocument,
  AgentPersonaWorkspaceMongoDocument,
  AgentSkillWorkspaceMongoDocument,
  AgentWorkspaceMongoDocument,
} from "../models/agent-workspace-models.js";
import type {
  WhatsappAutomationMongoDocument,
  WhatsappBroadcastMongoDocument,
  WhatsappContactMongoDocument,
  WhatsappConversationMongoDocument,
  WhatsappMessageMongoDocument,
  WhatsappTemplateMongoDocument,
} from "../models/whatsapp-models.js";

export function mapUser(document: UserMongoDocument): User {
  return {
    id: document._id.toString(),
    email: document.email,
    firstName: document.firstName,
    lastName: document.lastName,
    passwordHash: document.passwordHash,
    platformRole: document.platformRole,
    status: document.status,
    lastLoginAt: document.lastLoginAt,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapOrganization(document: OrganizationMongoDocument): Organization {
  return {
    id: document._id.toString(),
    name: document.name,
    slug: document.slug,
    status: document.status,
    timezone: document.timezone,
    createdBy: document.createdBy.toHexString(),
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapOrganizationMember(
  document: OrganizationMemberMongoDocument,
): OrganizationMember {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    userId: document.userId.toHexString(),
    role: document.role,
    status: document.status,
    invitedBy: document.invitedBy?.toHexString() ?? null,
    joinedAt: document.joinedAt,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapRefreshSession(document: RefreshSessionMongoDocument): RefreshSession {
  return {
    id: document._id.toString(),
    tokenId: document.tokenId,
    familyId: document.familyId,
    userId: document.userId.toHexString(),
    tokenHash: document.tokenHash,
    expiresAt: document.expiresAt,
    revokedAt: document.revokedAt,
    replacedByTokenId: document.replacedByTokenId,
    userAgent: document.userAgent,
    ipHash: document.ipHash,
    createdAt: document.createdAt,
  };
}

export function mapLead(document: LeadMongoDocument): Lead {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    firstName: document.firstName,
    lastName: document.lastName,
    email: document.email,
    phone: document.phone,
    company: document.company,
    source: document.source,
    status: document.status,
    score: document.score,
    language: document.language,
    assignedTo: document.assignedTo?.toHexString() ?? null,
    tags: document.tags.map((tagId) => tagId.toHexString()),
    notesCount: document.notesCount,
    lastActivityAt: document.lastActivityAt,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapContact(document: ContactMongoDocument): Contact {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    leadId: document.leadId.toHexString(),
    email: document.email,
    phone: document.phone,
    preferredLanguage: document.preferredLanguage,
    timezone: document.timezone,
    customerType: document.customerType,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapActivity(document: ActivityMongoDocument): Activity {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    leadId: document.leadId.toHexString(),
    type: document.type,
    title: document.title,
    description: document.description,
    createdBy: document.createdBy.toHexString(),
    createdAt: document.createdAt,
  };
}

export function mapNote(document: NoteMongoDocument): Note {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    leadId: document.leadId.toHexString(),
    content: document.content,
    createdBy: document.createdBy.toHexString(),
    createdAt: document.createdAt,
  };
}

export function mapTag(document: TagMongoDocument): Tag {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    name: document.name,
    color: document.color,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapCustomerMemory(document: CustomerMemoryMongoDocument): CustomerMemory {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    leadId: document.leadId.toHexString(),
    summary: document.summary,
    relationshipScore: document.relationshipScore,
    lastInteractionAt: document.lastInteractionAt,
    memoryTags: document.memoryTags.map((tagId) => tagId.toHexString()),
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapConversationMemory(document: ConversationMemoryMongoDocument): ConversationMemory {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    leadId: document.leadId.toHexString(),
    source: document.source,
    content: document.content,
    sentiment: document.sentiment,
    importance: document.importance,
    createdAt: document.createdAt,
  };
}

export function mapTimelineEvent(document: TimelineEventMongoDocument): TimelineEvent {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    leadId: document.leadId.toHexString(),
    eventType: document.eventType,
    title: document.title,
    description: document.description,
    metadata: document.metadata,
    createdBy: document.createdBy.toHexString(),
    createdAt: document.createdAt,
  };
}

export function mapCustomerPreference(document: CustomerPreferenceMongoDocument): CustomerPreference {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    leadId: document.leadId.toHexString(),
    language: document.language,
    timezone: document.timezone,
    preferredContactTime: document.preferredContactTime,
    communicationStyle: document.communicationStyle,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapMemoryTag(document: MemoryTagMongoDocument): MemoryTag {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    name: document.name,
    description: document.description,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapPhoneNumber(document: PhoneNumberMongoDocument): PhoneNumber {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    provider: document.provider,
    phoneNumber: document.phoneNumber,
    label: document.label,
    providerSid: document.providerSid,
    status: document.status,
    capabilities: {
      voice: document.capabilities.voice,
      sms: document.capabilities.sms,
      whatsapp: document.capabilities.whatsapp,
    },
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapCallSession(document: CallSessionMongoDocument): CallSession {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    leadId: document.leadId?.toHexString() ?? null,
    phoneNumberId: document.phoneNumberId?.toHexString() ?? null,
    provider: document.provider,
    providerCallSid: document.providerCallSid,
    direction: document.direction,
    status: document.status,
    from: document.from,
    to: document.to,
    initiatedBy: document.initiatedBy?.toHexString() ?? null,
    startedAt: document.startedAt,
    endedAt: document.endedAt,
    durationSeconds: document.durationSeconds,
    recordingEnabled: document.recordingEnabled,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapCallEvent(document: CallEventMongoDocument): CallEvent {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    callSessionId: document.callSessionId.toHexString(),
    type: document.type,
    title: document.title,
    description: document.description,
    providerStatus: document.providerStatus,
    metadata: document.metadata,
    createdAt: document.createdAt,
  };
}

export function mapCallRecording(document: CallRecordingMongoDocument): CallRecording {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    callSessionId: document.callSessionId.toHexString(),
    providerRecordingSid: document.providerRecordingSid,
    recordingUrl: document.recordingUrl,
    status: document.status,
    durationSeconds: document.durationSeconds,
    createdAt: document.createdAt,
  };
}

export function mapCallTransfer(document: CallTransferMongoDocument): CallTransfer {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    callSessionId: document.callSessionId.toHexString(),
    fromUserId: document.fromUserId.toHexString(),
    toPhoneNumber: document.toPhoneNumber,
    status: document.status,
    reason: document.reason,
    createdAt: document.createdAt,
  };
}

export function mapWhatsappContact(document: WhatsappContactMongoDocument): WhatsappContact {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    leadId: document.leadId?.toHexString() ?? null,
    displayName: document.displayName,
    phone: document.phone,
    email: document.email,
    tags: document.tags,
    notes: document.notes,
    lastConversationAt: document.lastConversationAt,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapWhatsappConversation(document: WhatsappConversationMongoDocument): WhatsappConversation {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    contactId: document.contactId.toHexString(),
    leadId: document.leadId?.toHexString() ?? null,
    subject: document.subject,
    status: document.status,
    assignedTo: document.assignedTo?.toHexString() ?? null,
    aiEnabled: document.aiEnabled,
    lastMessagePreview: document.lastMessagePreview,
    lastMessageAt: document.lastMessageAt,
    unreadCount: document.unreadCount,
    runtimeState: document.runtimeState,
    runtimeUpdatedAt: document.runtimeUpdatedAt,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapWhatsappMessage(document: WhatsappMessageMongoDocument): WhatsappMessage {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    conversationId: document.conversationId.toHexString(),
    contactId: document.contactId.toHexString(),
    direction: document.direction,
    body: document.body,
    status: document.status,
    sentBy: document.sentBy?.toHexString() ?? null,
    isAiGenerated: document.isAiGenerated,
    metadata: document.metadata,
    createdAt: document.createdAt,
  };
}

export function mapWhatsappTemplate(document: WhatsappTemplateMongoDocument): WhatsappTemplate {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    name: document.name,
    category: document.category,
    language: document.language,
    body: document.body,
    variables: document.variables,
    status: document.status,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapWhatsappBroadcast(document: WhatsappBroadcastMongoDocument): WhatsappBroadcast {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    name: document.name,
    templateId: document.templateId?.toHexString() ?? null,
    messageBody: document.messageBody,
    contactIds: document.contactIds.map((contactId) => contactId.toHexString()),
    status: document.status,
    scheduledAt: document.scheduledAt,
    sentAt: document.sentAt,
    metrics: document.metrics,
    createdBy: document.createdBy.toHexString(),
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapWhatsappAutomation(document: WhatsappAutomationMongoDocument): WhatsappAutomation {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    name: document.name,
    trigger: document.trigger,
    keyword: document.keyword,
    responseBody: document.responseBody,
    isEnabled: document.isEnabled,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapAgentWorkspace(document: AgentWorkspaceMongoDocument): AgentWorkspace {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    name: document.name,
    email: document.email,
    role: document.role,
    status: document.status,
    runtimeStatus: document.runtimeStatus ?? "READY",
    activeSessionId: document.activeSessionId?.toHexString() ?? null,
    skills: document.skills,
    personaId: document.personaId?.toHexString() ?? null,
    voiceProvider: document.voiceProvider ?? "NONE",
    voiceId: document.voiceId ?? "",
    knowledgeBaseIds: document.knowledgeBaseIds.map((id) => id.toHexString()),
    prompt: document.prompt ?? "",
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapAgentPersonaWorkspace(document: AgentPersonaWorkspaceMongoDocument): AgentPersonaWorkspace {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    name: document.name,
    role: document.role,
    systemPrompt: document.systemPrompt,
    tone: document.tone,
    goals: document.goals,
    constraints: document.constraints,
    isDefault: document.isDefault,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapAgentSkillWorkspace(document: AgentSkillWorkspaceMongoDocument): AgentSkillWorkspace {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    agentId: document.agentId.toHexString(),
    skill: document.skill,
    level: document.level,
    certified: document.certified,
    active: document.active,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export function mapAgentAvailabilityWorkspace(document: AgentAvailabilityWorkspaceMongoDocument): AgentAvailabilityWorkspace {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    agentId: document.agentId.toHexString(),
    status: document.status,
    statusReason: document.statusReason,
    capacity: document.capacity,
    activeSessionCount: document.activeSessionCount,
    schedule: document.schedule,
    updatedAt: document.updatedAt,
  };
}

export function mapAgentPerformanceWorkspace(document: AgentPerformanceWorkspaceMongoDocument): AgentPerformanceWorkspace {
  return {
    id: document._id.toString(),
    organizationId: document.organizationId.toHexString(),
    agentId: document.agentId.toHexString(),
    callsHandled: document.callsHandled,
    averageDuration: document.averageDuration,
    averageQaScore: document.averageQaScore,
    averageSentiment: document.averageSentiment,
    transfers: document.transfers,
    conversions: document.conversions,
    leadQuality: document.leadQuality,
    computedAt: document.computedAt,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}
