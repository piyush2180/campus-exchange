import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useRouterState, useNavigate, Link } from "@tanstack/react-router";
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Trash2,
  Loader2,
  Bot,
  User,
  Star,
  Search,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/hooks/useApp";
import { MessageSources } from "./MessageSources";
import { QuickActionButtons } from "./QuickActionButtons";
import { FollowUpSuggestions } from "./FollowUpSuggestions";
import { MessageFeedback } from "./MessageFeedback";
import { SuggestedPrompts } from "./SuggestedPrompts";
import { ActionConfirmationCard } from "./ActionConfirmationCard";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { RichResponseCard } from "./RichResponseCard";
import { ChatMiniChart } from "./ChatMiniChart";
import { AITimelineCard } from "./AITimelineCard";
import { streamCopilotResponse } from "@/services/copilot/copilot.service";
import {
  getStoredThreads,
  saveThreads,
  generateThreadTitle,
  filterThreads,
  type Thread,
} from "@/services/copilot/conversation.service";
import type { Message } from "@/services/copilot/promptBuilder";

interface CopilotPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const STAGE_MESSAGES = [
  "Analyzing request...",
  "Reading portfolio state...",
  "Checking wellness logs...",
  "Searching platform guides...",
  "Generating grounded response...",
];

export function CopilotPanel({ isOpen, onClose }: CopilotPanelProps) {
  const { state, buy, sell } = useApp();
  const { location } = useRouterState();
  const navigate = useNavigate();
  const activeRoute = location.pathname;
  const userId = state.user?.id ?? "guest";

  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [pendingAction, setPendingAction] = useState<{
    desc: string;
    details?: string;
    actionFn: () => Promise<void>;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load stored threads for user
  useEffect(() => {
    if (userId) {
      const stored = getStoredThreads(userId);
      setThreads(stored);
      if (stored.length > 0 && !activeThreadId) {
        setActiveThreadId(stored[0].id);
      }
    }
  }, [userId]);

  // Global Keyboard Shortcuts (Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Stage progress indicator animation during streaming
  useEffect(() => {
    let interval: any;
    if (isStreaming) {
      setStageIndex(0);
      interval = setInterval(() => {
        setStageIndex((prev) => (prev < STAGE_MESSAGES.length - 1 ? prev + 1 : prev));
      }, 350);
    }
    return () => clearInterval(interval);
  }, [isStreaming]);

  const displayedThreads = filterThreads(threads, searchQuery);
  const activeThread = threads.find((t) => t.id === activeThreadId);
  const messages = activeThread?.messages ?? [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  if (!isOpen) return null;

  const createNewThread = (initialQuery?: string): Thread => {
    const newId = `thread_${Date.now()}`;
    const newThread: Thread = {
      id: newId,
      title: initialQuery ? generateThreadTitle(initialQuery) : "New Conversation",
      createdAt: new Date().toISOString(),
      messages: [],
    };
    setThreads((prev) => {
      const updated = [newThread, ...prev];
      saveThreads(userId, updated);
      return updated;
    });
    setActiveThreadId(newId);
    return newThread;
  };

  const handleToggleBookmark = (threadId: string) => {
    setThreads((prev) => {
      const updated = prev.map((t) =>
        t.id === threadId ? { ...t, isBookmarked: !t.isBookmarked } : t,
      );
      saveThreads(userId, updated);
      return updated;
    });
  };

  const handleSendMessage = async (queryText?: string) => {
    const q = (queryText || input).trim();
    if (!q || isStreaming) return;

    setInput("");

    let targetThreadId = activeThreadId;
    let baseThreads = [...threads];

    if (!targetThreadId || !baseThreads.some((t) => t.id === targetThreadId)) {
      const newId = `thread_${Date.now()}`;
      const newThread: Thread = {
        id: newId,
        title: generateThreadTitle(q),
        createdAt: new Date().toISOString(),
        messages: [],
      };
      targetThreadId = newId;
      baseThreads = [newThread, ...baseThreads];
      setActiveThreadId(newId);
    }

    const userMsgId = `msg_${Date.now()}`;
    const userMsg: Message = { id: userMsgId, role: "user", content: q };

    const assistantMsgId = `msg_${Date.now() + 1}`;
    const assistantMsg: Message = { id: assistantMsgId, role: "assistant", content: "" };

    const currentThreadObj = baseThreads.find((t) => t.id === targetThreadId)!;
    const historyForPrompt = [...currentThreadObj.messages];
    const updatedMessages = [...historyForPrompt, userMsg, assistantMsg];

    const updatedThreads = baseThreads.map((t) =>
      t.id === targetThreadId
        ? {
            ...t,
            title: t.messages.length === 0 ? generateThreadTitle(q) : t.title,
            messages: updatedMessages,
          }
        : t,
    );

    setThreads(updatedThreads);
    saveThreads(userId, updatedThreads);
    setIsStreaming(true);

    let accumulatedContent = "";
    let finalSources: string[] | undefined;
    let finalConfidence: "High" | "Medium" | "Low" | undefined;
    let finalRichCard: Message["richCard"];
    let finalMiniChart: Message["miniChart"];
    let finalTimeline: Message["timeline"];
    let finalQuickActions: Array<{ label: string; route: string }> | undefined;
    let finalSuggestions: string[] | undefined;

    await streamCopilotResponse(q, userId, state, activeRoute, historyForPrompt, (chunk) => {
      if (chunk.textDelta) accumulatedContent += chunk.textDelta;
      if (chunk.sources) finalSources = chunk.sources;
      if (chunk.confidence) finalConfidence = chunk.confidence;
      if (chunk.richCard) finalRichCard = chunk.richCard;
      if (chunk.miniChart) finalMiniChart = chunk.miniChart;
      if (chunk.timeline) finalTimeline = chunk.timeline;
      if (chunk.quickActions) finalQuickActions = chunk.quickActions;
      if (chunk.suggestions) finalSuggestions = chunk.suggestions;

      if (chunk.navigateRoute) {
        navigate({ to: chunk.navigateRoute as any });
        onClose();
      }

      setThreads((prevThreads) => {
        const nextThreads = prevThreads.map((t) => {
          if (t.id !== targetThreadId) return t;
          const msgs = t.messages.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: accumulatedContent,
                  sources: finalSources,
                  confidence: finalConfidence,
                  richCard: finalRichCard,
                  miniChart: finalMiniChart,
                  timeline: finalTimeline,
                  quickActions: finalQuickActions,
                  suggestions: finalSuggestions,
                }
              : m,
          );
          return { ...t, messages: msgs };
        });
        saveThreads(userId, nextThreads);
        return nextThreads;
      });
    });

    setIsStreaming(false);

    // Check if query asks for trading action requiring confirmation
    const lowerQ = q.toLowerCase();
    if (lowerQ.startsWith("buy ") || lowerQ.startsWith("sell ")) {
      const parts = q.split(" ");
      const action = parts[0].toLowerCase();
      const ticker = parts[1]?.toUpperCase() ?? "CODE";
      const asset = state.assets.find((a) => a.ticker === ticker || a.id === ticker.toLowerCase());

      if (asset) {
        setPendingAction({
          desc: `${action === "buy" ? "Buy" : "Sell"} 1 share of ${asset.ticker}?`,
          details: `Current Price: ${asset.price.toFixed(2)} coins. Confirm trade execution.`,
          actionFn: async () => {
            if (action === "buy") await buy(asset, 1);
            else await sell(asset, 1);
          },
        });
      }
    }
  };

  const handleFeedback = (messageId: string, feedback: "up" | "down") => {
    if (!activeThreadId) return;
    const updated = threads.map((t) => {
      if (t.id !== activeThreadId) return t;
      const msgs = t.messages.map((m) => (m.id === messageId ? { ...m, feedback } : m));
      return { ...t, messages: msgs };
    });
    setThreads(updated);
    saveThreads(userId, updated);
  };

  const handleClearHistory = () => {
    setThreads([]);
    setActiveThreadId(null);
    if (userId) saveThreads(userId, []);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-border bg-background/95 backdrop-blur-2xl shadow-2xl sm:w-[420px] md:w-[460px]">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--brand)]/10 text-[color:var(--brand)]">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight">Pulse AI</h2>
              <Link
                to="/app/ai-architecture"
                onClick={onClose}
                className="text-[10px] text-muted-foreground hover:text-[color:var(--brand)] flex items-center gap-0.5 underline"
                title="How Pulse AI works (Architecture)"
              >
                <BookOpen className="h-2.5 w-2.5" /> Specs
              </Link>
            </div>
            <p className="text-[11px] text-muted-foreground">Context-aware RAG Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSearch((prev) => !prev)}
            className="h-8 w-8 p-0"
            title="Search threads"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
          </Button>
          {threads.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearHistory} title="Clear history">
              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
            title="Close (Esc)"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Thread Search Bar */}
      {showSearch && (
        <div className="border-b border-border p-2 bg-muted/30">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversation history..."
            className="h-8 text-xs"
          />
        </div>
      )}

      {/* Thread Selector / Tabs */}
      {displayedThreads.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border px-4 py-2 text-xs">
          {displayedThreads.slice(0, 5).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveThreadId(t.id)}
              className={`max-w-[130px] truncate rounded-md px-2.5 py-1 text-xs transition-colors flex items-center gap-1 ${
                t.id === activeThreadId
                  ? "bg-muted font-medium text-foreground border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.isBookmarked && (
                <Star className="h-3 w-3 text-amber-400 fill-amber-400 flex-none" />
              )}
              <span className="truncate">{t.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <SuggestedPrompts
            userName={state.user?.name}
            activeRoute={activeRoute}
            onSelectPrompt={(p) => handleSendMessage(p)}
          />
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center justify-between w-full mb-1 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  {m.role === "user" ? (
                    <>
                      <span>You</span>
                      <User className="h-3 w-3" />
                    </>
                  ) : (
                    <>
                      <Bot className="h-3 w-3 text-[color:var(--brand)]" />
                      <span>Pulse AI</span>
                      {m.confidence && <ConfidenceBadge confidence={m.confidence} />}
                    </>
                  )}
                </div>
                {m.role === "assistant" && activeThread && (
                  <button
                    onClick={() => handleToggleBookmark(activeThread.id)}
                    className="hover:text-amber-400 transition-colors p-0.5"
                    title="Bookmark thread"
                  >
                    <Star
                      className={`h-3 w-3 ${
                        activeThread.isBookmarked ? "text-amber-400 fill-amber-400" : ""
                      }`}
                    />
                  </button>
                )}
              </div>

              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[92%] ${
                  m.role === "user"
                    ? "bg-[color:var(--brand)] text-[color:var(--brand-foreground)] font-medium"
                    : "surface-card text-foreground"
                }`}
              >
                {m.role === "assistant" ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{m.content || "..."}</ReactMarkdown>
                  </div>
                ) : (
                  m.content
                )}

                {m.role === "assistant" && m.content && (
                  <>
                    {m.richCard && (
                      <RichResponseCard
                        title={m.richCard.title}
                        totalValue={m.richCard.totalValue}
                        bestAsset={m.richCard.bestAsset}
                        worstAsset={m.richCard.worstAsset}
                        riskScore={m.richCard.riskScore}
                      />
                    )}
                    {m.miniChart && (
                      <ChatMiniChart title={m.miniChart.title} data={m.miniChart.data} />
                    )}
                    {m.timeline && <AITimelineCard events={m.timeline} />}

                    <MessageSources sources={m.sources ?? []} />
                    <QuickActionButtons actions={m.quickActions} onActionClick={onClose} />
                    <FollowUpSuggestions
                      suggestions={m.suggestions}
                      onSelectSuggestion={(s) => handleSendMessage(s)}
                    />
                    <MessageFeedback
                      messageId={m.id}
                      initialFeedback={m.feedback}
                      onFeedback={handleFeedback}
                    />
                  </>
                )}
              </div>
            </div>
          ))
        )}

        {pendingAction && (
          <ActionConfirmationCard
            actionDescription={pendingAction.desc}
            details={pendingAction.details}
            onConfirm={async () => {
              await pendingAction.actionFn();
              setPendingAction(null);
            }}
            onCancel={() => setPendingAction(null)}
          />
        )}

        {isStreaming && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pl-2 py-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[color:var(--brand)]" />
            <span>{STAGE_MESSAGES[stageIndex]}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t border-border p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Pulse AI about portfolio, habits, rules... (Ctrl+/)"
            disabled={isStreaming}
            className="flex-1 text-sm"
          />
          <Button type="submit" disabled={isStreaming || !input.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground px-1">
          <span>Active Context: {activeRoute}</span>
          <button
            type="button"
            onClick={() => createNewThread()}
            className="hover:underline flex items-center gap-1"
          >
            <RotateCcw className="h-2.5 w-2.5" /> New Chat
          </button>
        </div>
      </div>
    </div>
  );
}
