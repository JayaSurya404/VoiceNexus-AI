import type { Payment } from "../../domain/entities/payment.js";
import type { PaymentRepository } from "../ports.js";

export class PaymentService {
  constructor(private readonly payments: PaymentRepository) {}

  async list(organizationId: string): Promise<Payment[]> {
    return this.payments.listByOrganization(organizationId);
  }
}
