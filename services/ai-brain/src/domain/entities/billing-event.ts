export type BillingEventType =
  | "INVOICE_CREATED"
  | "PAYMENT_SUCCEEDED"
  | "PAYMENT_FAILED"
  | "CREDIT_APPLIED"
  | "USAGE_CHARGED"
  | "BALANCE_UPDATED";

export interface BillingEvent {
  id: string;
  organizationId: string;
  billingAccountId: string | null;
  type: BillingEventType;
  amountCents: number;
  currency: string;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}
