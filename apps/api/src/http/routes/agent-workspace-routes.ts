import { Router } from "express";
import {
  CreateAgentInputSchema,
  CreateAgentPersonaInputSchema,
  CreateAgentSkillInputSchema,
  TestAgentInputSchema,
  UpdateAgentInputSchema,
  UpdateAgentPersonaInputSchema,
  UpdateAgentSkillInputSchema,
  UpsertAgentAvailabilityInputSchema,
} from "@voicenexus/contracts";

import type { UserRepository } from "../../application/ports/repositories.js";
import type { TokenService } from "../../application/ports/security.js";
import type { AgentWorkspaceController } from "../controllers/agent-workspace-controller.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateBody } from "../middleware/validate-request.js";

export function createAgentWorkspaceRoutes(
  controller: AgentWorkspaceController,
  tokenService: TokenService,
  users: UserRepository,
): Router {
  const router = Router();
  const requireAuth = authenticate(tokenService, users);

  router.get("/agents/dashboard", requireAuth, asyncHandler(controller.dashboard));
  router.get("/agents/personas", requireAuth, asyncHandler(controller.listPersonas));
  router.post("/agents/personas", requireAuth, validateBody(CreateAgentPersonaInputSchema), asyncHandler(controller.createPersona));
  router.patch("/agents/personas/:id", requireAuth, validateBody(UpdateAgentPersonaInputSchema), asyncHandler(controller.updatePersona));

  router.get("/agents/skills", requireAuth, asyncHandler(controller.listSkills));
  router.post("/agents/skills", requireAuth, validateBody(CreateAgentSkillInputSchema), asyncHandler(controller.createSkill));
  router.patch("/agents/skills/:id", requireAuth, validateBody(UpdateAgentSkillInputSchema), asyncHandler(controller.updateSkill));

  router.get("/agents/availability", requireAuth, asyncHandler(controller.listAvailability));
  router.post("/agents/availability", requireAuth, validateBody(UpsertAgentAvailabilityInputSchema), asyncHandler(controller.upsertAvailability));

  router.get("/agents/performance", requireAuth, asyncHandler(controller.listPerformance));
  router.post("/agents/test", requireAuth, validateBody(TestAgentInputSchema), asyncHandler(controller.testAgent));

  router.get("/agents", requireAuth, asyncHandler(controller.listAgents));
  router.post("/agents", requireAuth, validateBody(CreateAgentInputSchema), asyncHandler(controller.createAgent));
  router.get("/agents/:id", requireAuth, asyncHandler(controller.getAgent));
  router.patch("/agents/:id", requireAuth, validateBody(UpdateAgentInputSchema), asyncHandler(controller.updateAgent));
  router.delete("/agents/:id", requireAuth, asyncHandler(controller.deleteAgent));

  return router;
}
