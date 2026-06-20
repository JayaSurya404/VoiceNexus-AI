import { Router } from "express";
import { z } from "zod";
import {
  CreateConversationMemoryInputSchema,
  CreateCustomerMemoryInputSchema,
  CreateCustomerPreferenceInputSchema,
  CreateTimelineEventInputSchema,
} from "@voicenexus/contracts";

import type { UserRepository } from "../../application/ports/repositories.js";
import type { TokenService } from "../../application/ports/security.js";
import type { MemoryController } from "../controllers/memory-controller.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateBody } from "../middleware/validate-request.js";

const CreateMemoryInputSchema = z.union([
  CreateCustomerMemoryInputSchema,
  CreateConversationMemoryInputSchema,
]);

export function createMemoryRoutes(
  controller: MemoryController,
  tokenService: TokenService,
  users: UserRepository,
): Router {
  const router = Router();
  const requireAuth = authenticate(tokenService, users);

  router.get("/memories", requireAuth, asyncHandler(controller.listMemories));
  router.post("/memories", requireAuth, validateBody(CreateMemoryInputSchema), asyncHandler(controller.createMemory));
  router.get("/memories/:leadId", requireAuth, asyncHandler(controller.getMemoryByLead));

  router.get("/timeline/:leadId", requireAuth, asyncHandler(controller.getTimelineByLead));
  router.post(
    "/timeline",
    requireAuth,
    validateBody(CreateTimelineEventInputSchema),
    asyncHandler(controller.createTimelineEvent),
  );

  router.get("/preferences/:leadId", requireAuth, asyncHandler(controller.getPreferencesByLead));
  router.post(
    "/preferences",
    requireAuth,
    validateBody(CreateCustomerPreferenceInputSchema),
    asyncHandler(controller.upsertPreferences),
  );

  return router;
}
