import { cn } from "@repo/shadcn-ui/lib/utils";
import type { CSSProperties } from "react";

import type { DesignSection, DesignSpec } from "../../types/designer";

interface PreviewRendererProps {
  spec: DesignSpec | null;
  loading?: boolean;
}

const HeroBlock = ({
  section,
}: {
  section: Extract<DesignSection, { type: "hero" }>;
}) => (
  <section
    className="border p-6"
    data-testid={section.id}
    style={{ borderRadius: "var(--radius-size)" }}
  >
    <h1 className="font-semibold text-3xl">{section.title}</h1>
    <p className="mt-2 text-sm opacity-90">{section.subtitle}</p>
    <button
      className="mt-4 rounded-md px-3 py-2 text-sm"
      style={{
        backgroundColor: "var(--primary-color)",
        color: "var(--background-color)",
      }}
      type="button"
    >
      {section.ctaText}
    </button>
  </section>
);

const FeaturesBlock = ({
  section,
}: {
  section: Extract<DesignSection, { type: "features" }>;
}) => (
  <section
    className="border p-6"
    data-testid={section.id}
    style={{ borderRadius: "var(--radius-size)" }}
  >
    <h2 className="font-semibold text-2xl">{section.title}</h2>
    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
      {section.items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </section>
);

const PricingBlock = ({
  section,
}: {
  section: Extract<DesignSection, { type: "pricing" }>;
}) => (
  <section
    className="border p-6"
    data-testid={section.id}
    style={{ borderRadius: "var(--radius-size)" }}
  >
    <h2 className="font-semibold text-2xl">{section.title}</h2>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {section.tiers.map((tier) => (
        <div
          className="border p-4"
          key={tier.name}
          style={{ borderRadius: "var(--radius-size)" }}
        >
          <p className="font-medium">{tier.name}</p>
          <p className="text-lg">{tier.price}</p>
          <p className="text-muted-foreground text-sm">{tier.description}</p>
        </div>
      ))}
    </div>
  </section>
);

const FooterBlock = ({
  section,
}: {
  section: Extract<DesignSection, { type: "footer" }>;
}) => (
  <footer
    className="border-t pt-4 text-center text-xs"
    data-testid={section.id}
  >
    {section.text}
  </footer>
);

const SectionRenderer = ({ section }: { section: DesignSection }) => {
  switch (section.type) {
    case "hero": {
      return <HeroBlock section={section} />;
    }
    case "features": {
      return <FeaturesBlock section={section} />;
    }
    case "pricing": {
      return <PricingBlock section={section} />;
    }
    case "footer": {
      return <FooterBlock section={section} />;
    }
    default: {
      return null;
    }
  }
};

const PreviewSkeleton = () => (
  <div className="space-y-4 p-6" data-testid="preview-skeleton">
    <div className="h-28 animate-pulse rounded-lg bg-muted" />
    <div className="h-24 animate-pulse rounded-lg bg-muted" />
    <div className="h-24 animate-pulse rounded-lg bg-muted" />
  </div>
);

export const PreviewRenderer = ({ spec, loading }: PreviewRendererProps) => {
  if (loading) {
    return <PreviewSkeleton />;
  }

  if (!spec) {
    return (
      <div className="flex min-h-[420px] items-center justify-center p-6 text-muted-foreground text-sm">
        Start by describing the website you want to design.
      </div>
    );
  }

  return (
    <div
      className={cn("min-h-[420px] space-y-4 p-6")}
      style={
        {
          "--background-color": spec.theme.colors.background,
          "--primary-color": spec.theme.colors.primary,
          "--radius-size": `${spec.theme.borderRadius}px`,
          "--secondary-color": spec.theme.colors.secondary,
          "--spacing-size": `${spec.theme.spacing}px`,
          "--text-color": spec.theme.colors.text,
          backgroundColor: "var(--background-color)",
          color: "var(--text-color)",
          fontFamily: spec.theme.fontFamily,
          gap: "var(--spacing-size)",
        } as CSSProperties
      }
    >
      {spec.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </div>
  );
};
