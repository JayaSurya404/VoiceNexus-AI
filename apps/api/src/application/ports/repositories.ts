import type {
  NewOrganizationMember,
  OrganizationMember,
} from "../../domain/entities/organization-member.js";
import type {
  NewOrganization,
  Organization,
} from "../../domain/entities/organization.js";
import type {
  NewRefreshSession,
  RefreshSession,
} from "../../domain/entities/refresh-session.js";
import type { Activity, NewActivity } from "../../domain/entities/activity.js";
import type { CallEvent, NewCallEvent } from "../../domain/entities/call-event.js";
import type { NewCallRecording, CallRecording } from "../../domain/entities/call-recording.js";
import type {
  CallSession,
  CallSessionListQuery,
  CallSessionUpdate,
  NewCallSession,
} from "../../domain/entities/call-session.js";
import type { CallTransfer, NewCallTransfer } from "../../domain/entities/call-transfer.js";
import type { Contact, NewContact } from "../../domain/entities/contact.js";
import type {
  CustomerMemory,
  NewCustomerMemory,
} from "../../domain/entities/customer-memory.js";
import type {
  CustomerPreference,
  NewCustomerPreference,
} from "../../domain/entities/customer-preference.js";
import type {
  ConversationMemory,
  NewConversationMemory,
} from "../../domain/entities/conversation-memory.js";
import type { Lead, LeadListQuery, LeadUpdate, NewLead } from "../../domain/entities/lead.js";
import type { MemoryTag, NewMemoryTag } from "../../domain/entities/memory-tag.js";
import type { NewNote, Note } from "../../domain/entities/note.js";
import type { NewPhoneNumber, PhoneNumber } from "../../domain/entities/phone-number.js";
import type { NewTag, Tag } from "../../domain/entities/tag.js";
import type { NewTimelineEvent, TimelineEvent } from "../../domain/entities/timeline-event.js";
import type { NewUser, User } from "../../domain/entities/user.js";

export type TransactionContext = object;

export interface TransactionManager {
  run<T>(work: (context: TransactionContext) => Promise<T>): Promise<T>;
}

