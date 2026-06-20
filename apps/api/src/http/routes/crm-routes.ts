import { Router } from "express";
import {
  CreateActivityInputSchema,
  CreateContactInputSchema,
  CreateLeadInputSchema,
  CreateNoteInputSchema,
  CreateTagInputSchema,
  UpdateLeadInputSchema,
} from "@voicenexus/contracts";

import type { UserRepository } from "../../application/ports/repositories.js";
import type { TokenService } from "../../application/ports/security.js";
import type { CrmController } from "../controllers/crm-controller.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateBody } from "../middleware/validate-request.js";

export function createCrmRoutes(
  controller: CrmController,
  tokenService: TokenService,
  users: UserRepository,
): Router {
  const router = Router();
  const requireAuth = authenticate(tokenService, users);

  router.get("/leads", requireAuth, asyncHandler(controller.listLeads));
  router.post("/leads", requireAuth, validateBody(CreateLeadInputSchema), asyncHandler(controller.createLead));
  router.get("/leads/:id", requireAuth, asyncHandler(controller.getLeadById));
  router.patch("/leads/:id", requireAuth, validateBody(UpdateLeadInputSchema), asyncHandler(controller.updateLead));
  router.delete("/leads/:id", requireAuth, asyncHandler(controller.deleteLead));

  router.get("/contacts", requireAuth, asyncHandler(controller.listContacts));
  router.post(
    "/contacts",
    requireAuth,
    validateBody(CreateContactInputSchema),
    asyncHandler(controller.createContact),
  );

  router.get("/activities", requireAuth, asyncHandler(controller.listActivities));
  router.post(
    "/activities",
    requireAuth,
    validateBody(CreateActivityInputSchema),
    asyncHandler(controller.createActivity),
  );

  router.get("/notes", requireAuth, asyncHandler(controller.listNotes));
  router.post("/notes", requireAuth, validateBody(CreateNoteInputSchema), asyncHandler(controller.createNote));

  router.get("/tags", requireAuth, asyncHandler(controller.listTags));
  router.post("/tags", requireAuth, validateBody(CreateTagInputSchema), asyncHandler(controller.createTag));

  return router;
}
