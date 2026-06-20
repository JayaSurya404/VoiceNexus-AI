import { z } from "zod";

export const platformRoles = ["SUPER_ADMIN"] as const;
export const organizationRoles = ["OWNER", "MANAGER", "AGENT"] as const;

export const PlatformRoleSchema = z.enum(platformRoles);
export const OrganizationRoleSchema = z.enum(organizationRoles);

export type PlatformRole = z.infer<typeof PlatformRoleSchema>;
export type OrganizationRole = z.infer<typeof OrganizationRoleSchema>;

const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address")
  .max(254)
  .transform((email) => email.toLowerCase());

const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(128)
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number");

export const RegisterInputSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: emailSchema,
  password: passwordSchema,
  organizationName: z.string().trim().min(2).max(120),
});

export const LoginInputSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

export const RefreshInputSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

export const CreateOrganizationInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  timezone: z.string().trim().min(1).max(100).default("UTC"),
});

export type RegisterInput = z.input<typeof RegisterInputSchema>;
export type LoginInput = z.input<typeof LoginInputSchema>;
export type RefreshInput = z.input<typeof RefreshInputSchema>;
export type CreateOrganizationInput = z.input<typeof CreateOrganizationInputSchema>;
export type RegisterPayload = z.infer<typeof RegisterInputSchema>;
export type LoginPayload = z.infer<typeof LoginInputSchema>;
export type RefreshPayload = z.infer<typeof RefreshInputSchema>;
export type CreateOrganizationPayload = z.infer<typeof CreateOrganizationInputSchema>;

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  platformRole: PlatformRole | null;
  createdAt: string;
}

export interface OrganizationDto {
  id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "SUSPENDED";
  timezone: string;
  role: OrganizationRole | PlatformRole;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  user: UserDto;
  organizations: OrganizationDto[];
}

export interface ApiResponse<T> {
  data: T;
  requestId: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  requestId: string;
}
