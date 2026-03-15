import { z } from "zod";

export interface DesignIntent {
  targetAudience: string;
  styleKeywords: string[];
}

export interface ThemeSpec {
  borderRadius: number;
  fontFamily: string;
  spacing: number;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
}

export interface LayoutPage {
  id: string;
  name: string;
  path: string;
  sectionIds: string[];
}

export interface HeroSection {
  id: string;
  type: "hero";
  title: string;
  subtitle: string;
  ctaText: string;
}

export interface FeaturesSection {
  id: string;
  type: "features";
  title: string;
  items: string[];
}

export interface PricingSection {
  id: string;
  type: "pricing";
  title: string;
  tiers: {
    name: string;
    price: string;
    description: string;
  }[];
}

export interface FooterSection {
  id: string;
  type: "footer";
  text: string;
}

export type DesignSection =
  | HeroSection
  | FeaturesSection
  | PricingSection
  | FooterSection;

export interface DesignSpec {
  intent: DesignIntent;
  layout: LayoutPage[];
  sections: DesignSection[];
  theme: ThemeSpec;
}

const HexColorSchema = z.string().regex(/^#(?:[\dA-Fa-f]{3}){1,2}$/);

export const DesignIntentSchema = z.object({
  styleKeywords: z.array(z.string().min(1)).min(1),
  targetAudience: z.string().min(1),
});

export const ThemeSpecSchema = z.object({
  borderRadius: z.number().min(0).max(64),
  colors: z.object({
    background: HexColorSchema,
    primary: HexColorSchema,
    secondary: HexColorSchema,
    text: HexColorSchema,
  }),
  fontFamily: z.string().min(1),
  spacing: z.number().min(0).max(64),
});

export const LayoutPageSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  path: z.string().min(1),
  sectionIds: z.array(z.string().min(1)).min(1),
});

const HeroSectionSchema = z.object({
  ctaText: z.string().min(1),
  id: z.string().min(1),
  subtitle: z.string().min(1),
  title: z.string().min(1),
  type: z.literal("hero"),
});

const FeaturesSectionSchema = z.object({
  id: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
  title: z.string().min(1),
  type: z.literal("features"),
});

const PricingSectionSchema = z.object({
  id: z.string().min(1),
  tiers: z
    .array(
      z.object({
        description: z.string().min(1),
        name: z.string().min(1),
        price: z.string().min(1),
      })
    )
    .min(1),
  title: z.string().min(1),
  type: z.literal("pricing"),
});

const FooterSectionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  type: z.literal("footer"),
});

export const DesignSectionSchema = z.discriminatedUnion("type", [
  HeroSectionSchema,
  FeaturesSectionSchema,
  PricingSectionSchema,
  FooterSectionSchema,
]);

export const DesignSpecSchema = z.object({
  intent: DesignIntentSchema,
  layout: z.array(LayoutPageSchema).min(1),
  sections: z.array(DesignSectionSchema).min(1),
  theme: ThemeSpecSchema,
});
