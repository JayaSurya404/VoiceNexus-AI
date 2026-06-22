import { ActiveCallStateService } from "./application/services/active-call-state-service.js";
import { AgentTakeoverService } from "./application/services/agent-takeover-service.js";
import { AudioInterruptService } from "./application/services/audio-interrupt-service.js";
import { AudioBufferService } from "./application/services/audio-buffer-service.js";
import { AudioPlaybackService } from "./application/services/audio-playback-service.js";
import { BargeInService } from "./application/services/barge-in-service.js";
import { LatencyMetricsService } from "./application/services/latency-metrics-service.js";
import { PlaybackSessionService } from "./application/services/playback-session-service.js";
import { RealtimeConversationService } from "./application/services/realtime-conversation-service.js";
import { RealtimeGatewayService } from "./application/services/realtime-gateway-service.js";
import { RealtimeRuntimeEventSubscriber } from "./application/services/realtime-runtime-event-subscriber.js";
import { RealtimeTranscriptionService } from "./application/services/realtime-transcription-service.js";
import { SpeechStateService } from "./application/services/speech-state-service.js";
import { SupervisorWebSocketService } from "./application/services/supervisor-websocket-service.js";
import { TranscriptBufferService } from "./application/services/transcript-buffer-service.js";
import { TranscriptPersistenceService } from "./application/services/transcript-persistence-service.js";
import { TtsStreamService } from "./application/services/tts-stream-service.js";
import { TurnManagerService } from "./application/services/turn-manager-service.js";
import { VoiceResponseEventSubscriber } from "./application/services/voice-response-event-subscriber.js";
import { VoiceResponseService } from "./application/services/voice-response-service.js";
import { env } from "./config/env.js";
import { MongoAiConversationSessionRepository } from "./infrastructure/database/mongoose/repositories/mongo-ai-conversation-session-repository.js";
import { MongoOrganizationMemberAccessRepository } from "./infrastructure/database/mongoose/repositories/mongo-organization-member-access-repository.js";
import { MongoRealtimeTranscriptEventRepository } from "./infrastructure/database/mongoose/repositories/mongo-realtime-transcript-event-repository.js";
import {
  MongoBargeInEventRepository,
  MongoPlaybackSessionRepository,
  MongoRealtimeConversationRepository,
  MongoTurnEventRepository,
} from "./infrastructure/database/mongoose/repositories/mongo-realtime-runtime-repositories.js";
import { MongoVoiceResponseRepository } from "./infrastructure/database/mongoose/repositories/mongo-voice-response-repository.js";
import { DeepgramClient } from "./infrastructure/deepgram/deepgram-client.js";
import { DeepgramStreamManager } from "./infrastructure/deepgram/deepgram-stream-manager.js";
import { getRedisCommandClient } from "./infrastructure/redis/redis-client.js";
import { RedisEventBus } from "./infrastructure/redis/redis-event-bus.js";
import { createTtsProvider } from "./providers/tts-provider-factory.js";
import { AccessTokenService } from "./security/access-token-service.js";
import { MediaStreamTokenService } from "./security/media-stream-token-service.js";

export function createContainer() {
  const conversations = new MongoAiConversationSessionRepository();
  const transcripts = new MongoRealtimeTranscriptEventRepository();
  const voiceResponses = new MongoVoiceResponseRepository();
  const realtimeConversations = new MongoRealtimeConversationRepository();
  const turnEvents = new MongoTurnEventRepository();
  const bargeIns = new MongoBargeInEventRepository();
  const playbackSessions = new MongoPlaybackSessionRepository();
  const members = new MongoOrganizationMemberAccessRepository();
  const redis = getRedisCommandClient();
  const eventBus = new RedisEventBus();
  const activeCallStateService = new ActiveCallStateService(redis);
  const audioBufferService = new AudioBufferService();
  const audioPlaybackService = new AudioPlaybackService();
  const audioInterruptService = new AudioInterruptService(audioBufferService, audioPlaybackService);
  const realtimeConversationService = new RealtimeConversationService(realtimeConversations, eventBus);
  const speechStateService = new SpeechStateService(realtimeConversations, eventBus);
  const turnManagerService = new TurnManagerService(turnEvents, realtimeConversations, eventBus);
  const playbackSessionService = new PlaybackSessionService(playbackSessions, realtimeConversations, eventBus);
  const bargeInService = new BargeInService(
    bargeIns,
    playbackSessions,
    realtimeConversations,
    playbackSessionService,
    audioInterruptService,
    speechStateService,
    eventBus,
  );
  const agentTakeoverService = new AgentTakeoverService(realtimeConversations, audioInterruptService, eventBus);
  const latencyMetricsService = new LatencyMetricsService(
    realtimeConversations,
    turnEvents,
    playbackSessions,
    bargeIns,
    voiceResponses,
  );
  const transcriptBufferService = new TranscriptBufferService(redis, transcripts);
  const transcriptPersistenceService = new TranscriptPersistenceService(transcriptBufferService, transcripts, eventBus);
  const deepgramClient = new DeepgramClient(env.DEEPGRAM_API_KEY);
  const deepgramStreamManager = new DeepgramStreamManager(
    deepgramClient,
    transcriptPersistenceService,
    eventBus,
  );
  const realtimeTranscriptionService = new RealtimeTranscriptionService(deepgramStreamManager);
  const ttsStreamService = new TtsStreamService(createTtsProvider());
  const voiceResponseService = new VoiceResponseService(
    voiceResponses,
    ttsStreamService,
    audioBufferService,
    audioPlaybackService,
    eventBus,
  );
  const voiceResponseEventSubscriber = new VoiceResponseEventSubscriber(
    eventBus,
    voiceResponseService,
    agentTakeoverService,
  );
  const realtimeRuntimeEventSubscriber = new RealtimeRuntimeEventSubscriber(
    eventBus,
    realtimeConversationService,
    speechStateService,
    turnManagerService,
    bargeInService,
    playbackSessionService,
    voiceResponses,
  );
  const mediaStreamTokenService = new MediaStreamTokenService();
  const accessTokenService = new AccessTokenService(members);
  const realtimeGatewayService = new RealtimeGatewayService(
    activeCallStateService,
    conversations,
    eventBus,
    realtimeTranscriptionService,
  );
  const supervisorWebSocketService = new SupervisorWebSocketService(
    activeCallStateService,
    accessTokenService,
    eventBus,
  );

  return {
    repositories: {
      conversations,
      transcripts,
      voiceResponses,
      realtimeConversations,
      turnEvents,
      bargeIns,
      playbackSessions,
      members,
    },
    services: {
      activeCallStateService,
      audioBufferService,
      audioPlaybackService,
      audioInterruptService,
      realtimeConversationService,
      speechStateService,
      turnManagerService,
      playbackSessionService,
      bargeInService,
      agentTakeoverService,
      latencyMetricsService,
      transcriptBufferService,
      transcriptPersistenceService,
      realtimeTranscriptionService,
      mediaStreamTokenService,
      accessTokenService,
      realtimeGatewayService,
      supervisorWebSocketService,
      ttsStreamService,
      voiceResponseService,
      voiceResponseEventSubscriber,
      realtimeRuntimeEventSubscriber,
      eventBus,
    },
  };
}
