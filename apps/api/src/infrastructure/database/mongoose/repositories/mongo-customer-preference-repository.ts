import type { CustomerPreferenceRepository } from "../../../../application/ports/repositories.js";
import type {
  CustomerPreference,
  NewCustomerPreference,
} from "../../../../domain/entities/customer-preference.js";
import { CustomerPreferenceModel } from "../models/customer-preference-model.js";
import { mapCustomerPreference } from "./mappers.js";

export class MongoCustomerPreferenceRepository implements CustomerPreferenceRepository {
  async upsert(input: NewCustomerPreference): Promise<CustomerPreference> {
    const document = await CustomerPreferenceModel.findOneAndUpdate(
      { organizationId: input.organizationId, leadId: input.leadId },
      { $set: input },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).exec();

    return mapCustomerPreference(document);
  }

  async findByLead(organizationId: string, leadId: string): Promise<CustomerPreference | null> {
    const document = await CustomerPreferenceModel.findOne({ organizationId, leadId }).exec();
    return document ? mapCustomerPreference(document) : null;
  }
}
