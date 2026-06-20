import { Router } from "express";

import type { TwilioWebhookController } from "../controllers/twilio-webhook-controller.js";
import { asyncHandler } from "../middleware/async-handler.js";

export function createTwilioWebhookRoutes(controller: TwilioWebhookController): Router {
  const router = Router();

  router.post("/webhooks/twilio/voice", asyncHandler(controller.voice));
  router.post("/webhooks/twilio/status", asyncHandler(controller.status));
  router.post("/webhooks/twilio/recording", asyncHandler(controller.recording));

  return router;
}
