# AI Phone Pipeline Integration Report

Date: 2026-06-25

Scope: full integration audit from dashboard action to Twilio media playback, CRM, memory, analytics, and dashboard read models. Architecture was preserved.

## Stage Status

| Stage | Status | Evidence |
| --- | --- | --- |
| Frontend | Complete | Dashboard pages and hooks call API, AI Brain, and Realtime Gateway using `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_AI_BRAIN_URL`, and `NEXT_PUBLIC_REALTIME_GATEWAY_URL`. |
| API | Complete | `POST /calls/outbound` creates CRM call sessions and invokes Twilio through `TelephonyService`. |
| API -> AI Brain webhook handoff | Complete | API now passes outbound Twilio `Url` to AI Brain via `AI_BRAIN_PUBLIC_URL` or `AI_VOICE_WEBHOOK_URL`, including `organizationId`, `leadId`, `apiCallSessionId`, `conversationId`, and direction. |
| AI Brain | Complete | AI Brain owns runtime sessions, provider selection, transcript processing, memory/context injection, response generation, workflow actions, and voice response requests. |
| Twilio REST API | Complete | API and AI Brain both have Twilio call initiation paths. API keeps CRM status/recording callbacks; AI Brain supports runtime-native outbound calls. |
| Twilio Voice Webhook | Complete | AI Brain handles `/twilio/voice/webhook`, validates Twilio signatures, ensures runtime sessions, and returns XML. |
| TwiML | Complete | AI Brain generates `<Response><Connect><Stream>` with a signed `wss://.../realtime/twilio` URL and stream parameters. |
| Media Stream | Complete | Twilio receives a tokenized Realtime Gateway stream URL generated from `REALTIME_GATEWAY_PUBLIC_URL`. |
| Realtime Gateway | Complete | Realtime Gateway accepts HTTP health/dashboard requests and Twilio WebSocket upgrades. |
| WebSocket Authentication | Complete | Realtime verifies HMAC media stream tokens with `MEDIA_STREAM_SECRET`, validates org/session claims, and rejects mismatches. |
| Deepgram STT | Complete | Realtime forwards Twilio mu-law frames to Deepgram and persists/publishes transcript events. |
| Transcript Streaming | Complete | Final transcripts publish to Redis topic `transcript.final`; partial transcripts publish to `transcript.partial`. |
| Groq LLM | Complete when configured | `GROQ_API_KEY` and provider runtime config enable Groq. Provider fallback also supports OpenAI/Gemini. Manual API key required. |
| Conversation Memory | Complete | Runtime context builder and memory injection use CRM/memory data; transcript processing creates AI conversation/messages/decisions and requests CRM/memory updates through existing services. |
| Runtime Session | Complete | AI Brain creates `callruntimesessions`; API-originated calls now preserve API call and lead ids in runtime metadata. |
| TTS Provider | Complete | OpenAI, ElevenLabs, and Cartesia now return Twilio-compatible 8 kHz mu-law audio payloads for media stream playback. Manual provider key required. |
| Twilio Media Playback | Complete | Realtime `AudioPlaybackService` sends `media` and `mark` frames on the active Twilio WebSocket. |
| CRM Updates | Complete | API call status/recording callbacks update call sessions, events, activities, timelines, and conversation memories. Runtime metadata links AI processing back to the API CRM call where available. |
| Memory Updates | Complete | API and AI Brain memory services persist customer and conversation memory; demo seed populates both. |
| Analytics Updates | Complete | AI Brain analytics repositories/services and seeded analytics collections populate runtime, queue, KPI, revenue, and performance dashboards. |
| Dashboard Updates | Complete | Web dashboards read API, AI Brain, and Realtime Gateway endpoints; seeded data populates demo views. |

## Implemented During This Pass

- API outbound calls now use AI Brain voice webhook when `AI_BRAIN_PUBLIC_URL` or `AI_VOICE_WEBHOOK_URL` is configured.
- API passes `apiCallSessionId`, `leadId`, and `conversationId` into AI Brain webhook query params.
- AI Brain includes `apiCallSessionId` and `leadId` in Twilio stream parameters.
- AI Brain validates Twilio webhook signatures on voice and status endpoints.
- AI Brain runtime reads runtime metadata to recover CRM call id and lead id when the Realtime session id differs from the API call id.
- ElevenLabs and Cartesia TTS providers now request Twilio-compatible mu-law output instead of MP3.
- Root env examples were sanitized and updated.
- Idempotent demo data seeder was added at `tools/seed-demo-data.mjs`.
- Deterministic setup guide was added at `docs/operations/ai-phone-pipeline-runbook.md`.

## Remaining Manual Configuration

No source-code integration gap remains for the audited path. A real phone call still requires manual external configuration:

- MongoDB URI.
- Redis URL.
- Twilio account SID, auth token, and voice-capable phone number.
- Public HTTPS URLs for API, AI Brain, and Realtime Gateway.
- Twilio phone-number webhook configuration.
- Deepgram API key.
- Groq/OpenAI/Gemini keys according to selected runtime provider.
- TTS provider key for `TTS_PROVIDER`.
- Matching `MEDIA_STREAM_SECRET` in AI Brain and Realtime Gateway.
- Matching JWT access settings in API, AI Brain, and Realtime Gateway.

## Successful Call Flow

1. User starts an outbound call in the web app.
2. Web calls API `POST /calls/outbound`.
3. API creates a call session, then calls Twilio REST with AI Brain as the voice webhook.
4. Twilio requests AI Brain `/twilio/voice/webhook`.
5. AI Brain validates the signature, creates/ensures a runtime session, signs a media stream token, and returns TwiML.
6. Twilio opens `wss://<realtime>/realtime/twilio?token=...`.
7. Realtime verifies the token, creates realtime call state, and starts Deepgram.
8. Caller audio is forwarded to Deepgram.
9. Final transcripts publish to Redis.
10. AI Brain processes transcript, builds memory/context/RAG prompt, calls the selected LLM provider, and publishes a voice response request.
11. Realtime synthesizes TTS as 8 kHz mu-law audio and sends media frames to Twilio.
12. API status/recording callbacks update CRM call records; AI Brain and API memory/analytics records update dashboard state.
