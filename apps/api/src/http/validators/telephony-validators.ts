import {
  CreateOutboundCallInputSchema,
  ListCallsQuerySchema,
  OrganizationScopedQuerySchema,
  TransferCallInputSchema,
} from "@voicenexus/contracts";

export const OutboundCallBodySchema = CreateOutboundCallInputSchema;
export const TransferCallBodySchema = TransferCallInputSchema;
export const CallsQuerySchema = ListCallsQuerySchema;
export const CallOrganizationQuerySchema = OrganizationScopedQuerySchema;
