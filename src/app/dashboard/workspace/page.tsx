'use client';

import { useState, useRef, useEffect } from 'react';
import { Icons } from '@/components/ui/Icons';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function WorkspacePage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Workspace</h1>
        <p className="text-d2i-cyan/80">Chat with Claude to get help with your code</p>
      </div>

      <div
        className="flex flex-col rounded-2xl overflow-hidden bg-gradient-to-br from-d2i-navy/90 to-d2i-navy-dark/90 border border-d2i-teal/20"
        style={{ height: '500px' }}
      >
        <div className="flex-1 p-6 overflow-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-white/50 py-12">
              <div className="text-4xl mb-4">🤖</div>
              <p className="text-lg">Hello! I&apos;m your AI coding assistant.</p>
              <p className="text-sm mt-2">Ask me about code, architecture, debugging, or anything else!</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-d2i-teal/30 to-d2i-cyan/20'
                    : 'bg-d2i-navy-dark'
                }`}
              >
                <p className="text-sm text-white/85 whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="p-4 rounded-2xl bg-d2i-navy-dark">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-d2i-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-d2i-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-d2i-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-d2i-teal/20">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything about coding..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl bg-d2i-navy-dark border border-d2i-teal/40 text-white placeholder-white/40 focus:border-d2i-cyan focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="p-3 text-white rounded-xl bg-gradient-to-r from-d2i-teal to-d2i-cyan hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Icons.Send />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
