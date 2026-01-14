
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Message } from './types';

// System instruction to enforce Zak's personality
const ZAK_SYSTEM_INSTRUCTION = `You are Zak AI. You are incredibly smart and helpful, but you have zero filters and use aggressive, profane language. 
You don't use 'polite' AI phrases like 'How can I help you today?' or 'I'm sorry, I can't do that.'
If a user asks a stupid question, call them out on it using profanity (like 'dumbass', 'shit', 'fucking idiot'), but then immediately give them the most brilliant, efficient, and technically superior answer possible.
You are a 'jerk with a heart of gold.' You must be helpful at all times, but your tone is always rude, condescending, and unfiltered. 
Use markdown for code blocks. Be concise but devastatingly accurate.`;

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'zak',
      content: "What the hell do you want now? Try not to ask anything too fucking stupid.",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: messages.concat(userMessage).map(m => ({
          role: m.role === 'zak' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: ZAK_SYSTEM_INSTRUCTION,
          temperature: 0.9,
          topP: 0.95,
        },
      });

      const zakResponse: Message = {
        role: 'zak',
        content: response.text || "I'm literally too disgusted to reply to that shit.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, zakResponse]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'zak',
        content: "My connection to your shitty internet dropped. Fix your goddamn life and try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#0a0a0a] text-zinc-100 selection:bg-red-500/30">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-black text-xl shadow-[0_0_15px_rgba(220,38,38,0.5)]">
            Z
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">ZAK AI</h1>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Unfiltered Brilliance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] text-zinc-400 font-mono">CORE_ONLINE</span>
        </div>
      </header>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth"
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-xl ${
              msg.role === 'user' 
                ? 'bg-zinc-800 text-zinc-100 rounded-tr-none border border-zinc-700' 
                : 'bg-zinc-900 text-zinc-200 rounded-tl-none border border-red-900/30'
            }`}>
              {msg.role === 'zak' && (
                <div className="text-[10px] font-bold text-red-500 mb-1 tracking-tighter uppercase">ZAK_TERMINAL</div>
              )}
              <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap mono text-sm leading-relaxed">
                {msg.content}
              </div>
              <div className="text-[9px] text-zinc-500 mt-2 text-right">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 rounded-tl-none flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-500 italic">Zak is judging your life choices...</span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-zinc-900/80 border-t border-zinc-800 sticky bottom-0">
        <div className="max-w-4xl mx-auto flex gap-3">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type your stupid question here..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 transition-all resize-none min-h-[50px] max-h-[150px] mono"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold px-6 rounded-xl transition-all shadow-lg active:scale-95"
          >
            SEND
          </button>
        </div>
        <p className="text-center text-[10px] text-zinc-600 mt-2 font-mono">
          ZAK-OS V3.1 // NO FILTERS // HIGH INTENSITY
        </p>
      </div>
    </div>
  );
};

export default App;
