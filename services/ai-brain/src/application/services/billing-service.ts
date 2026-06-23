import type { BillingAccount } from "../../domain/entities/billing-account.js";
import type { BillingEvent } from "../../domain/entities/billing-event.js";
import type { BillingAccountRepository, BillingEventRepository, InvoiceRepository, PaymentRepository } from "../ports.js";

export interface BillingOverview {
  account: BillingAccount | null;
  balanceCents: number;
  creditCents: number;
  invoiceTotalCents: number;
  paymentTotalCents: number;
  recentEvents: BillingEvent[];
}

export class BillingService {
  constructor(
    private readonly accounts: BillingAccountRepository,
    private readonly events: BillingEventRepository,
    private readonly invoices: InvoiceRepository,
    private readonly payments: PaymentRepository,
  ) {}

  async overview(organizationId: string): Promise<BillingOverview> {
    const [account, events, invoices, payments] = await Promise.all([
      this.accounts.findByOrganization(organizationId),
      this.events.listByOrganization(organizationId),
      this.invoices.listByOrganization(organizationId),
      this.payments.listByOrganization(organizationId),
    ]);

    return {
      account,
      balanceCents: account?.balanceCents ?? 0,
      creditCents: account?.creditCents ?? 0,
      invoiceTotalCents: invoices.reduce((sum, invoice) => sum + invoice.totalCents, 0),
      paymentTotalCents: payments.reduce((sum, payment) => sum + payment.amountCents, 0),
      recentEvents: events.slice(0, 10),
    };
  }
}
