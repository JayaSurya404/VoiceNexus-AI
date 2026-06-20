import { Router } from "express";

import { LoginInputSchema, RefreshInputSchema, RegisterInputSchema } from "@voicenexus/contracts";

import type { AuthController } from "../controllers/auth-controller.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { validateBody } from "../middleware/validate-request.js";

export function createAuthRoutes(controller: AuthController): Router {
  const router = Router();

  router.post("/register", validateBody(RegisterInputSchema), asyncHandler(controller.register));
  router.post("/login", validateBody(LoginInputSchema), asyncHandler(controller.login));
  router.post("/refresh", validateBody(RefreshInputSchema), asyncHandler(controller.refresh));
  router.post("/logout", validateBody(RefreshInputSchema), asyncHandler(controller.logout));

  return router;
}
