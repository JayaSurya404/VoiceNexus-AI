import type { ApiErrorResponse, ApiResponse, AuthResponse } from "@voicenexus/contracts";

import { useAuthStore } from "@/store/auth-store";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface ApiFetchOptions extends RequestInit {
  skipAuth?: boolean;
  skipRefresh?: boolean;
}

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

let refreshPromise: Promise<AuthResponse> | null = null;

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const response = await performRequest(path, options);

  if (response.status === 401 && !options.skipRefresh) {
    await refreshSession();
    const retryResponse = await performRequest(path, options);
    return parseResponse<T>(retryResponse);
  }

  return parseResponse<T>(response);
}

export async function refreshSession(): Promise<AuthResponse> {
  if (!refreshPromise) {
    refreshPromise = performRequest("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({}),
      skipAuth: true,
      skipRefresh: true,
    })
      .then((response) => parseResponse<AuthResponse>(response))
      .then((session) => {
        useAuthStore.getState().setSession(session);
        return session;
      })
      .catch((error) => {
        useAuthStore.getState().clearSession();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function performRequest(path: string, options: ApiFetchOptions): Promise<Response> {
  const headers = new Headers(options.headers);

  if (options.body && !(options.body instanceof FormData) && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const accessToken = useAuthStore.getState().accessToken;

  if (!options.skipAuth && accessToken) {
    headers.set("authorization", `Bearer ${accessToken}`);
  }

  return fetch(`${apiBaseUrl}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json()) as ApiResponse<T> | ApiErrorResponse;

  if (!response.ok) {
    const errorPayload = payload as ApiErrorResponse;
    throw new ApiClientError(
      response.status,
      errorPayload.error.code,
      errorPayload.error.message,
      errorPayload.requestId,
    );
  }

  return (payload as ApiResponse<T>).data;
}
