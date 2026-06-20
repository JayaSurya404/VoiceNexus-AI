import type { PlatformRole } from "@voicenexus/contracts";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      auth?: {
        userId: string;
        email: string;
        platformRole: PlatformRole | null;
      };
      validatedBody?: unknown;
    }
  }
}

export {};
