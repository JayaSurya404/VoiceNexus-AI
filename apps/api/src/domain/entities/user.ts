import type { PlatformRole } from "@voicenexus/contracts";

export type UserStatus = "ACTIVE" | "SUSPENDED";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  platformRole: PlatformRole | null;
  status: UserStatus;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewUser {
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  platformRole: PlatformRole | null;
  status: UserStatus;
}
