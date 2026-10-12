"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Zap, Terminal, Command, Menu, Loader2, ShieldCheck } from 'lucide-react';
import ChatSidebar from '../components/ChatSidebar';

interface Message {
  role: 'bot' | 'user' | 'system';
  content: string;
  time: string;
}

export default function CyberChat() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const CHARACTER_LIMIT = 400;
  const HISTORY_LIMIT = 10; // max previous messages sent to the bot

  useEffect(() => {
    setMounted(true);
    setMessages([
      {
        role: 'system',
        content: 'This chatbot is powered by Cohere AI. I don’t store or collect any of your data—everything is handled securely by Cohere, a trusted third party. Responses are AI-generated and may not always be accurate',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      { 
        role: 'bot', 
        content: 'UNITEN Chatbot is online! What can I help?', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }
    ]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentInput = input;

    // Send the last few user/bot turns (excluding system notices) so the bot remembers the chat
    const history = messages
      .filter(m => m.role === 'user' || m.role === 'bot')
      .slice(-HISTORY_LIMIT)
      .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }));

    const newUserMsg: Message = { role: 'user', content: currentInput, time: now };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, history }),
      });

      const data = await response.json();

      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: data.reply, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: "CRITICAL_ERROR: CONNECTION_LOST. UNABLE TO REACH HKLX SERVERS.", 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'system',
        content: 'KERNEL REBOOT INITIATED. MEMORY PURGED.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      { 
        role: 'bot', 
        content: 'SESSION RESET. KERNEL REBOOTED. STANDING BY.', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }
    ]);
  };

  if (!mounted) return <div className="bg-[#050505] h-screen w-screen" />;

  return (
    <div className="flex h-screen bg-[#050505] text-white font-mono selection:bg-[#ff0000] selection:text-black overflow-hidden">
      <ChatSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onNewSession={clearChat} />

      <main className="flex-1 flex flex-col relative min-w-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#ff0000]/5 blur-[140px] rounded-full pointer-events-none" />

        <header className="h-20 border-b border-white/10 flex items-center px-4 md:px-6 justify-between bg-black/40 backdrop-blur-xl z-20 shrink-0">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-2.5 hover:bg-white/5 border border-white/10 rounded-lg text-[#ff0000] transition-all">
                <Menu size={20} />
              </button>
            )}
            <div className="p-2 bg-white/5 border border-white/10 rounded-lg hidden sm:block">
                <Terminal size={18} className="text-[#ff0000]" />
            </div>
            <div>
                <h2 className="text-xs md:text-sm font-black uppercase tracking-[0.2em]">UNITEN CHATBOT V6.7</h2>
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
                  <p className="text-[8px] md:text-[9px] text-gray-500 font-bold tracking-widest uppercase">
                    {isLoading ? 'Scanning Database...' : 'Connection Initialized'}
                  </p>
                </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[#ff0000]">
            <span className="hidden md:block text-[9px] font-black tracking-widest opacity-40">HKL-VERCEL-PROTOCOL</span>
            <Zap size={18} className="animate-pulse" />
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 z-10 scrollbar-hide">
          <div className="max-w-4xl mx-auto space-y-8">
            {messages.map((msg, i) => (
              msg.role === 'system' ? (
                <div key={i} className="flex flex-col items-center justify-center py-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-white/10" />
                    <div className="flex items-center justify-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-full text-center">
                      <ShieldCheck size={10} className="text-[#ff0000] shrink-0" />
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">
                        {msg.content}
                      </span>
                    </div>
                    <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-white/10" />
                  </div>
                  <span className="text-[7px] text-gray-700 font-bold uppercase tracking-widest">Logged: {msg.time}</span>
                </div>
              ) : (
                <div key={i} className={`flex gap-3 md:gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-300 ${
                    msg.role === 'user' ? 'bg-[#ff0000] border-[#ff0000] text-black shadow-[0_0_15px_rgba(255,0,0,0.3)]' : 'bg-white/5 border-white/10 text-[#ff0000]'
                  }`}>
                    {msg.role === 'user' ? <User size={16} strokeWidth={3} /> : <Bot size={16} strokeWidth={3} />}
                  </div>
                  
                  <div className={`max-w-[85%] md:max-w-xl space-y-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block px-4 py-3 md:px-6 md:py-4 rounded-2xl text-[13px] md:text-sm font-bold tracking-tight leading-relaxed shadow-2xl ${
                      msg.role === 'user' ? 'bg-zinc-100 text-black rounded-tr-none' : 'bg-[#0f0f0f] border border-white/10 text-gray-300 rounded-tl-none border-l-2 border-l-[#ff0000]'
                    }`}>
                      {msg.content}
                    </div>
                    <div className={`flex items-center gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">
                         <span className="opacity-40">{msg.time}</span> // {msg.role === 'user' ? 'Admin' : 'UNITEN CHATBOT'}
                      </p>
                    </div>
                  </div>
                </div>
              )
            ))}

            {isLoading && (
              <div className="flex gap-3 md:gap-5 flex-row">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 text-[#ff0000]">
                  <Loader2 size={16} className="animate-spin" />
                </div>
                <div className="bg-[#0f0f0f] border border-white/10 px-4 py-3 rounded-2xl rounded-tl-none border-l-2 border-l-[#ff0000]">
                  <span className="text-[10px] text-gray-500 animate-pulse uppercase tracking-widest font-black">Querying Intelligence...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* This container has been adjusted with more bottom padding (pb-12 md:pb-20) to move the box up */}
        <div className="px-4 pt-4 pb-20 md:px-8 md:pt-8 md:pb-24 bg-gradient-to-t from-[#050505] to-transparent z-10">
          <div className="max-w-4xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-[#ff0000]/20 rounded-[1rem] md:rounded-[2rem] blur-lg opacity-0 group-focus-within:opacity-100 transition duration-700"></div>
              <div className="relative flex items-center bg-[#0a0a0a] border border-white/10 rounded-[1rem] md:rounded-[1.5rem] overflow-hidden backdrop-blur-md">
                <div className="pl-4 md:pl-6 text-gray-500 shrink-0"><Command size={18} /></div>
                
                <input
                  type="text"
                  disabled={isLoading}
                  value={input}
                  maxLength={CHARACTER_LIMIT}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={isLoading ? "PROCESSING..." : "ASK ABOUT UNITEN..."}
                  className="w-full bg-transparent border-none py-4 md:py-6 px-3 md:px-5 text-[11px] md:text-xs font-black focus:outline-none tracking-[0.2em] focus:outline-none placeholder:text-gray-800 disabled:opacity-50"
                />

                <div className="hidden sm:flex flex-col items-end mr-4 select-none">
                  <span className={`text-[9px] font-black tracking-tighter ${
                    input.length >= CHARACTER_LIMIT ? 'text-red-500' : 'text-gray-600'
                  }`}>
                    {input.length}/{CHARACTER_LIMIT}
                  </span>
                  <span className="text-[7px] text-gray-800 font-bold uppercase tracking-widest">Buffer</span>
                </div>
                
                <button 
                  onClick={handleSend}
                  disabled={isLoading}
                  className="mr-2 md:mr-4 p-2.5 md:p-4 bg-[#ff0000] text-black rounded-lg md:rounded-xl hover:bg-red-400 active:scale-90 flex items-center gap-2 px-5 md:px-8 shadow-[0_0_20px_rgba(255,0,0,0.2)] disabled:opacity-50"
                >
                  <span className="text-[10px] font-black uppercase tracking-tighter hidden sm:inline">Send</span>
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} strokeWidth={3} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}