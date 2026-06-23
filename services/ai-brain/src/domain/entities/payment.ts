export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";

export interface Payment {
  id: string;
  organizationId: string;
  billingAccountId: string;
  invoiceId: string | null;
  status: PaymentStatus;
  amountCents: number;
  currency: string;
  provider: string | null;
  providerPaymentId: string | null;
  failureReason: string | null;
  paidAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
