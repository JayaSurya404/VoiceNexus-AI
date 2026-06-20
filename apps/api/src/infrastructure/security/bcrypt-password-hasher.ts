import bcrypt from "bcrypt";

import type { PasswordHasher } from "../../application/ports/security.js";

export class BcryptPasswordHasher implements PasswordHasher {
  constructor(private readonly rounds: number) {}

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.rounds);
  }

  async compare(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }
}
