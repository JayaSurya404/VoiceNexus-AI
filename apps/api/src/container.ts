import { AuthService } from "./application/services/auth-service.js";
import { CallSessionService } from "./application/services/call-session-service.js";
import { CrmService } from "./application/services/crm-service.js";
import { MemoryService } from "./application/services/memory-service.js";
import { OrganizationService } from "./application/services/organization-service.js";
import { RecordingService } from "./application/services/recording-service.js";
import { TelephonyService } from "./application/services/telephony-service.js";
import { env } from "./config/env.js";
import { MongoActivityRepository } from "./infrastructure/database/mongoose/repositories/mongo-activity-repository.js";
import { MongoCallEventRepository } from "./infrastructure/database/mongoose/repositories/mongo-call-event-repository.js";
import { MongoCallRecordingRepository } from "./infrastructure/database/mongoose/repositories/mongo-call-recording-repository.js";
import { MongoCallSessionRepository } from "./infrastructure/database/mongoose/repositories/mongo-call-session-repository.js";
import { MongoCallTransferRepository } from "./infrastructure/database/mongoose/repositories/mongo-call-transfer-repository.js";
import { MongoContactRepository } from "./infrastructure/database/mongoose/repositories/mongo-contact-repository.js";
import { MongoConversationMemoryRepository } from "./infrastructure/database/mongoose/repositories/mongo-conversation-memory-repository.js";
import { MongoCustomerMemoryRepository } from "./infrastructure/database/mongoose/repositories/mongo-customer-memory-repository.js";
import { MongoCustomerPreferenceRepository } from "./infrastructure/database/mongoose/repositories/mongo-customer-preference-repository.js";
import { MongoLeadRepository } from "./infrastructure/database/mongoose/repositories/mongo-lead-repository.js";
import { MongoMemoryTagRepository } from "./infrastructure/database/mongoose/repositories/mongo-memory-tag-repository.js";
import { MongoNoteRepository } from "./infrastructure/database/mongoose/repositories/mongo-note-repository.js";
import { MongoOrganizationMemberRepository } from "./infrastructure/database/mongoose/repositories/mongo-organization-member-repository.js";
import { MongoOrganizationRepository } from "./infrastructure/database/mongoose/repositories/mongo-organization-repository.js";
import { MongoPhoneNumberRepository } from "./infrastructure/database/mongoose/repositories/mongo-phone-number-repository.js";
import { MongoRefreshSessionRepository } from "./infrastructure/database/mongoose/repositories/mongo-refresh-session-repository.js";
import { MongoTagRepository } from "./infrastructure/database/mongoose/repositories/mongo-tag-repository.js";
import { MongoTimelineEventRepository } from "./infrastructure/database/mongoose/repositories/mongo-timeline-event-repository.js";
import { MongoUserRepository } from "./infrastructure/database/mongoose/repositories/mongo-user-repository.js";
import { MongoTransactionManager } from "./infrastructure/database/mongoose/transaction-manager.js";
import { BcryptPasswordHasher } from "./infrastructure/security/bcrypt-password-hasher.js";
import { JwtTokenService } from "./infrastructure/security/jwt-token-service.js";
import { ProviderFactory } from "./infrastructure/telephony/provider-factory.js";

export function createContainer() {
  const users = new MongoUserRepository();
  const organizations = new MongoOrganizationRepository();
  const members = new MongoOrganizationMemberRepository();
  const refreshSessions = new MongoRefreshSessionRepository();
  const leads = new MongoLeadRepository();
  const contacts = new MongoContactRepository();
  const activities = new MongoActivityRepository();
  const notes = new MongoNoteRepository();
  const tags = new MongoTagRepository();
  const customerMemories = new MongoCustomerMemoryRepository();
  const conversationMemories = new MongoConversationMemoryRepository();
  const timelineEvents = new MongoTimelineEventRepository();
  const customerPreferences = new MongoCustomerPreferenceRepository();
  const memoryTags = new MongoMemoryTagRepository();
  const phoneNumbers = new MongoPhoneNumberRepository();
  const callSessions = new MongoCallSessionRepository();
  const callEvents = new MongoCallEventRepository();
  const callRecordings = new MongoCallRecordingRepository();
  const callTransfers = new MongoCallTransferRepository();
  const transactionManager = new MongoTransactionManager();
  const passwordHasher = new BcryptPasswordHasher(env.BCRYPT_ROUNDS);
  const tokenService = new JwtTokenService({
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    accessTtlSeconds: env.ACCESS_TOKEN_TTL_SECONDS,
    refreshTtlSeconds: env.REFRESH_TOKEN_TTL_SECONDS,
  });
  const providerFactory = new ProviderFactory({
    twilioAccountSid: env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: env.TWILIO_AUTH_TOKEN,
  });

  const authService = new AuthService(
    users,
    organizations,
    members,
    refreshSessions,
    transactionManager,
    passwordHasher,
    tokenService,
  );
  const organizationService = new OrganizationService(organizations, members, transactionManager);
  const crmService = new CrmService(
    leads,
    contacts,
    activities,
    notes,
    tags,
    members,
    transactionManager,
  );
  const memoryService = new MemoryService(
    customerMemories,
    conversationMemories,
    timelineEvents,
    customerPreferences,
    memoryTags,
    leads,
    members,
  );
  const callSessionService = new CallSessionService(
    callSessions,
    callEvents,
    callRecordings,
    callTransfers,
    leads,
    tags,
    customerMemories,
    memoryTags,
    members,
  );
  const recordingService = new RecordingService(callSessions, callRecordings, callEvents);
  const telephonyService = new TelephonyService(
    callSessions,
    callEvents,
    callTransfers,
    phoneNumbers,
    leads,
    activities,
    timelineEvents,
    conversationMemories,
    members,
    providerFactory,
    {
      apiPublicUrl: env.API_PUBLIC_URL,
      twilioPhoneNumber: env.TWILIO_PHONE_NUMBER,
    },
  );

  return {
    repositories: {
      users,
      organizations,
      members,
      refreshSessions,
      leads,
      contacts,
      activities,
      notes,
      tags,
      customerMemories,
      conversationMemories,
      timelineEvents,
      customerPreferences,
      memoryTags,
      phoneNumbers,
      callSessions,
      callEvents,
      callRecordings,
      callTransfers,
    },
    services: {
      authService,
      organizationService,
      crmService,
      memoryService,
      callSessionService,
      recordingService,
      telephonyService,
    },
    security: {
      tokenService,
      passwordHasher,
    },
  };
}
