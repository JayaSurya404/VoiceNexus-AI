import { describe, expect, it } from "vitest";

import { hasPermission } from "./permissions.js";

describe("role permissions", () => {
  it("allows super admins to perform platform-level work", () => {
    expect(hasPermission("SUPER_ADMIN", null, "organization:delete")).toBe(true);
  });

  it("allows owners to manage members", () => {
    expect(hasPermission(null, "OWNER", "member:manage")).toBe(true);
  });

  it("does not allow agents to manage campaigns", () => {
    expect(hasPermission(null, "AGENT", "campaign:manage")).toBe(false);
  });
});
