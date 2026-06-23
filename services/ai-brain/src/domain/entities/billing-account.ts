export interface BillingAccount {
  id: string;
  organizationId: string;
  billingEmail: string;
  currency: string;
  balanceCents: number;
  creditCents: number;
  paymentProvider: string | null;
  providerCustomerId: string | null;
  taxId: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
