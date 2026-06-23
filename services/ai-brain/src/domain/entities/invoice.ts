export type InvoiceStatus = "DRAFT" | "OPEN" | "PAID" | "VOID" | "UNCOLLECTIBLE";

export interface InvoiceLineItem {
  label: string;
  quantity: number;
  unitAmountCents: number;
  amountCents: number;
}

export interface Invoice {
  id: string;
  organizationId: string;
  billingAccountId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  currency: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  balanceDueCents: number;
  issuedAt: Date;
  dueAt: Date | null;
  paidAt: Date | null;
  lineItems: InvoiceLineItem[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
