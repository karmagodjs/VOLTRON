"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { askCopilot } from "@/lib/api";
import clsx from "clsx";

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSymbol?: string;
}

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: string;
  symbol?: string;
  intent?: string;
}

const suggestedPrompts = [
  "Why did VOLTRON choose iron condor?",
  "What is the current volatility regime?",
  "Why was this trade rejected?",
  "Compare SPY and QQQ",
  "Show today's biggest risk.",
  "SPY volatility",
];

export default function AICopilotDrawer({
  isOpen,
  onClose,
  currentSymbol = "SPY",
}: AICopilotDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      role: "assistant",
      content: `## VOLTRON Online\n\nI am your autonomous quantitative options and volatility copilot.\n\nAsk me about current IV/RV spreads, strategy decisions, risk gate audits, or why specific trades were executed or blocked.`,
      timestamp: "Just now",
      symbol: currentSymbol,
      intent: "GREETING",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const rawText = queryText !== undefined ? queryText : input;
    const textToSend = rawText.trim();
    if (!textToSend || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (queryText === undefined) setInput("");
    setLoading(true);

    try {
      const res = await askCopilot(textToSend, currentSymbol);
      const assistantMessageText =
        typeof res.reply === "string"
          ? res.reply
          : (res as any).message ?? (res as any).content ?? (res as any).text ?? "VOLTRON analysis complete.";

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: assistantMessageText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        symbol: res.symbol || currentSymbol,
        intent: res.intent,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "## VOLTRON\n\nMarket intelligence is temporarily unavailable. Please verify backend connectivity.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-voltron-950 border-l border-voltron-750/80 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200 font-mono">
      {/* Header */}
      <div className="p-4 border-b border-voltron-750/80 flex items-center justify-between bg-voltron-900/60 backdrop-blur">
        <div className="flex items-center">
          <div>
            <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              VOLTRON COPILOT
              <span className="text-[9px] px-1 py-0.2 rounded bg-voltron-emerald/15 text-voltron-emerald border border-voltron-emerald/30">
                GEMINI 3.6
              </span>
            </div>
            <div className="text-[10px] font-mono text-voltron-400">
              Autonomous Quant & Risk Intelligence
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-voltron-400 hover:text-white hover:bg-voltron-800 transition-colors"
          title="Close Copilot"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 border-b border-voltron-750/40 bg-voltron-900/30 overflow-x-auto whitespace-nowrap">
        <div className="text-[10px] font-mono uppercase text-voltron-400 mb-1.5">
          Quick Inquiries
        </div>
        <div className="flex gap-1.5">
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="text-[10px] font-mono px-2.5 py-1 rounded bg-voltron-850 hover:bg-voltron-800 text-voltron-200 hover:text-voltron-cyan border border-voltron-750/80 transition-colors flex-shrink-0"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-mono">
        {messages.map((m) => (
          <div
            key={m.id}
            className={clsx(
              "flex flex-col",
              m.role === "user" ? "items-end" : "items-start"
            )}
          >
            <div
              className={clsx(
                "max-w-[92%] rounded p-3 leading-relaxed",
                m.role === "user"
                  ? "bg-voltron-cyan/15 text-white border border-voltron-cyan/30 font-medium whitespace-pre-wrap"
                  : "bg-voltron-850 text-voltron-100 border border-voltron-750"
              )}
            >
              {m.role === "assistant" ? (
                <div className="prose prose-invert max-w-none text-xs font-mono leading-relaxed space-y-2">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-sm font-bold text-white mb-2 tracking-wide border-b border-voltron-750/50 pb-1">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xs font-bold text-voltron-cyan mb-2 tracking-wide uppercase flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-voltron-cyan inline-block"></span>
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-xs font-bold text-white mb-1">{children}</h3>
                      ),
                      p: ({ children }) => (
                        <p className="mb-2 last:mb-0 text-voltron-100 leading-relaxed font-sans text-xs">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside space-y-1 my-2 text-voltron-200">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside space-y-1 my-2 text-voltron-200">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-relaxed text-voltron-200 text-xs">
                          {children}
                        </li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-bold text-white">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="text-voltron-cyan not-italic font-semibold">
                          {children}
                        </em>
                      ),
                      code: ({ children, className }) => {
                        const isBlock = Boolean(className?.includes("language-"));
                        return (
                          <code
                            className={clsx(
                              "rounded bg-voltron-950 px-1 py-0.5 text-[11px] font-mono text-voltron-cyan border border-voltron-800",
                              isBlock &&
                                "block p-2.5 my-2 overflow-x-auto whitespace-pre leading-snug"
                            )}
                          >
                            {children}
                          </code>
                        );
                      },
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-2.5 rounded border border-voltron-750 bg-voltron-950/60">
                          <table className="w-full text-left text-[11px] font-mono border-collapse divide-y divide-voltron-800">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-voltron-950 text-voltron-400 font-bold border-b border-voltron-750 uppercase text-[10px]">
                          {children}
                        </thead>
                      ),
                      tbody: ({ children }) => (
                        <tbody className="divide-y divide-voltron-800 bg-voltron-900/40">
                          {children}
                        </tbody>
                      ),
                      tr: ({ children }) => (
                        <tr className="hover:bg-voltron-800/40 transition-colors">
                          {children}
                        </tr>
                      ),
                      th: ({ children }) => (
                        <th className="p-2 text-voltron-cyan font-bold">{children}</th>
                      ),
                      td: ({ children }) => (
                        <td className="p-2 text-voltron-200 font-tabular">{children}</td>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          className="text-voltron-cyan hover:underline font-bold"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="text-xs font-mono leading-relaxed whitespace-pre-wrap">
                  {m.content}
                </div>
              )}
              <div className="text-[9px] text-voltron-400/80 text-right mt-1.5 font-tabular">
                {m.timestamp}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="p-3 rounded-lg bg-voltron-850 border border-voltron-800 text-voltron-300">
            <span className="font-bold text-voltron-cyan animate-pulse tracking-wider text-xs">
              ● VOLTRON ANALYZING...
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-voltron-750/80 bg-voltron-900/80 backdrop-blur">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask VOLTRON about ${currentSymbol} or options alpha...`}
            className="w-full bg-voltron-950 border border-voltron-700 focus:border-voltron-cyan rounded-lg pl-3 pr-10 py-2.5 text-xs font-mono text-white placeholder-voltron-400 outline-none transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 p-1.5 rounded-md bg-voltron-cyan text-voltron-950 hover:bg-voltron-cyan-dim disabled:opacity-40 disabled:hover:bg-voltron-cyan transition-colors"
            title="Send Message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <div className="text-[10px] font-mono text-voltron-400/80 text-center mt-2">
          Grounded on real-time IV, RV, Alpaca execution rules & risk boundaries.
        </div>
      </div>
    </div>
  );
}
