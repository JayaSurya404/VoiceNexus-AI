import type { Invoice } from "../../domain/entities/invoice.js";
import type { InvoiceRepository } from "../ports.js";

export class InvoiceService {
  constructor(private readonly invoices: InvoiceRepository) {}

  async list(organizationId: string): Promise<Invoice[]> {
    return this.invoices.listByOrganization(organizationId);
  }
}
