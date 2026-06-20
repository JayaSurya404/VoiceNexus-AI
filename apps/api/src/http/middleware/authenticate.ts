import type { NextFunction, Request, Response } from "express";

import type { TokenService } from "../../application/ports/security.js";
import type { UserRepository } from "../../application/ports/repositories.js";
import { AppError } from "../../shared/app-error.js";

export function authenticate(tokenService: TokenService, users: UserRepository) {
  return async (request: Request, _response: Response, next: NextFunction): Promise<void> => {
    try {
      const authorization = request.header("authorization");

      if (!authorization?.startsWith("Bearer ")) {
        throw AppError.unauthorized();
      }

      const token = authorization.slice("Bearer ".length).trim();
      const claims = tokenService.verifyAccessToken(token);
      const user = await users.findById(claims.userId);

      if (!user || user.status !== "ACTIVE") {
        throw AppError.unauthorized("User account is no longer active");
      }

      request.auth = {
        userId: user.id,
        email: user.email,
        platformRole: user.platformRole,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
}
