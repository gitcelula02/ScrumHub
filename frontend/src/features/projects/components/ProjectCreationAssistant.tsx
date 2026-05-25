import { useState } from "react";
import { useAIPrompt } from "@/features/ai/hooks/useAI";
import { Sparkles, Send, Loader2, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ProjectCreationAssistantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuggestionApply: (suggestion: ProjectSuggestion) => void;
}

interface ProjectSuggestion {
  name?: string;
  description?: string;
  scrumTeam?: string;
  color?: string;
  icon?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestion?: ProjectSuggestion;
}

/**
 * @component ProjectCreationAssistant
 * AI-powered chat assistant for helping fill project creation form.
 * Uses the AI service to parse natural language into project fields.
 *
 * @param {boolean} open - Whether the dialog is open
 * @param {function} onOpenChange - Callback when dialog wants to close
 * @param {function} onSuggestionApply - Callback when user accepts AI suggestion
 * @returns {JSX.Element}
 */
export function ProjectCreationAssistant({
  open,
  onOpenChange,
  onSuggestionApply,
}: ProjectCreationAssistantProps) {
  const { mutateAsync: parsePrompt, isPending } = useAIPrompt();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your AI project creation assistant. Describe your project in natural language and I'll help fill in the details. For example: 'Create a website redesign project for Acme Corp with a blue theme'",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim() || isPending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const result = await parsePrompt(input);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          result && Object.keys(result).length > 0
            ? "I've analyzed your request and prepared the following project details. Review them and click 'Apply Suggestions' to fill the form."
            : "I couldn't extract project details from your message. Try being more specific about the project name, key, or description.",
        suggestion: result as ProjectSuggestion | undefined,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Sorry, I encountered an error processing your request. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleApplySuggestion = (suggestion: ProjectSuggestion) => {
    onSuggestionApply(suggestion);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[420px] max-h-[80vh] flex flex-col">
        <DialogHeader className="pb-2 border-b border-panel-border shrink-0">
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-status-bar" />
              <DialogTitle className="text-sm font-semibold">
                AI Project Assistant
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col gap-1",
                msg.role === "user" && "items-end"
              )}
            >
              <div
                className={cn(
                  "flex items-start gap-2 max-w-[85%]",
                  msg.role === "user" && "flex-row-reverse"
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-sm flex items-center justify-center shrink-0",
                    msg.role === "assistant"
                      ? "bg-status-bar text-status-bar-fg"
                      : "bg-sidebar-bg border border-panel-border"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <Sparkles size={12} />
                  ) : (
                    <MessageSquare size={12} />
                  )}
                </div>
                <div
                  className={cn(
                    "rounded-md px-3 py-2 text-sm",
                    msg.role === "assistant"
                      ? "bg-sidebar-bg border border-panel-border"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  {msg.content}
                </div>
              </div>
              {msg.suggestion && msg.role === "assistant" && (
                <div className="ml-8">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApplySuggestion(msg.suggestion!)}
                    className="h-7 text-xs"
                  >
                    Apply Suggestions
                  </Button>
                </div>
              )}
            </div>
          ))}
          {isPending && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 size={14} className="animate-spin" />
              <span className="text-sm">Processing...</span>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-panel-border space-y-2 shrink-0">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your project... e.g., 'Create a mobile app project for my startup with red theme'"
            className="min-h-[60px] bg-transparent resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isPending}
            className="w-full"
            size="sm"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send
              </>
            )}
          </Button>
        </div>

        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}