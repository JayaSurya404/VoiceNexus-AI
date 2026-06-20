"use client";

import type { AuthResponse, OrganizationDto, UserDto } from "@voicenexus/contracts";
import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  activeOrganizationId: string | null;
  hydrated: boolean;
  organizations: OrganizationDto[];
  user: UserDto | null;
  clearSession: () => void;
  markHydrated: () => void;
  setActiveOrganizationId: (organizationId: string) => void;
  setOrganizations: (organizations: OrganizationDto[]) => void;
  setSession: (session: AuthResponse) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  activeOrganizationId: null,
  hydrated: false,
  organizations: [],
  user: null,

  clearSession: () =>
    set({
      accessToken: null,
      activeOrganizationId: null,
      organizations: [],
      user: null,
    }),

  markHydrated: () => set({ hydrated: true }),

  setActiveOrganizationId: (organizationId) => set({ activeOrganizationId: organizationId }),

  setOrganizations: (organizations) =>
    set({
      organizations,
      activeOrganizationId:
        get().activeOrganizationId ?? organizations.at(0)?.id ?? null,
    }),

  setSession: (session) =>
    set((state) => ({
      accessToken: session.accessToken,
      activeOrganizationId:
        state.activeOrganizationId ?? session.organizations.at(0)?.id ?? null,
      organizations: session.organizations,
      user: session.user,
    })),
}));
