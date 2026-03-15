// oxlint-disable eslint-plugin-react-perf(jsx-no-new-function-as-prop), eslint(no-negated-condition)
"use client";

import { Button } from "@repo/shadcn-ui/components/ui/button";
import { Input } from "@repo/shadcn-ui/components/ui/input";
import { Label } from "@repo/shadcn-ui/components/ui/label";
import { cn } from "@repo/shadcn-ui/lib/utils";
import type { ChatStatus } from "ai";
import { useMemo, useState } from "react";

import { Conversation, ConversationContent } from "../../conversation";
import {
  generateCodeExport,
  generateDesignSpec,
  iterateDesignSpec,
} from "../../mcp/designer-tools";
import { Message, MessageContent, MessageResponse } from "../../message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "../../prompt-input";
import type { DesignSpec } from "../../types/designer";
import { PreviewRenderer } from "./preview-renderer";

interface DesignerMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
}

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

interface WebsiteDesignerProps {
  className?: string;
}

const updateTheme = (
  currentSpec: DesignSpec,
  field: keyof DesignSpec["theme"],
  value: string
): DesignSpec => {
  if (field === "spacing" || field === "borderRadius") {
    return {
      ...currentSpec,
      theme: {
        ...currentSpec.theme,
        [field]: Number.parseInt(value, 10) || 0,
      },
    };
  }

  return {
    ...currentSpec,
    theme: {
      ...currentSpec.theme,
      [field]: value,
    },
  };
};

