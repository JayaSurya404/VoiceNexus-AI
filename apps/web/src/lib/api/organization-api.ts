import type { CreateOrganizationInput, OrganizationDto } from "@voicenexus/contracts";

import { apiFetch } from "./client";

export const organizationApi = {
  list(): Promise<OrganizationDto[]> {
    return apiFetch<OrganizationDto[]>("/organizations");
  },

  create(input: CreateOrganizationInput): Promise<OrganizationDto> {
    return apiFetch<OrganizationDto>("/organizations", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  getById(id: string): Promise<OrganizationDto> {
    return apiFetch<OrganizationDto>(`/organizations/${id}`);
  },
};
