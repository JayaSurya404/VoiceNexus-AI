import { Router } from "express";
import {
  CreateWhatsappAutomationInputSchema,
  CreateWhatsappBroadcastInputSchema,
  CreateWhatsappContactInputSchema,
  CreateWhatsappConversationInputSchema,
  CreateWhatsappTemplateInputSchema,
  SendWhatsappMessageInputSchema,
  UpdateWhatsappContactInputSchema,
  UpdateWhatsappConversationInputSchema,
} from "@voicenexus/contracts";

import type { UserRepository } from "../../application/ports/repositories.js";
import type { TokenService } from "../../application/ports/security.js";
import type { WhatsappController } from "../controllers/whatsapp-controller.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateBody } from "../middleware/validate-request.js";

export function createWhatsappRoutes(
  controller: WhatsappController,
  tokenService: TokenService,
  users: UserRepository,
): Router {
  const router = Router();
  const requireAuth = authenticate(tokenService, users);

  router.get("/whatsapp/dashboard", requireAuth, asyncHandler(controller.dashboard));
  router.get("/whatsapp/contacts", requireAuth, asyncHandler(controller.listContacts));
  router.post(
    "/whatsapp/contacts",
    requireAuth,
    validateBody(CreateWhatsappContactInputSchema),
    asyncHandler(controller.createContact),
  );
  router.patch(
    "/whatsapp/contacts/:id",
    requireAuth,
    validateBody(UpdateWhatsappContactInputSchema),
    asyncHandler(controller.updateContact),
  );

  router.get("/whatsapp/conversations", requireAuth, asyncHandler(controller.listConversations));
  router.post(
    "/whatsapp/conversations",
    requireAuth,
    validateBody(CreateWhatsappConversationInputSchema),
    asyncHandler(controller.createConversation),
  );
  router.get("/whatsapp/conversations/:id", requireAuth, asyncHandler(controller.getConversation));
  router.patch(
    "/whatsapp/conversations/:id",
    requireAuth,
    validateBody(UpdateWhatsappConversationInputSchema),
    asyncHandler(controller.updateConversation),
  );
  router.post(
    "/whatsapp/messages",
    requireAuth,
    validateBody(SendWhatsappMessageInputSchema),
    asyncHandler(controller.sendMessage),
  );

  router.get("/whatsapp/templates", requireAuth, asyncHandler(controller.listTemplates));
  router.post(
    "/whatsapp/templates",
    requireAuth,
    validateBody(CreateWhatsappTemplateInputSchema),
    asyncHandler(controller.createTemplate),
  );

  router.get("/whatsapp/broadcasts", requireAuth, asyncHandler(controller.listBroadcasts));
  router.post(
    "/whatsapp/broadcasts",
    requireAuth,
    validateBody(CreateWhatsappBroadcastInputSchema),
    asyncHandler(controller.createBroadcast),
  );

  router.get("/whatsapp/automations", requireAuth, asyncHandler(controller.listAutomations));
  router.post(
    "/whatsapp/automations",
    requireAuth,
    validateBody(CreateWhatsappAutomationInputSchema),
    asyncHandler(controller.createAutomation),
  );

  return router;
}
