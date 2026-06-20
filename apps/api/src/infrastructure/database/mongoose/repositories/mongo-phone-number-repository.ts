import type { PhoneNumberRepository } from "../../../../application/ports/repositories.js";
import type { NewPhoneNumber, PhoneNumber } from "../../../../domain/entities/phone-number.js";
import { PhoneNumberModel } from "../models/phone-number-model.js";
import { mapPhoneNumber } from "./mappers.js";

export class MongoPhoneNumberRepository implements PhoneNumberRepository {
  async create(input: NewPhoneNumber): Promise<PhoneNumber> {
    const document = await PhoneNumberModel.create(input);
    return mapPhoneNumber(document);
  }

  async findByPhoneNumber(phoneNumber: string): Promise<PhoneNumber | null> {
    const document = await PhoneNumberModel.findOne({ phoneNumber, status: "ACTIVE" }).exec();
    return document ? mapPhoneNumber(document) : null;
  }

  async findByOrganizationAndPhoneNumber(organizationId: string, phoneNumber: string): Promise<PhoneNumber | null> {
    const document = await PhoneNumberModel.findOne({ organizationId, phoneNumber, status: "ACTIVE" }).exec();
    return document ? mapPhoneNumber(document) : null;
  }

  async findDefaultForOrganization(organizationId: string): Promise<PhoneNumber | null> {
    const document = await PhoneNumberModel.findOne({ organizationId, status: "ACTIVE", "capabilities.voice": true })
      .sort({ createdAt: 1 })
      .exec();
    return document ? mapPhoneNumber(document) : null;
  }
}
