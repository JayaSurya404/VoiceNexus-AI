import { Router } from "express";

import type { UserRepository } from "../../application/ports/repositories.js";
import type { TokenService } from "../../application/ports/security.js";
import type { CallController } from "../controllers/call-controller.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateBody } from "../middleware/validate-request.js";
import { OutboundCallBodySchema, TransferCallBodySchema } from "../validators/telephony-validators.js";

export function createCallRoutes(
  controller: CallController,
  tokenService: TokenService,
  users: UserRepository,
): Router {
  const router = Router();
  const requireAuth = authenticate(tokenService, users);

  router.post(
    "/calls/outbound",
    requireAuth,
    validateBody(OutboundCallBodySchema),
    asyncHandler(controller.createOutboundCall),
  );
  router.post(
    "/calls/transfer",
    requireAuth,
    validateBody(TransferCallBodySchema),
    asyncHandler(controller.transferCall),
  );
  router.get("/calls", requireAuth, asyncHandler(controller.listCalls));
  router.get("/calls/:id/events", requireAuth, asyncHandler(controller.getCallEvents));
  router.get("/calls/:id", requireAuth, asyncHandler(controller.getCall));

  return router;
}
