import { describe, expect, it } from "vitest";
import { MAX_SOURCE_MATERIAL_CHARS, truncateSourceMaterial } from "@/lib/file-extract";

describe("truncateSourceMaterial", () => {
  it("returns short text unchanged and reports no truncation", () => {
    const result = truncateSourceMaterial("  Zibbo is a classroom tortoise.  ");
    expect(result).toEqual({ text: "Zibbo is a classroom tortoise.", truncated: false });
  });

  it("truncates text over the cap and reports truncation", () => {
    const result = truncateSourceMaterial("x".repeat(MAX_SOURCE_MATERIAL_CHARS + 500));
    expect(result.text).toHaveLength(MAX_SOURCE_MATERIAL_CHARS);
    expect(result.truncated).toBe(true);
  });

  it("treats text exactly at the cap as not truncated", () => {
    const result = truncateSourceMaterial("x".repeat(MAX_SOURCE_MATERIAL_CHARS));
    expect(result.truncated).toBe(false);
  });
});
