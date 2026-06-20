import type { TransactionContext, UserRepository } from "../../../../application/ports/repositories.js";
import type { NewUser, User } from "../../../../domain/entities/user.js";
import { UserModel } from "../models/user-model.js";
import { sessionFromContext } from "../transaction-manager.js";
import { mapUser } from "./mappers.js";

export class MongoUserRepository implements UserRepository {
  async create(input: NewUser, context?: TransactionContext): Promise<User> {
    const [document] = await UserModel.create([input], { session: sessionFromContext(context) });

    if (!document) {
      throw new Error("User creation did not return a document");
    }

    return mapUser(document);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const document = await UserModel.exists({ email });
    return Boolean(document);
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    const document = await UserModel.findOne({ email }).select("+passwordHash").exec();
    return document ? mapUser(document) : null;
  }

  async findById(id: string): Promise<User | null> {
    const document = await UserModel.findById(id).select("+passwordHash").exec();
    return document ? mapUser(document) : null;
  }

  async updateLastLogin(id: string, at: Date): Promise<void> {
    await UserModel.updateOne({ _id: id }, { $set: { lastLoginAt: at } }).exec();
  }
}
