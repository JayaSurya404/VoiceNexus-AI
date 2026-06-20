import { Router } from "express";

import { CreateOrganizationInputSchema } from "@voicenexus/contracts";

import type { TokenService } from "../../application/ports/security.js";
import type { UserRepository } from "../../application/ports/repositories.js";
import type { OrganizationController } from "../controllers/organization-controller.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateBody } from "../middleware/validate-request.js";

export function createOrganizationRoutes(
  controller: OrganizationController,
  tokenService: TokenService,
  users: UserRepository,
): Router {
  const router = Router();
  const requireAuth = authenticate(tokenService, users);

  router.get("/", requireAuth, asyncHandler(controller.list));
  router.post("/", requireAuth, validateBody(CreateOrganizationInputSchema), asyncHandler(controller.create));
  router.get("/:id", requireAuth, asyncHandler(controller.getById));

  return router;
}
