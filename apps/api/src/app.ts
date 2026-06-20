import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";

import { env } from "./config/env.js";
import { createContainer } from "./container.js";
import { AuthController } from "./http/controllers/auth-controller.js";
import { CallController } from "./http/controllers/call-controller.js";
import { CrmController } from "./http/controllers/crm-controller.js";
import { MemoryController } from "./http/controllers/memory-controller.js";
import { OrganizationController } from "./http/controllers/organization-controller.js";
import { TwilioWebhookController } from "./http/controllers/twilio-webhook-controller.js";
import { errorHandler } from "./http/middleware/error-handler.js";
import { requestIdMiddleware } from "./http/middleware/request-id.js";
import { createAuthRoutes } from "./http/routes/auth-routes.js";
import { createCallRoutes } from "./http/routes/call-routes.js";
import { createCrmRoutes } from "./http/routes/crm-routes.js";
import { createMemoryRoutes } from "./http/routes/memory-routes.js";
import { createOrganizationRoutes } from "./http/routes/organization-routes.js";
import { createTwilioWebhookRoutes } from "./http/routes/twilio-webhook-routes.js";
import { AppError } from "./shared/app-error.js";

export function createApp() {
  const app = express();
  const container = createContainer();

  app.set("trust proxy", env.TRUST_PROXY);

  app.use(requestIdMiddleware);
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.use(compression());
  app.use(hpp());
  app.use(
    cors({
      credentials: true,
      origin(origin, callback) {
        if (!origin || origin === env.FRONTEND_URL) {
          callback(null, true);
          return;
        }

        callback(new AppError(403, "CORS_BLOCKED", "Origin is not allowed by CORS"));
      },
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));
  app.use(cookieParser());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: env.NODE_ENV === "test" ? 10_000 : 300,
      standardHeaders: "draft-7",
      legacyHeaders: false,
    }),
  );

  app.get("/health", (request, response) => {
    response.status(200).json({
      data: {
        status: "ok",
        service: "voicenexus-api",
        uptime: process.uptime(),
      },
      requestId: request.requestId,
    });
  });

  const authController = new AuthController(container.services.authService);
  const organizationController = new OrganizationController(container.services.organizationService);
  const crmController = new CrmController(container.services.crmService);
  const memoryController = new MemoryController(container.services.memoryService);
  const callController = new CallController(
    container.services.telephonyService,
    container.services.callSessionService,
  );
  const twilioWebhookController = new TwilioWebhookController(
    container.services.telephonyService,
    container.services.recordingService,
  );

  app.use("/auth", createAuthRoutes(authController));
  app.use(
    "/organizations",
    createOrganizationRoutes(
      organizationController,
      container.security.tokenService,
      container.repositories.users,
    ),
  );
  app.use(
    "/",
    createCrmRoutes(crmController, container.security.tokenService, container.repositories.users),
  );
  app.use(
    "/",
    createMemoryRoutes(memoryController, container.security.tokenService, container.repositories.users),
  );
  app.use(
    "/",
    createCallRoutes(callController, container.security.tokenService, container.repositories.users),
  );
  app.use("/", createTwilioWebhookRoutes(twilioWebhookController));

  app.use((_request, _response, next) => {
    next(AppError.notFound("Route"));
  });
  app.use(errorHandler);

  return app;
}
