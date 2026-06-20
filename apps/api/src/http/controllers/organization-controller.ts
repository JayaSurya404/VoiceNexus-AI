import type { Request, Response } from "express";
import type { CreateOrganizationPayload } from "@voicenexus/contracts";

import type { OrganizationService } from "../../application/services/organization-service.js";
import { AppError } from "../../shared/app-error.js";

export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  list = async (request: Request, response: Response): Promise<void> => {
    const organizations = await this.organizationService.list(this.actor(request));
    response.status(200).json({ data: organizations, requestId: request.requestId });
  };

  create = async (request: Request, response: Response): Promise<void> => {
    const organization = await this.organizationService.create(
      this.actor(request),
      request.validatedBody as CreateOrganizationPayload,
    );
    response.status(201).json({ data: organization, requestId: request.requestId });
  };

  getById = async (request: Request, response: Response): Promise<void> => {
    const organizationId = request.params.id;

    if (typeof organizationId !== "string") {
      throw AppError.badRequest("INVALID_ORGANIZATION_ID", "Organization id is required");
    }

    const organization = await this.organizationService.getById(
      this.actor(request),
      organizationId,
    );

    response.status(200).json({ data: organization, requestId: request.requestId });
  };

  private actor(request: Request) {
    if (!request.auth) {
      throw AppError.unauthorized();
    }

    return {
      userId: request.auth.userId,
      platformRole: request.auth.platformRole,
    };
  }
}
