// oxlint-disable eslint-plugin-unicorn(consistent-function-scoping)
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import type { ReactNode } from "react";

import { WebsiteDesigner } from "../src/components/WebsiteDesigner/website-designer";

const { StickToBottomMock, StickToBottomContent } = vi.hoisted(() => {
  interface MockProps {
    children?: ReactNode;
    [key: string]: unknown;
  }

  const StickyMock = ({ children, ...props }: MockProps) => (
    <div role="log" {...props}>
      {children}
    </div>
  );

  const StickyContent = ({ children, ...props }: MockProps) => (
    <div {...props}>{children}</div>
  );

  return {
    StickToBottomContent: StickyContent,
    StickToBottomMock: StickyMock,
  };
});

// oxlint-disable-next-line typescript-eslint(consistent-type-imports)
vi.mock<typeof import("use-stick-to-bottom")>(
  import("use-stick-to-bottom"),
  () => {
    const MockComponent = StickToBottomMock as typeof StickToBottomMock & {
      Content: typeof StickToBottomContent;
    };
    MockComponent.Content = StickToBottomContent;

    return {
      StickToBottom: MockComponent,
      useStickToBottomContext: () => ({
        isAtBottom: true,
        scrollToBottom: vi.fn(),
      }),
    };
  }
);

describe("websiteDesigner", () => {
  it("creates an initial spec from chat prompt", async () => {
    const user = userEvent.setup();

    render(<WebsiteDesigner />);

    await user.type(
      screen.getByPlaceholderText("Describe the website you want..."),
      "Make a dark-mode crypto landing page"
    );

    await user.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText("Crypto Landing Page")).toBeInTheDocument();
    });
  });

  it("supports manual property overrides and code export", async () => {
    const user = userEvent.setup();

    render(<WebsiteDesigner />);

    await user.type(
      screen.getByPlaceholderText("Describe the website you want..."),
      "Create a startup website"
    );
    await user.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText("Modern Product Website")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Properties" }));
    const primaryColorInput = screen.getByLabelText("Primary");
    fireEvent.change(primaryColorInput, { target: { value: "#0000ff" } });

    expect(primaryColorInput).toHaveValue("#0000ff");

    await user.click(screen.getByRole("button", { name: "Export Code" }));

    await waitFor(() => {
      expect(screen.getByTestId("exported-code")).toBeInTheDocument();
    });
  });
});
