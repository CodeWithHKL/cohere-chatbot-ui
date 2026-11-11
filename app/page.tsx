"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowUp, PanelLeftOpen, GraduationCap, MapPin, FileText, Building2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import ChatSidebar from "../components/ChatSidebar";
import BrandMark from "../components/BrandMark";

interface Message {
  role: "bot" | "user";
  content: string;
  isError?: boolean;
}

const CHARACTER_LIMIT = 400;
const HISTORY_LIMIT = 10; // max previous messages sent to the bot

const SUGGESTIONS = [
  { icon: GraduationCap, title: "Programmes", text: "What programmes does UNITEN offer?" },
  { icon: MapPin, title: "Campus", text: "Where is the UNITEN campus?" },
  { icon: FileText, title: "Admission", text: "How do I apply for admission?" },
  { icon: Building2, title: "About", text: "Who owns UNITEN?" },
];

export default function CyberChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sidebar starts open on desktop only (on mobile it is an overlay)
  useEffect(() => {
    setSidebarOpen(window.matchMedia("(min-width: 768px)").matches);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || isLoading) return;

    // Last few real turns (no error notices) so the bot remembers the chat
    const history = messages
      .filter((m) => !m.isError)
      .slice(-HISTORY_LIMIT)
      .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content }));

    setMessages((prev) => [...prev, { role: "user", content }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, history }),
      });
      const data = await response.json().catch(() => null);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: data?.reply ?? "Something went wrong. Please try again.",
          isError: !response.ok,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Couldn't reach the server. Check your connection and try again.", isError: true },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const newChat = () => {
    setMessages([]);
    setInput("");
    if (!window.matchMedia("(min-width: 768px)").matches) setSidebarOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-dvh bg-canvas text-ink">
      <ChatSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onNewSession={newChat} />

      <main className="flex-1 flex flex-col min-w-0 relative">
        <div className="doodle absolute inset-0 pointer-events-none" aria-hidden />

        <header className="relative h-16 px-4 md:px-6 flex items-center gap-3 shrink-0 text-white bg-gradient-to-r from-[#c4141b] to-[#8f0f15] shadow-md shadow-red-950/20">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="p-2 -ml-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <PanelLeftOpen size={18} />
            </button>
          )}
          {/* The open sidebar already shows the logo, so hide this one then (avoids a double logo) */}
          <BrandMark size={36} className={sidebarOpen ? "md:hidden" : ""} />
          <div className="leading-tight min-w-0">
            <h1 className="text-sm font-semibold tracking-tight truncate">UNITEN Chatbot</h1>
            <p className="text-[11px] text-white/75 truncate">Universiti Tenaga Nasional</p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-white/85">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
            Online
          </span>
        </header>

        <div ref={scrollRef} className="relative flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
            {messages.length === 0 ? (
              <div className="min-h-[55vh] flex flex-col items-center justify-center text-center animate-rise">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-accent/30 blur-2xl rounded-full" aria-hidden />
                  <BrandMark size={64} className="relative" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">
                  Hi, I&apos;m the <span className="text-accent">UNITEN</span> assistant
                </h2>
                <p className="text-sm text-muted mb-10 max-w-md">
                  Ask me about programmes, admission, campus life and more. If I don&apos;t know the
                  answer, I&apos;ll say so.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 w-full max-w-xl text-left">
                  {SUGGESTIONS.map(({ icon: Icon, title, text }) => (
                    <button
                      key={text}
                      onClick={() => send(text)}
                      className="group flex items-start gap-3 p-4 rounded-2xl border border-line bg-panel/90 backdrop-blur-sm hover:border-accent hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-900/10 transition"
                    >
                      <span className="w-9 h-9 rounded-lg bg-accent/10 text-accent grid place-items-center shrink-0 group-hover:bg-accent group-hover:text-accent-ink transition-colors">
                        <Icon size={18} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{title}</span>
                        <span className="block text-sm text-muted">{text}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, i) =>
                  msg.role === "user" ? (
                    <div key={i} className="flex justify-end animate-rise">
                      <div className="max-w-[85%] md:max-w-[75%] px-4 py-2.5 rounded-2xl rounded-br-md bg-gradient-to-br from-[#d71920] to-[#a30f15] text-bubble-ink text-[15px] leading-relaxed whitespace-pre-wrap break-words shadow-md shadow-red-900/20">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="flex gap-3 animate-rise">
                      <BrandMark size={32} className="mt-0.5" />
                      <div
                        className={`md max-w-[85%] md:max-w-[75%] px-4 py-2.5 rounded-2xl rounded-tl-md border bg-panel text-[15px] leading-relaxed break-words min-w-0 ${
                          msg.isError ? "border-accent/50 text-accent" : "border-line"
                        }`}
                      >
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  )
                )}

                {isLoading && (
                  <div className="flex gap-3" aria-label="Bot is typing">
                    <BrandMark size={32} />
                    <div className="flex items-center gap-1 px-4 h-10 rounded-2xl rounded-tl-md border border-line bg-panel">
                      {[0, 1, 2].map((d) => (
                        <span
                          key={d}
                          className="w-1.5 h-1.5 rounded-full bg-accent"
                          style={{ animation: "typing 1.2s infinite", animationDelay: `${d * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="relative px-4 md:px-6 pb-4 md:pb-6 pt-2 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="max-w-3xl mx-auto flex items-center gap-2 pl-5 pr-2 py-2 rounded-full border border-line bg-panel shadow-lg shadow-red-900/5 focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/15 transition"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              maxLength={CHARACTER_LIMIT}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about UNITEN…"
              aria-label="Message"
              className="flex-1 min-w-0 bg-transparent py-2 text-[15px] outline-none placeholder:text-muted"
            />
            {input.length >= CHARACTER_LIMIT - 50 && (
              <span className="text-xs tabular-nums text-muted">
                {input.length}/{CHARACTER_LIMIT}
              </span>
            )}
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d71920] to-[#a30f15] text-accent-ink grid place-items-center shrink-0 hover:brightness-110 active:scale-95 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowUp size={18} strokeWidth={2.5} />
            </button>
          </form>
          <p className="max-w-3xl mx-auto mt-2 text-center text-[11px] text-muted">
            AI-generated answers may be inaccurate. Verify important details with UNITEN.
          </p>
        </div>
      </main>
    </div>
  );
}
