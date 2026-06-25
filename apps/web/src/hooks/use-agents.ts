"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateAgentInput,
  CreateAgentPersonaInput,
  CreateAgentSkillInput,
  TestAgentInput,
  UpdateAgentInput,
  UpdateAgentPersonaInput,
  UpdateAgentSkillInput,
  UpsertAgentAvailabilityInput,
} from "@voicenexus/contracts";

import { agentsApi, type AgentListParams } from "@/lib/api/agents-api";

export const agentKeys = {
  dashboard: (organizationId: string) => ["agents", "dashboard", organizationId] as const,
  list: (params: AgentListParams) => ["agents", "list", params] as const,
  details: (organizationId: string, id: string) => ["agents", "details", organizationId, id] as const,
  personas: (organizationId: string) => ["agents", "personas", organizationId] as const,
  skills: (organizationId: string, agentId?: string) => ["agents", "skills", organizationId, agentId ?? "all"] as const,
  availability: (organizationId: string) => ["agents", "availability", organizationId] as const,
  performance: (organizationId: string) => ["agents", "performance", organizationId] as const,
};

export function useAgentDashboard(organizationId: string | null) {
  return useQuery({ queryKey: agentKeys.dashboard(organizationId ?? ""), queryFn: () => agentsApi.dashboard(organizationId ?? ""), enabled: Boolean(organizationId) });
}

export function useAgents(params: AgentListParams, enabled = true) {
  return useQuery({ queryKey: agentKeys.list(params), queryFn: () => agentsApi.list(params), enabled: enabled && Boolean(params.organizationId) });
}

export function useAgentDetails(organizationId: string | null, id: string) {
  return useQuery({ queryKey: agentKeys.details(organizationId ?? "", id), queryFn: () => agentsApi.details(id, organizationId ?? ""), enabled: Boolean(organizationId && id) });
}

export function useAgentPersonas(organizationId: string | null) {
  return useQuery({ queryKey: agentKeys.personas(organizationId ?? ""), queryFn: () => agentsApi.personas(organizationId ?? ""), enabled: Boolean(organizationId) });
}

export function useAgentSkills(organizationId: string | null, agentId?: string) {
  return useQuery({ queryKey: agentKeys.skills(organizationId ?? "", agentId), queryFn: () => agentsApi.skills(organizationId ?? "", agentId), enabled: Boolean(organizationId) });
}

export function useAgentAvailability(organizationId: string | null) {
  return useQuery({ queryKey: agentKeys.availability(organizationId ?? ""), queryFn: () => agentsApi.availability(organizationId ?? ""), enabled: Boolean(organizationId) });
}

export function useAgentPerformance(organizationId: string | null) {
  return useQuery({ queryKey: agentKeys.performance(organizationId ?? ""), queryFn: () => agentsApi.performance(organizationId ?? ""), enabled: Boolean(organizationId) });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (input: CreateAgentInput) => agentsApi.create(input), onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["agents"] }) });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, input }: { id: string; input: UpdateAgentInput }) => agentsApi.update(id, input), onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["agents"] }) });
}

export function useCreateAgentPersona() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (input: CreateAgentPersonaInput) => agentsApi.createPersona(input), onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["agents", "personas"] }) });
}

export function useUpdateAgentPersona() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, input }: { id: string; input: UpdateAgentPersonaInput }) => agentsApi.updatePersona(id, input), onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["agents", "personas"] }) });
}

export function useCreateAgentSkill() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (input: CreateAgentSkillInput) => agentsApi.createSkill(input), onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["agents"] }) });
}

export function useUpdateAgentSkill() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, input }: { id: string; input: UpdateAgentSkillInput }) => agentsApi.updateSkill(id, input), onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["agents"] }) });
}

export function useUpsertAgentAvailability() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (input: UpsertAgentAvailabilityInput) => agentsApi.upsertAvailability(input), onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["agents"] }) });
}

export function useTestAgent() {
  return useMutation({ mutationFn: (input: TestAgentInput) => agentsApi.test(input) });
}
