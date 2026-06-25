# VoiceNexus AI Phone Pipeline Runbook

This runbook documents the current production-ready wiring without changing the architecture. The call path is:

Frontend -> API -> AI Brain -> Twilio REST API -> Twilio Voice Webhook -> TwiML -> Twilio Media Stream -> Realtime Gateway -> WebSocket auth -> Deepgram STT -> AI Brain runtime -> Groq/OpenAI/Gemini LLM -> Memory/CRM/Analytics -> TTS -> Twilio media playback -> Dashboards.

## Services

Start these from the repo root:

```powershell
pnpm.cmd install --store-dir D:\.pnpm-store
pnpm.cmd --filter @voicenexus/contracts build
pnpm.cmd --filter @voicenexus/api dev
pnpm.cmd --filter @voicenexus/ai-brain dev
pnpm.cmd --filter @voicenexus/realtime-gateway dev
pnpm.cmd --filter @voicenexus/automation-worker dev
pnpm.cmd --filter @voicenexus/web dev
```

Local ports:

| Service | Port | Health URL |
| --- | --- | --- |
| Web | 3000 | `http://localhost:3000` |
| API | 4000 | `http://localhost:4000/health` |
| Realtime Gateway | 4001 | `http://localhost:4001/health` |
| AI Brain | 4002 | `http://localhost:4002/health` |
| Worker | no HTTP port | terminal logs |

## Shared Values

These values must match across services:

| Value | Must match in |
| --- | --- |
| `MONGODB_URI` | API, AI Brain, Realtime Gateway, Worker, demo seeder |
| `JWT_ACCESS_SECRET` | API, AI Brain, Realtime Gateway |
| `JWT_ISSUER` | API, Realtime Gateway |
| `JWT_AUDIENCE` | API, Realtime Gateway |
| `REDIS_URL` | AI Brain, Realtime Gateway |
| `MEDIA_STREAM_SECRET` | AI Brain, Realtime Gateway |
| `FRONTEND_URL` | API, AI Brain, Realtime Gateway |

Generate `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `MEDIA_STREAM_SECRET` as separate random strings of at least 32 characters. `MEDIA_STREAM_SECRET` must be identical in AI Brain and Realtime Gateway because AI Brain signs the Twilio stream token and Realtime verifies it.

## Environment Variables

### API: `apps/api/.env`

Required:

- `MONGODB_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `FRONTEND_URL`
- `API_PUBLIC_URL`
- `AI_BRAIN_PUBLIC_URL` or `AI_VOICE_WEBHOOK_URL`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

Defaults/optional:

- `PORT=4000`
- `MONGODB_DB_NAME=voicenexus`
- `JWT_ISSUER=voicenexus-api`
- `JWT_AUDIENCE=voicenexus-web`
- `ACCESS_TOKEN_TTL_SECONDS=900`
- `REFRESH_TOKEN_TTL_SECONDS=604800`
- `BCRYPT_ROUNDS=12`
- `COOKIE_SECURE=false` locally, `true` behind HTTPS
- `TRUST_PROXY=1`

`AI_VOICE_WEBHOOK_URL` overrides the generated AI Brain webhook URL. If it is blank, API uses `${AI_BRAIN_PUBLIC_URL}/twilio/voice/webhook`.

### AI Brain: `services/ai-brain/.env`

Required:

- `AI_BRAIN_PORT=4002`
- `FRONTEND_URL`
- `MONGODB_URI`
- `REDIS_URL`
- `JWT_ACCESS_SECRET`
- `OPENAI_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `TWILIO_VOICE_WEBHOOK_URL`
- `TWILIO_DEFAULT_ORGANIZATION_ID`
- `REALTIME_GATEWAY_PUBLIC_URL`
- `MEDIA_STREAM_SECRET`

LLM providers:

- `OPENAI_MODEL=gpt-4o`
- `GROQ_API_KEY` for Groq response generation/fallback
- `GROQ_MODEL=llama-3.1-8b-instant`
- `GEMINI_API_KEY` and `GEMINI_MODEL` if Gemini fallback is wanted

### Realtime Gateway: `services/realtime-gateway/.env`

Required:

- `REALTIME_GATEWAY_PORT=4001`
- `FRONTEND_URL`
- `MONGODB_URI`
- `REDIS_URL`
- `MEDIA_STREAM_SECRET`
- `DEEPGRAM_API_KEY`
- `JWT_ACCESS_SECRET`

TTS:

- `TTS_PROVIDER=openai`, `elevenlabs`, or `cartesia`
- OpenAI TTS: `OPENAI_API_KEY`, `OPENAI_TTS_MODEL=gpt-4o-mini-tts`
- ElevenLabs TTS: `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`
- Cartesia TTS: `CARTESIA_API_KEY`, `CARTESIA_VOICE_ID`

### Web: `apps/web/.env.local`

- `NEXT_PUBLIC_API_URL=http://localhost:4000`
- `NEXT_PUBLIC_REALTIME_GATEWAY_URL=http://localhost:4001`
- `NEXT_PUBLIC_AI_BRAIN_URL=http://localhost:4002`

Use public Render URLs in deployed environments.

### Worker: `services/automation-worker/.env`

- `MONGODB_URI`
- `WORKER_ID=automation-worker-local`
- `WORKER_POLL_INTERVAL_MS=60000`
- `WORKER_BATCH_SIZE=100`
- `WORKER_MAX_RETRIES=5`

## Demo Data

