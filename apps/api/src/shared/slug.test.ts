import { describe, expect, it } from "vitest";

import { slugify, uniqueSlug } from "./slug.js";

describe("slug utilities", () => {
  it("normalizes human-readable names", () => {
    expect(slugify("VoiceNexus AI, Inc.")).toBe("voicenexus-ai-inc");
  });

  it("generates a unique suffix when a slug already exists", async () => {
    const existing = new Set(["acme", "acme-2"]);

    const slug = await uniqueSlug(
      "Acme",
      (candidate) => Promise.resolve(existing.has(candidate)),
      () => "abc-123",
    );

    expect(slug).toBe("acme-3");
  });
});
