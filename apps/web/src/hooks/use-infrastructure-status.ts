"use client";

import { useQuery } from "@tanstack/react-query";

import { aiBrainApi } from "@/lib/api/ai-brain-api";

export const infrastructureKeys = {
  status: (organizationId: string) => ["ai-brain", "infrastructure-status", organizationId] as const,
  providers: (organizationId: string) => ["ai-brain", "provider-statuses", organizationId] as const,
  environment: (organizationId: string) => ["ai-brain", "environment-readiness", organizationId] as const
};

export function useInfrastructureStatus(organizationId: string) {
  return useQuery({
    queryKey: infrastructureKeys.status(organizationId),
    queryFn: () => aiBrainApi.infrastructureStatus(organizationId),
    enabled: Boolean(organizationId)
  });
}

export function useProviderStatuses(organizationId: string) {
  return useQuery({
    queryKey: infrastructureKeys.providers(organizationId),
    queryFn: () => aiBrainApi.providerStatuses(organizationId),
    enabled: Boolean(organizationId)
  });
}

export function useEnvironmentReadiness(organizationId: string) {
  return useQuery({
    queryKey: infrastructureKeys.environment(organizationId),
    queryFn: () => aiBrainApi.environmentReadiness(organizationId),
    enabled: Boolean(organizationId)
  });
}