Run after `MONGODB_URI` is configured:

```powershell
$env:MONGODB_URI="mongodb+srv://..."
$env:MONGODB_DB_NAME="voicenexus"
pnpm.cmd seed:demo
```

The seeder is idempotent. It upserts one organization, users, leads, contacts, calls, runtime sessions, memories, AI personas, human agents, queues, WhatsApp conversations, analytics, reports, KPIs, revenue, and performance data.

Demo login:

- Email: `owner@acme-growth.example`
- Password: `VoiceNexusDemo!2026`

Demo organization id:

- `650000000000000000000001`

Use this value for `TWILIO_DEFAULT_ORGANIZATION_ID` when testing inbound Twilio calls against the demo org.

## Public URLs

Twilio cannot call `localhost`, and Twilio Media Streams require public `wss://`.

### Render

Deploy at least these services:

- API web service: `pnpm --filter @voicenexus/api start`, port `4000`
- AI Brain web service: `pnpm --filter @voicenexus/ai-brain start`, port `4002`
- Realtime Gateway web service: `pnpm --filter @voicenexus/realtime-gateway start`, port `4001`
- Worker background service: `pnpm --filter @voicenexus/automation-worker start`
- Web static/Next service: `pnpm --filter @voicenexus/web start`, port `3000`

Set:

- API `API_PUBLIC_URL=https://your-api.onrender.com`
- API `AI_BRAIN_PUBLIC_URL=https://your-ai-brain.onrender.com`
- AI Brain `TWILIO_VOICE_WEBHOOK_URL=https://your-ai-brain.onrender.com/twilio/voice/webhook`
- AI Brain `REALTIME_GATEWAY_PUBLIC_URL=https://your-realtime-gateway.onrender.com`
- Web public URLs to the Render service URLs

### Local With Cloudflare Tunnel

Use separate tunnels for AI Brain and Realtime Gateway if you are placing real calls locally:

```powershell
cloudflared tunnel --url http://localhost:4002
cloudflared tunnel --url http://localhost:4001
```

Then set:

- API `AI_BRAIN_PUBLIC_URL=https://<ai-brain-tunnel>`
- AI Brain `TWILIO_VOICE_WEBHOOK_URL=https://<ai-brain-tunnel>/twilio/voice/webhook`
- AI Brain `REALTIME_GATEWAY_PUBLIC_URL=https://<realtime-tunnel>`

The AI Brain TwiML generator converts `REALTIME_GATEWAY_PUBLIC_URL` into `wss://<realtime-host>/realtime/twilio`.

## Twilio Configuration

Outbound calls from the app:

- Frontend calls API `POST /calls/outbound`.
- API creates a CRM call session and calls Twilio REST.
- Twilio `Url` is AI Brain voice webhook with organization, lead, and API call ids in query params.
- API status callback remains `https://<api-public>/webhooks/twilio/status`.
- API recording callback remains `https://<api-public>/webhooks/twilio/recording`.

Inbound calls to a Twilio number:

- Voice webhook URL: `https://<ai-brain-public>/twilio/voice/webhook`
- Method: `POST`
- Status callback URL: `https://<ai-brain-public>/twilio/voice/status`
- Method: `POST`
- Fallback URL: configure a simple hosted fallback if available.

For inbound calls without query params, AI Brain uses `TWILIO_DEFAULT_ORGANIZATION_ID`.

## Expected Logs

API startup:

- `VoiceNexus API listening on port 4000`

AI Brain startup:

- `[ai-brain] Redis subscriber connected`
- `[ai-brain] Subscribed to transcript.final`
- `[ai-brain] HTTP server listening on 4002`

Realtime Gateway startup:

- `Realtime gateway listening on port 4001`

Twilio voice webhook:

- `[twilio] voice webhook received`
- `[twilio] voice webhook runtime context`
- `[twilio] media stream token generated`
- `[twilio] media stream twiml`

Realtime WebSocket:

- `[twilio-ws] upgrade received`
- `[media-stream-token] verified`
- `[twilio-ws] authenticated`
- `[realtime-call] stream started`

Deepgram:

- `[transcription] starting Deepgram stream`
- `[deepgram] Connected stream for call ...`
- `[deepgram] transcript received`
- `[transcript] published` with topic `transcript.final`

AI Brain runtime and LLM:

- `[ai-brain] transcript.final received`
- `[ai-runtime] processing transcript`
- `[ai-runtime] response generated`
- `[ai-runtime] voice response requested`

Realtime TTS/playback:

- `[voice-response-subscriber] received`
- `[voice-response] tts generated`
- `[audio-playback] sending media`
- `[voice-response] playback attempted` with `played: true`

Twilio Console:

- Call status transitions through queued/ringing/in-progress/completed.
- Media Stream connects to `wss://<realtime-host>/realtime/twilio?...token=...`.
- Debugger should show no TwiML parse errors and no webhook timeout errors.

## Manual Steps Still Required

- Provide real MongoDB, Redis, Twilio, Deepgram, LLM, and selected TTS API keys.
- Configure public HTTPS URLs through Render or tunnels.
- Set matching `MEDIA_STREAM_SECRET` in AI Brain and Realtime Gateway.
- Set matching JWT access settings across API, AI Brain, and Realtime Gateway.
- Configure Twilio phone-number webhooks for inbound calls.
- Use the seeded demo org id or create a real organization and configure that id as `TWILIO_DEFAULT_ORGANIZATION_ID`.
