import type { Request, Response } from "express";
import type { LoginPayload, RefreshPayload, RegisterPayload } from "@voicenexus/contracts";

import type { AuthService } from "../../application/services/auth-service.js";
import { clearRefreshCookie, refreshCookieName, setRefreshCookie } from "../cookies.js";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (request: Request, response: Response): Promise<void> => {
    const result = await this.authService.register(bodyAs<RegisterPayload>(request), this.clientContext(request));

    setRefreshCookie(response, result.refreshToken);

    response.status(201).json({ data: result.response, requestId: request.requestId });
  };

  login = async (request: Request, response: Response): Promise<void> => {
    const result = await this.authService.login(bodyAs<LoginPayload>(request), this.clientContext(request));

    setRefreshCookie(response, result.refreshToken);

    response.status(200).json({ data: result.response, requestId: request.requestId });
  };

  refresh = async (request: Request, response: Response): Promise<void> => {
    const refreshToken = this.refreshTokenFromRequest(request);

    const result = await this.authService.refresh(
      { refreshToken },
      this.clientContext(request),
    );

    setRefreshCookie(response, result.refreshToken);

    response.status(200).json({ data: result.response, requestId: request.requestId });
  };

  logout = async (request: Request, response: Response): Promise<void> => {
    const refreshToken = this.refreshTokenFromRequest(request);

    await this.authService.logout(refreshToken);
    clearRefreshCookie(response);

    response.status(204).send();
  };

  private clientContext(request: Request) {
    return {
      ipAddress: request.ip ?? null,
      userAgent: request.header("user-agent") ?? null,
    };
  }

  private refreshTokenFromRequest(request: Request): string | undefined {
    const body = bodyAs<RefreshPayload>(request);

    if (typeof body.refreshToken === "string") {
      return body.refreshToken;
    }

    const cookies = request.cookies as unknown as Record<string, string | undefined>;

    return cookies[refreshCookieName];
  }
}

function bodyAs<T>(request: Request): T {
  return request.validatedBody as T;
}
