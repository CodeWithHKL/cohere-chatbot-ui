"use client";

import { Plus, PanelLeftClose, ExternalLink, ShieldCheck } from "lucide-react";
import BrandMark from "./BrandMark";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onNewSession?: () => void;
}

export default function ChatSidebar({ isOpen, setIsOpen, onNewSession }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:relative z-50 h-dvh text-white
          bg-gradient-to-b from-[#b8141b] via-[#8f0f15] to-[#5c0a0e]
          transition-[width,transform] duration-300 ease-in-out flex flex-col overflow-hidden
          ${isOpen ? "w-72 md:w-64 translate-x-0" : "w-0 -translate-x-full md:translate-x-0"}
        `}
      >
        <div className="doodle absolute inset-0 pointer-events-none !opacity-[0.12] invert brightness-200" />

        <div className="relative w-72 md:w-64 flex flex-col h-full">
          <div className="h-16 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <BrandMark size={36} />
              <div className="leading-tight">
                <p className="text-sm font-semibold tracking-tight">UNITEN</p>
                <p className="text-[11px] text-white/70">AI Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close sidebar"
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>

          <div className="px-3 pt-2">
            <button
              onClick={onNewSession}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white text-[#a30f15] text-sm font-semibold shadow-sm hover:bg-white/90 active:scale-[0.98] transition"
            >
              <Plus size={16} strokeWidth={2.5} />
              New chat
            </button>
          </div>

          <div className="flex-1" />

          <div className="p-4 space-y-3 text-xs leading-relaxed text-white/75 border-t border-white/15">
            <p className="flex gap-2">
              <ShieldCheck size={14} className="shrink-0 mt-0.5" />
              <span>
                Answers are AI-generated and may be inaccurate. Messages are not stored by this
                site; they are processed by Cohere.
              </span>
            </p>
            <a
              href="https://github.com/CodeWithHKL/cohere-chatbot-ui"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-white hover:underline"
            >
              A concept project by HKL <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
