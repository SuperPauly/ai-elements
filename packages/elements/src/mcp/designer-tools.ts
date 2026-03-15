import { z } from "zod";

import type { DesignSpec } from "../types/designer";
import { DesignSpecSchema } from "../types/designer";

const COLOR_BY_NAME: Record<string, string> = {
  black: "#111827",
  blue: "#2563EB",
  cyan: "#0891B2",
  green: "#16A34A",
  orange: "#EA580C",
  pink: "#DB2777",
  purple: "#7C3AED",
  red: "#DC2626",
  white: "#FFFFFF",
  yellow: "#CA8A04",
};

const getColorFromPrompt = (prompt: string): string | undefined => {
  const lowered = prompt.toLowerCase();
  for (const [name, hex] of Object.entries(COLOR_BY_NAME)) {
    if (lowered.includes(name)) {
      return hex;
    }
  }

  return undefined;
};

const createBaseSpec = (prompt: string): DesignSpec => {
  const loweredPrompt = prompt.toLowerCase();
  const isDark = loweredPrompt.includes("dark");
  const isCrypto = loweredPrompt.includes("crypto");

  const primaryColor =
    getColorFromPrompt(prompt) ?? (isCrypto ? "#22C55E" : "#6366F1");

  return {
    intent: {
      styleKeywords: loweredPrompt.includes("playful")
        ? ["playful", "colorful"]
        : [isDark ? "dark" : "light", isCrypto ? "crypto" : "modern"],
      targetAudience: isCrypto ? "crypto traders" : "startup teams",
    },
    layout: [
      {
        id: "home",
        name: "Home",
        path: "/",
        sectionIds: ["hero-1", "features-1", "pricing-1", "footer-1"],
      },
    ],
    sections: [
      {
        ctaText: isCrypto ? "Start Trading" : "Get Started",
        id: "hero-1",
        subtitle: isCrypto
          ? "Secure, lightning-fast access to digital assets."
          : "Launch your next product with confidence.",
        title: isCrypto ? "Crypto Landing Page" : "Modern Product Website",
        type: "hero",
      },
      {
        id: "features-1",
        items: isCrypto
          ? ["Real-time analytics", "Cold-wallet security", "Instant swaps"]
          : ["Fast setup", "Reusable components", "Actionable insights"],
        title: "Features",
        type: "features",
      },
      {
        id: "pricing-1",
        tiers: [
          {
            description: "Great for trying things out",
            name: "Starter",
            price: "$0",
          },
          {
            description: "For scaling teams",
            name: "Pro",
            price: "$29/mo",
          },
        ],
        title: "Pricing",
        type: "pricing",
      },
      {
        id: "footer-1",
        text: "© 2026 Your Company. All rights reserved.",
        type: "footer",
      },
    ],
    theme: {
      borderRadius: loweredPrompt.includes("rounded") ? 20 : 12,
      colors: {
        background: isDark ? "#0F172A" : "#F8FAFC",
        primary: primaryColor,
        secondary: isDark ? "#334155" : "#E2E8F0",
        text: isDark ? "#F8FAFC" : "#0F172A",
      },
      fontFamily: loweredPrompt.includes("serif")
        ? "Georgia, serif"
        : "Inter, sans-serif",
      spacing: 24,
    },
  };
};

const applySectionMutation = (
  section: DesignSpec["sections"][number],
  prompt: string
): DesignSpec["sections"][number] => {
  const loweredPrompt = prompt.toLowerCase();

  if (section.type === "hero") {
    if (loweredPrompt.includes("playful")) {
      return {
        ...section,
        ctaText: "Let's Go!",
        subtitle: "Bold ideas, bright colors, and joyful interactions.",
      };
    }

    if (loweredPrompt.includes("professional")) {
      return {
        ...section,
        ctaText: "Book a Demo",
        subtitle: "Enterprise-grade reliability for serious growth.",
      };
    }
  }

  return section;
};

export const GenerateDesignSpecInputSchema = z.object({
  prompt: z.string().min(1),
});

export const IterateDesignSpecInputSchema = z.object({
  currentSpec: DesignSpecSchema,
  prompt: z.string().min(1),
  targetSectionId: z.string().min(1).optional(),
});

export const GenerateCodeExportInputSchema = z.object({
  spec: DesignSpecSchema,
});

export const generateDesignSpec = (
  input: z.infer<typeof GenerateDesignSpecInputSchema>
): DesignSpec => {
  const parsed = GenerateDesignSpecInputSchema.parse(input);
  return DesignSpecSchema.parse(createBaseSpec(parsed.prompt));
};

export const iterateDesignSpec = (
  input: z.infer<typeof IterateDesignSpecInputSchema>
): { spec: DesignSpec; summary: string } => {
  const parsed = IterateDesignSpecInputSchema.parse(input);
  const nextSpec = structuredClone(parsed.currentSpec);
  const primaryColor = getColorFromPrompt(parsed.prompt);

  if (primaryColor) {
    nextSpec.theme.colors.primary = primaryColor;
  }

  if (parsed.prompt.toLowerCase().includes("dark")) {
    nextSpec.theme.colors.background = "#020617";
    nextSpec.theme.colors.text = "#F8FAFC";
    nextSpec.intent.styleKeywords = [
      ...new Set([...nextSpec.intent.styleKeywords, "dark"]),
    ];
  }

  nextSpec.sections = nextSpec.sections.map((section) => {
    if (parsed.targetSectionId && section.id !== parsed.targetSectionId) {
      return section;
    }

    return applySectionMutation(section, parsed.prompt);
  });

  return {
    spec: DesignSpecSchema.parse(nextSpec),
    summary: `Applied updates from prompt: "${parsed.prompt}"`,
  };
};

export const generateCodeExport = (
  input: z.infer<typeof GenerateCodeExportInputSchema>
): string => {
  const parsed = GenerateCodeExportInputSchema.parse(input);

  const hero = parsed.spec.sections.find((section) => section.type === "hero");

  return `export default function Website() {
  return (
    <main className="min-h-screen p-8" style={{ background: "${parsed.spec.theme.colors.background}", color: "${parsed.spec.theme.colors.text}" }}>
      <section className="mx-auto max-w-5xl rounded-xl p-10" style={{ background: "${parsed.spec.theme.colors.secondary}" }}>
        <h1 className="text-4xl font-bold">${hero?.title ?? "Website"}</h1>
        ${hero ? `<p className="mt-4 text-lg">${hero.subtitle}</p>` : ""}
        ${hero ? `<button className="mt-6 rounded-md px-4 py-2" style={{ background: "${parsed.spec.theme.colors.primary}", color: "${parsed.spec.theme.colors.background}" }}>${hero.ctaText}</button>` : ""}
      </section>
    </main>
  );
}`;
};
