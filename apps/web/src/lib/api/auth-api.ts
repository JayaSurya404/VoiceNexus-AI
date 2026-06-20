import type { AuthResponse, LoginInput, RegisterInput } from "@voicenexus/contracts";

import { apiFetch } from "./client";

export const authApi = {
  register(input: RegisterInput): Promise<AuthResponse> {
    return apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
      skipAuth: true,
      skipRefresh: true,
    });
  },

  login(input: LoginInput): Promise<AuthResponse> {
    return apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
      skipAuth: true,
      skipRefresh: true,
    });
  },

  logout(): Promise<void> {
    return apiFetch<void>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({}),
      skipRefresh: true,
    });
  },
};
