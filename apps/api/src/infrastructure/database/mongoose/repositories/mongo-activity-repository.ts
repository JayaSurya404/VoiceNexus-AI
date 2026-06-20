import type { ActivityRepository, TransactionContext } from "../../../../application/ports/repositories.js";
import type { Activity, NewActivity } from "../../../../domain/entities/activity.js";
import { ActivityModel } from "../models/activity-model.js";
import { sessionFromContext } from "../transaction-manager.js";
import { mapActivity } from "./mappers.js";

export class MongoActivityRepository implements ActivityRepository {
  async create(input: NewActivity, context?: TransactionContext): Promise<Activity> {
    const [document] = await ActivityModel.create([input], { session: sessionFromContext(context) });

    if (!document) {
      throw new Error("Activity creation did not return a document");
    }

    return mapActivity(document);
  }

  async listByOrganization(organizationId: string, leadId?: string): Promise<Activity[]> {
    const documents = await ActivityModel.find({
      organizationId,
      ...(leadId ? { leadId } : {}),
    })
      .sort({ createdAt: -1 })
      .exec();
    return documents.map(mapActivity);
  }
}