export interface UserRepository {
  create(input: NewUser, context?: TransactionContext): Promise<User>;
  existsByEmail(email: string): Promise<boolean>;
  findByEmailWithPassword(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  updateLastLogin(id: string, at: Date): Promise<void>;
}

export interface OrganizationRepository {
  create(input: NewOrganization, context?: TransactionContext): Promise<Organization>;
  existsBySlug(slug: string): Promise<boolean>;
  findById(id: string): Promise<Organization | null>;
  findByIds(ids: string[]): Promise<Organization[]>;
  listAll(): Promise<Organization[]>;
}

export interface OrganizationMemberRepository {
  create(
    input: NewOrganizationMember,
    context?: TransactionContext,
  ): Promise<OrganizationMember>;
  findByUser(userId: string): Promise<OrganizationMember[]>;
  findByUserAndOrganization(
    userId: string,
    organizationId: string,
  ): Promise<OrganizationMember | null>;
}

export interface RefreshSessionRepository {
  create(input: NewRefreshSession): Promise<RefreshSession>;
  consumeForRotation(
    tokenId: string,
    tokenHash: string,
    replacedByTokenId: string,
    now: Date,
  ): Promise<RefreshSession | null>;
  findByTokenId(tokenId: string): Promise<RefreshSession | null>;
  revokeByTokenId(tokenId: string, at: Date): Promise<void>;
  revokeFamily(familyId: string, at: Date): Promise<void>;
}

export interface LeadRepository {
  create(input: NewLead, context?: TransactionContext): Promise<Lead>;
  list(query: LeadListQuery): Promise<Lead[]>;
  findByIdForOrganization(id: string, organizationId: string): Promise<Lead | null>;
  updateForOrganization(
    id: string,
    organizationId: string,
    input: LeadUpdate,
    context?: TransactionContext,
  ): Promise<Lead | null>;
  deleteForOrganization(id: string, organizationId: string): Promise<boolean>;
  touchLastActivity(id: string, organizationId: string, at: Date): Promise<void>;
  incrementNotesCount(id: string, organizationId: string, at: Date): Promise<void>;
}

export interface ContactRepository {
  create(input: NewContact, context?: TransactionContext): Promise<Contact>;
  listByOrganization(organizationId: string): Promise<Contact[]>;
}

export interface ActivityRepository {
  create(input: NewActivity, context?: TransactionContext): Promise<Activity>;
  listByOrganization(organizationId: string, leadId?: string): Promise<Activity[]>;
}

export interface NoteRepository {
  create(input: NewNote, context?: TransactionContext): Promise<Note>;
  listByOrganization(organizationId: string, leadId?: string): Promise<Note[]>;
}

export interface TagRepository {
  create(input: NewTag, context?: TransactionContext): Promise<Tag>;
  listByOrganization(organizationId: string): Promise<Tag[]>;
  findByIdsForOrganization(ids: string[], organizationId: string): Promise<Tag[]>;
}

export interface CustomerMemoryRepository {
  upsert(input: NewCustomerMemory): Promise<CustomerMemory>;
  listByOrganization(organizationId: string): Promise<CustomerMemory[]>;
  findByLead(organizationId: string, leadId: string): Promise<CustomerMemory | null>;
}

export interface ConversationMemoryRepository {
  create(input: NewConversationMemory): Promise<ConversationMemory>;
  listByLead(organizationId: string, leadId: string): Promise<ConversationMemory[]>;
  listImportantByOrganization(organizationId: string): Promise<ConversationMemory[]>;
}

export interface TimelineEventRepository {
  create(input: NewTimelineEvent): Promise<TimelineEvent>;
  listByLead(organizationId: string, leadId: string): Promise<TimelineEvent[]>;
}

export interface CustomerPreferenceRepository {
  upsert(input: NewCustomerPreference): Promise<CustomerPreference>;
  findByLead(organizationId: string, leadId: string): Promise<CustomerPreference | null>;
}

export interface MemoryTagRepository {
  create(input: NewMemoryTag): Promise<MemoryTag>;
  listByOrganization(organizationId: string): Promise<MemoryTag[]>;
  findByIdsForOrganization(ids: string[], organizationId: string): Promise<MemoryTag[]>;
}

export interface PhoneNumberRepository {
  create(input: NewPhoneNumber): Promise<PhoneNumber>;
  findByPhoneNumber(phoneNumber: string): Promise<PhoneNumber | null>;
  findByOrganizationAndPhoneNumber(organizationId: string, phoneNumber: string): Promise<PhoneNumber | null>;
  findDefaultForOrganization(organizationId: string): Promise<PhoneNumber | null>;
}

export interface CallSessionRepository {
  create(input: NewCallSession): Promise<CallSession>;
  list(query: CallSessionListQuery): Promise<CallSession[]>;
  findByIdForOrganization(id: string, organizationId: string): Promise<CallSession | null>;
  findByProviderCallSid(providerCallSid: string): Promise<CallSession | null>;
  updateForOrganization(
    id: string,
    organizationId: string,
    input: CallSessionUpdate,
  ): Promise<CallSession | null>;
  updateByProviderCallSid(providerCallSid: string, input: CallSessionUpdate): Promise<CallSession | null>;
}

export interface CallEventRepository {
  create(input: NewCallEvent): Promise<CallEvent>;
  listByCallSession(organizationId: string, callSessionId: string): Promise<CallEvent[]>;
}

export interface CallRecordingRepository {
  upsert(input: NewCallRecording): Promise<CallRecording>;
  listByCallSession(organizationId: string, callSessionId: string): Promise<CallRecording[]>;
}

export interface CallTransferRepository {
  create(input: NewCallTransfer): Promise<CallTransfer>;
  listByCallSession(organizationId: string, callSessionId: string): Promise<CallTransfer[]>;
}
