# VoiceNexus Call Blocker Report

## Objective

Stop phase work and make the first real Twilio phone call work end to end:

Twilio phone call -> AI Brain voice webhook -> Twilio Media Stream -> Realtime Gateway websocket -> Deepgram STT -> Redis transcript event -> AI Brain LLM response -> Redis voice response event -> Realtime Gateway TTS -> Twilio media playback -> caller hears AI.

## Root Cause Found

The immediate failure that produces Twilio's "An application error has occurred. Goodbye." is at Media Stream websocket authentication.

Realtime Gateway verifies media stream tokens as:

```text
base64url(payload).hmac_sha256_base64url(payload, MEDIA_STREAM_SECRET)
```

AI Brain was generating a JWT-like token:

```text
header.payload.signature
```

and previously used `MEDIA_STREAM_TOKEN_SECRET` or `JWT_SECRET` instead of the Realtime Gateway's required `MEDIA_STREAM_SECRET`.

Result: Twilio received TwiML, tried to connect the stream, Realtime Gateway rejected the websocket with an invalid token, and Twilio ended the call.

## Stage Status

| Stage | Status | Notes |
| --- | --- | --- |
| Twilio reaches `/twilio/voice/webhook` | PASS | Confirmed by current runtime behavior. Added debug logs in AI Brain webhook. |
| AI Brain returns TwiML | PASS | TwiML returns `<Connect><Stream>`. |
| TwiML targets Realtime Gateway host | PASS | Uses `REALTIME_GATEWAY_PUBLIC_URL`, falling back to previous host logic. |
| TwiML includes media stream token | PASS after fix | Token now generated when `organizationId`, `callSessionId`, and `MEDIA_STREAM_SECRET` exist. |
| Token format matches Realtime Gateway verifier | PASS after fix | AI Brain now signs `payload.signature` exactly as Realtime Gateway verifies. |
| Realtime Gateway websocket upgrade | UNVERIFIED | Added `[twilio-ws] upgrade received` logging. |
| Media stream token validation | UNVERIFIED | Added `[media-stream-token]` verification, malformed, invalid, expired, and success logs. |
| Twilio `connected` / `start` events reach gateway | UNVERIFIED | Added websocket message logs and stream start logs. |
| Audio frames arrive | UNVERIFIED | Added media payload byte logs in websocket and gateway service. |
| Deepgram stream creation | UNVERIFIED | Added `[transcription]` and `[deepgram] start requested` logs. |
| Deepgram receives audio | UNVERIFIED | Added audio forwarding and Deepgram send logs. |
| Transcript persistence | UNVERIFIED | Existing Mongo persistence is present. Added persisted/published transcript logs. |
| `transcript.final` Redis event | UNVERIFIED | Existing publish path is present. Added publish logs. |
| AI Brain receives transcript | UNVERIFIED | Existing subscriber starts at AI Brain startup. Added receipt logs. |
| AI Brain generates response | UNVERIFIED | Existing runtime path is present. Added response generation logs. |
| AI Brain publishes voice response request | UNVERIFIED | Existing Redis publish path is present. Added publish logs. |
| Realtime Gateway consumes voice response request | UNVERIFIED | Existing subscriber starts at gateway startup. Added receive logs. |
| TTS generation | PASS after fix for OpenAI | OpenAI TTS now outputs 8 kHz G.711 mulaw payload for Twilio playback. ElevenLabs/Cartesia still return MP3 and should not be used for first call. |
| Audio playback to Twilio | UNVERIFIED | Existing websocket media send is present. Added connection, streamSid, and playback logs. |
| Call cleanup | UNVERIFIED | Existing `stop` and socket close paths clean active call state and stop Deepgram. Added call-ending logs. |
| Metrics/status persistence | UNVERIFIED | Existing repositories and lifecycle events exist, but first real call must verify records. |

## Fixes Implemented

1. AI Brain media stream token generation now matches Realtime Gateway validation.

File: `services/ai-brain/src/application/services/twilio-integration-service.ts`

Token format:

```text
<base64url-json-payload>.<hmac-sha256-base64url-signature>
```

Claims:

```json
{
  "organizationId": "...",
  "callSessionId": "...",
  "providerCallSid": "...",
  "exp": 1234567890
}
```

2. AI Brain config now requires/loads `MEDIA_STREAM_SECRET`.

File: `services/ai-brain/src/config/infrastructure-config.ts`

This must match `services/realtime-gateway/.env` exactly.

3. AI runtime no longer drops live-call transcripts just because `callSessionId` is not a Mongo `ObjectId`.

File: `services/ai-brain/src/application/services/agent-runtime-service.ts`

Before this fix, realtime call session IDs could be ignored before LLM generation.

4. OpenAI TTS output is now Twilio Media Stream compatible.

File: `services/realtime-gateway/src/providers/openai-tts-provider.ts`

OpenAI TTS now requests PCM, downsamples 24 kHz PCM to 8 kHz, converts to G.711 mulaw, and sends `audio/x-mulaw;rate=8000` payloads.

5. Temporary debug logging was added through the call path.

Files:

```text
services/ai-brain/src/http/ai-brain-http-server.ts
services/ai-brain/src/application/services/twilio-integration-service.ts
services/ai-brain/src/infrastructure/redis/transcript-final-subscriber.ts
services/ai-brain/src/application/services/agent-runtime-service.ts
services/ai-brain/src/application/services/voice-response-request-service.ts
services/realtime-gateway/src/security/media-stream-token-service.ts
services/realtime-gateway/src/http/realtime-http-server.ts
services/realtime-gateway/src/application/services/realtime-gateway-service.ts
services/realtime-gateway/src/application/services/realtime-transcription-service.ts
services/realtime-gateway/src/infrastructure/deepgram/deepgram-stream-manager.ts
services/realtime-gateway/src/application/services/transcript-persistence-service.ts
services/realtime-gateway/src/application/services/voice-response-event-subscriber.ts
services/realtime-gateway/src/application/services/voice-response-service.ts
services/realtime-gateway/src/application/services/audio-playback-service.ts
```

## Required Environment Variables

AI Brain:

```text
AI_BRAIN_PORT=4002
MONGODB_URI=...
REDIS_URL=...
JWT_ACCESS_SECRET=...
OPENAI_API_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
TWILIO_VOICE_WEBHOOK_URL=https://<ai-brain-public-host>/twilio/voice/webhook
REALTIME_GATEWAY_PUBLIC_URL=https://<realtime-gateway-public-host>
TWILIO_DEFAULT_ORGANIZATION_ID=<existing organization id>
MEDIA_STREAM_SECRET=<same 32+ char secret as realtime gateway>
```

Realtime Gateway:

```text
REALTIME_GATEWAY_PORT=4001
MONGODB_URI=...
REDIS_URL=...
MEDIA_STREAM_SECRET=<same 32+ char secret as ai-brain>
DEEPGRAM_API_KEY=...
OPENAI_API_KEY=...
OPENAI_TTS_MODEL=gpt-4o-mini-tts
TTS_PROVIDER=openai
JWT_ACCESS_SECRET=...
FRONTEND_URL=http://localhost:3000
```

For the first call, use `TTS_PROVIDER=openai`. ElevenLabs and Cartesia providers currently return MP3 and are not the safe path for Twilio bidirectional media playback.

## Required Twilio Configuration

Twilio phone number Voice webhook:

```text
POST https://<ai-brain-public-host>/twilio/voice/webhook
```

For inbound calls where no query params are configured, AI Brain uses:

```text
TWILIO_DEFAULT_ORGANIZATION_ID
```

Outbound calls created through AI Brain append `organizationId` and `conversationId` to the webhook URL automatically.

## Required Tunnel/Public URL Configuration

AI Brain tunnel:

```text
https://<ai-brain-public-host> -> localhost:4002
```

Realtime Gateway tunnel:

```text
https://<realtime-gateway-public-host> -> localhost:4001
```

Set:

```text
TWILIO_VOICE_WEBHOOK_URL=https://<ai-brain-public-host>/twilio/voice/webhook
REALTIME_GATEWAY_PUBLIC_URL=https://<realtime-gateway-public-host>
```

The generated websocket URL should look like:

```text
wss://<realtime-gateway-public-host>/realtime/twilio?token=<payload.signature>
```

## Test Procedure

1. Start MongoDB and Redis.
2. Start Realtime Gateway.
3. Start AI Brain.
4. Confirm AI Brain logs:

```text
[ai-brain] Subscribed to transcript.final
```

5. Place an inbound Twilio call to the configured phone number.
6. Confirm AI Brain logs:

```text
[twilio] voice webhook received
[twilio] voice webhook runtime context
[twilio] media stream twiml
tokenPresent: true
```

7. Confirm Realtime Gateway logs:

```text
[twilio-ws] upgrade received
[media-stream-token] verified
[twilio-ws] authenticated
[realtime-call] stream started
```

8. Speak into the phone and confirm:

```text
[realtime-call] media frame forwarded
[transcription] forwarding Twilio audio
[deepgram] transcript received
[transcript] published
```

9. Confirm AI Brain receives and responds:

```text
[ai-brain] transcript.final received
[ai-runtime] processing transcript
[ai-runtime] response generated
[voice-response-request] publishing
```

10. Confirm Realtime Gateway TTS/playback:

```text
[voice-response-subscriber] received
[voice-response] tts generated
[audio-playback] sending media
```

11. Caller should hear the AI response.
12. Hang up and confirm:

```text
[realtime-call] ending call
[transcription] stopping Deepgram stream
[audio-playback] connection unregistered
```

## Current Assessment

The immediate Twilio goodbye failure should be fixed by matching the media stream token format and secret.

The next likely failure point, if the websocket now connects but the caller still hears no response, is downstream and will be visible in logs:

```text
No [deepgram] transcript received -> Deepgram/audio ingress issue.
No [ai-brain] transcript.final received -> Redis pub/sub or AI Brain subscriber issue.
No [ai-runtime] response generated -> LLM/runtime issue.
No [audio-playback] sending media -> TTS/playback/streamSid issue.
```
