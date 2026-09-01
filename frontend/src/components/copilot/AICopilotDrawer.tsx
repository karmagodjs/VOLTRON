"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Bot, User, CornerDownLeft, RefreshCw } from "lucide-react";
import { askCopilot } from "@/lib/api";
import clsx from "clsx";

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSymbol?: string;
}

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  time: string;
}

const suggestedPrompts = [
  "Why did VOLTRON choose iron condor?",
  "What is the current volatility regime?",
  "Why was this trade rejected?",
  "Compare today's IV with realized volatility.",
  "Show today's biggest risk.",
  "Explain the latest paper trade.",
];

export default function AICopilotDrawer({
  isOpen,
  onClose,
  currentSymbol = "SPY",
}: AICopilotDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      sender: "ai",
      text: `Hello! I am **VOLTRON AI Copilot**, your autonomous volatility & quantitative options assistant.\n\nAsk me about current IV/RV spreads, strategy decisions, risk gate audits, or why specific trades were executed or blocked.`,
      time: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput("");
    setLoading(true);

    try {
      const res = await askCopilot(textToSend);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: res.reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: "ai",
        text: "Error connecting to AI reasoning service. Please try again.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-voltron-950 border-l border-voltron-750/80 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-voltron-750/80 flex items-center justify-between bg-voltron-900/60 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-voltron-cyan/20 to-voltron-violet/20 border border-voltron-cyan/40 flex items-center justify-center text-voltron-cyan shadow-cyan-glow">
            <Sparkles className="w-4 h-4" />
          </div>
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
          {suggestedPrompts.slice(0, 4).map((p, idx) => (
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
              "flex gap-3",
              m.sender === "user" ? "justify-end" : "justify-start"
            )}
          >
            {m.sender === "ai" && (
              <div className="w-6 h-6 rounded bg-voltron-cyan/15 border border-voltron-cyan/30 flex items-center justify-center text-voltron-cyan flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={clsx(
                "max-w-[85%] rounded-xl p-3 leading-relaxed whitespace-pre-wrap",
                m.sender === "user"
                  ? "bg-voltron-cyan/15 text-white border border-voltron-cyan/30 font-medium"
                  : "bg-voltron-850 text-voltron-100 border border-voltron-750"
              )}
            >
              <div>{m.text}</div>
              <div className="text-[9px] text-voltron-400/80 text-right mt-1.5">
                {m.time}
              </div>
            </div>
            {m.sender === "user" && (
              <div className="w-6 h-6 rounded bg-voltron-800 border border-voltron-700 flex items-center justify-center text-voltron-300 flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-voltron-cyan">
            <div className="w-6 h-6 rounded bg-voltron-cyan/15 border border-voltron-cyan/30 flex items-center justify-center text-voltron-cyan">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="p-3 rounded-xl bg-voltron-850 border border-voltron-750 text-voltron-300 flex items-center gap-2">
              <span className="animate-pulse">Reasoning over live market & volatility parameters...</span>
            </div>
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
