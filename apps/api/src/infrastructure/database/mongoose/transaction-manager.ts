import type { ClientSession } from "mongoose";
import mongoose from "mongoose";

import type { TransactionContext, TransactionManager } from "../../../application/ports/repositories.js";

export interface MongoTransactionContext extends TransactionContext {
  session: ClientSession;
}

export class MongoTransactionManager implements TransactionManager {
  async run<T>(work: (context: TransactionContext) => Promise<T>): Promise<T> {
    return mongoose.connection.transaction(async (session) => {
      const context: MongoTransactionContext = { session };
      return work(context);
    });
  }
}

export function sessionFromContext(context?: TransactionContext): ClientSession | undefined {
  return (context as MongoTransactionContext | undefined)?.session;
}
