import type { CookieOptions, Response } from "express";

import { env } from "../config/env.js";

export const refreshCookieName = "vn_refresh";

export function refreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: "lax",
    path: "/auth",
    maxAge: env.REFRESH_TOKEN_TTL_SECONDS * 1000,
  };
}

export function setRefreshCookie(response: Response, refreshToken: string): void {
  response.cookie(refreshCookieName, refreshToken, refreshCookieOptions());
}

export function clearRefreshCookie(response: Response): void {
  response.clearCookie(refreshCookieName, {
    ...refreshCookieOptions(),
    maxAge: undefined,
  });
}
