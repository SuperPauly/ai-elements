import {
  generateCodeExport,
  generateDesignSpec,
  iterateDesignSpec,
} from "../src/mcp/designer-tools";
import { DesignSpecSchema } from "../src/types/designer";

describe("designer tools", () => {
  it("generates a valid design spec", async () => {
    const spec = await generateDesignSpec({
      prompt: "Make a dark-mode crypto landing page",
    });

    expect(() => DesignSpecSchema.parse(spec)).not.toThrow();
    expect(spec.theme.colors.background).toBe("#0F172A");
    expect(
      spec.sections.some((section) => section.type === "hero")
    ).toBeTruthy();
  });

  it("iterates on the current design spec", async () => {
    const currentSpec = await generateDesignSpec({
      prompt: "Create a startup website",
    });

    const result = await iterateDesignSpec({
      currentSpec,
      prompt: "Make the primary color blue",
    });

    expect(result.spec.theme.colors.primary).toBe("#2563EB");
    expect(result.summary).toContain("Make the primary color blue");
  });

  it("exports code for the current design", async () => {
    const currentSpec = await generateDesignSpec({
      prompt: "Create a playful website",
    });

    const code = await generateCodeExport({ spec: currentSpec });

    expect(code).toContain("export default function Website");
    expect(code).toContain(currentSpec.theme.colors.background);
  });
});