export const WebsiteDesigner = ({ className }: WebsiteDesignerProps) => {
  const [activeTab, setActiveTab] = useState<"chat" | "properties">("chat");
  const [history, setHistory] = useState<DesignSpec[]>([]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<DesignerMessage[]>([]);
  const [spec, setSpec] = useState<DesignSpec | null>(null);
  const [status, setStatus] = useState<ChatStatus>("ready");
  const [exportedCode, setExportedCode] = useState<string | null>(null);

  const loading = status === "submitted" || status === "streaming";

  const handleSubmit = async (text: string) => {
    if (!text.trim() || loading) {
      return;
    }

    setStatus("submitted");
    setMessages((current) => [
      ...current,
      { id: makeId(), role: "user", text },
    ]);

    try {
      if (!spec) {
        const generatedSpec = await generateDesignSpec({ prompt: text });
        setSpec(generatedSpec);
        setMessages((current) => [
          ...current,
          {
            id: makeId(),
            role: "assistant",
            text: "Created an initial design specification.",
          },
        ]);
      } else {
        const { spec: nextSpec, summary } = await iterateDesignSpec({
          currentSpec: spec,
          prompt: text,
        });

        setHistory((current) => [...current, spec]);
        setSpec(nextSpec);
        setMessages((current) => [
          ...current,
          { id: makeId(), role: "assistant", text: summary },
        ]);
      }
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: "assistant",
          text:
            error instanceof Error ? error.message : "Failed to update design.",
        },
      ]);
      setStatus("error");
      return;
    }

    setInput("");
    setStatus("ready");
  };

  const exportDisabled = !spec || loading;

  const canUndo = history.length > 0;

  const propertiesPanel = useMemo(() => {
    if (!spec) {
      return (
        <p className="text-muted-foreground text-sm">
          Generate a design first.
        </p>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="primary-color">Primary</Label>
          <Input
            id="primary-color"
            onChange={(event) =>
              setSpec((current) =>
                current
                  ? {
                      ...current,
                      theme: {
                        ...current.theme,
                        colors: {
                          ...current.theme.colors,
                          primary: event.target.value,
                        },
                      },
                    }
                  : current
              )
            }
            type="color"
            value={spec.theme.colors.primary}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="secondary-color">Secondary</Label>
          <Input
            id="secondary-color"
            onChange={(event) =>
              setSpec((current) =>
                current
                  ? {
                      ...current,
                      theme: {
                        ...current.theme,
                        colors: {
                          ...current.theme.colors,
                          secondary: event.target.value,
                        },
                      },
                    }
                  : current
              )
            }
            type="color"
            value={spec.theme.colors.secondary}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="background-color">Background</Label>
          <Input
            id="background-color"
            onChange={(event) =>
              setSpec((current) =>
                current
                  ? {
                      ...current,
                      theme: {
                        ...current.theme,
                        colors: {
                          ...current.theme.colors,
                          background: event.target.value,
                        },
                      },
                    }
                  : current
              )
            }
            type="color"
            value={spec.theme.colors.background}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="text-color">Text</Label>
          <Input
            id="text-color"
            onChange={(event) =>
              setSpec((current) =>
                current
                  ? {
                      ...current,
                      theme: {
                        ...current.theme,
                        colors: {
                          ...current.theme.colors,
                          text: event.target.value,
                        },
                      },
                    }
                  : current
              )
            }
            type="color"
            value={spec.theme.colors.text}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="font-family">Font Family</Label>
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            id="font-family"
            onChange={(event) =>
              setSpec((current) =>
                current
                  ? updateTheme(current, "fontFamily", event.target.value)
                  : current
              )
            }
            value={spec.theme.fontFamily}
          >
            <option value="Inter, sans-serif">Inter</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="ui-monospace, SFMono-Regular, Menlo, monospace">
              Monospace
            </option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="spacing">Spacing</Label>
          <Input
            id="spacing"
            min={0}
            onChange={(event) =>
              setSpec((current) =>
                current
                  ? updateTheme(current, "spacing", event.target.value)
                  : current
              )
            }
            type="number"
            value={spec.theme.spacing}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="border-radius">Border Radius</Label>
          <Input
            id="border-radius"
            min={0}
            onChange={(event) =>
              setSpec((current) =>
                current
                  ? updateTheme(current, "borderRadius", event.target.value)
                  : current
              )
            }
            type="number"
            value={spec.theme.borderRadius}
          />
        </div>
      </div>
    );
  }, [spec]);

  return (
    <div className={cn("grid gap-4 md:grid-cols-[320px_1fr]", className)}>
      <aside className="space-y-3 rounded-lg border p-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => setActiveTab("chat")}
            size="sm"
            variant={activeTab === "chat" ? "default" : "outline"}
          >
            Chat
          </Button>
          <Button
            onClick={() => setActiveTab("properties")}
            size="sm"
            variant={activeTab === "properties" ? "default" : "outline"}
          >
            Properties
          </Button>
        </div>

        {activeTab === "chat" ? (
          <>
            <Conversation className="h-[360px] rounded-md border">
              <ConversationContent>
                {messages.map((message) => (
                  <Message from={message.role} key={message.id}>
                    <MessageContent>
                      <MessageResponse>{message.text}</MessageResponse>
                    </MessageContent>
                  </Message>
                ))}
              </ConversationContent>
            </Conversation>

            <PromptInput
              onSubmit={async ({ text }, event) => {
                event.preventDefault();
                await handleSubmit(text);
              }}
            >
              <PromptInputBody>
                <PromptInputTextarea
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Describe the website you want..."
                  value={input}
                />
              </PromptInputBody>
              <PromptInputFooter>
                <PromptInputSubmit status={status} />
              </PromptInputFooter>
            </PromptInput>
          </>
        ) : (
          propertiesPanel
        )}

        <div className="flex gap-2">
          <Button
            disabled={!canUndo || loading}
            onClick={() => {
              const previous = history.at(-1);
              if (!previous) {
                return;
              }
              setHistory((current) => current.slice(0, -1));
              setSpec(previous);
            }}
            size="sm"
            variant="outline"
          >
            Undo
          </Button>
          <Button
            disabled={exportDisabled}
            onClick={async () => {
              if (!spec) {
                return;
              }
              setExportedCode(await generateCodeExport({ spec }));
            }}
            size="sm"
            variant="outline"
          >
            Export Code
          </Button>
        </div>
      </aside>

      <main className="overflow-hidden rounded-lg border">
        <PreviewRenderer loading={loading} spec={spec} />
        {exportedCode && (
          <pre
            className="border-t bg-muted/40 p-4 text-xs"
            data-testid="exported-code"
          >
            <code>{exportedCode}</code>
          </pre>
        )}
      </main>
    </div>
  );
};
