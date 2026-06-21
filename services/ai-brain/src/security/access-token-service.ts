import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import type { OrganizationAccessRepository } from "../application/ports.js";
import { AiBrainError } from "../shared/errors.js";

interface AccessTokenPayload {
  sub: string;
  type: "access";
}

export class AccessTokenService {
  constructor(private readonly organizationAccess: OrganizationAccessRepository) {}

  async ensureOrganizationAccess(token: string, organizationId: string): Promise<string> {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;

    if (payload.type !== "access" || !payload.sub) {
      throw AiBrainError.unauthorized();
    }

    const hasAccess = await this.organizationAccess.userHasAccess(payload.sub, organizationId);

    if (!hasAccess) {
      throw AiBrainError.forbidden();
    }

    return payload.sub;
  }
}
