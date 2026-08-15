import { describe, it, expect } from "vitest";
import { generateCodename } from "@/lib/codename";

describe("generateCodename", () => {
  it("returns a non-empty string", () => {
    expect(generateCodename()).toBeTruthy();
  });

  it("returns a PascalCase string with no spaces or special characters", () => {
    const codename = generateCodename();
    expect(codename).toMatch(/^[A-Z][a-zA-Z]+$/);
  });

  it("generates different codenames on subsequent calls", () => {
    const codenames = new Set(
      Array.from({ length: 20 }, () => generateCodename()),
    );
    expect(codenames.size).toBeGreaterThan(1);
  });
});
