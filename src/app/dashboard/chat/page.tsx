'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Icons } from '@/components/ui/Icons';

interface ChatMessage {
  id: string;
  message: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
}

export default function ChatPage() {
  const { data: session } = useSession();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages on load and poll for new ones
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/team-chat?projectId=default');
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    const tempMessage = message;
    setMessage('');

    try {
      const res = await fetch('/api/team-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: tempMessage, projectId: 'default' }),
      });

      if (res.ok) {
        // Fetch latest messages to get the new one with proper data
        await fetchMessages();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessage(tempMessage); // Restore message if failed
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-d2i-cyan animate-pulse">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Team Chat</h1>
        <p className="text-d2i-cyan/80">Communicate with your team in real-time</p>
      </div>

      <div
        className="flex flex-col rounded-2xl overflow-hidden bg-gradient-to-br from-d2i-navy/90 to-d2i-navy-dark/90 border border-d2i-teal/20"
        style={{ height: '500px' }}
      >
        {/* Messages */}
        <div className="flex-1 p-6 overflow-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-white/50 py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}
          {messages.map((msg) => {
            const isMe = msg.user.id === session?.user?.id;
            return (
              <div key={msg.id} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,115,127,0.5) 0%, #003D5A 100%)',
                  }}
                >
                  {msg.user.avatar || '👤'}
                </div>
                <div className={`max-w-md ${isMe ? 'text-right' : ''}`}>
                  <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <span className="text-sm font-medium text-white">{msg.user.name}</span>
                    <span className="text-xs text-d2i-cyan/60">{formatTime(msg.createdAt)}</span>
                  </div>
                  <div
                    className="p-4 rounded-2xl"
                    style={{
                      background: isMe
                        ? 'linear-gradient(135deg, rgba(0,115,127,0.3) 0%, rgba(37,226,204,0.2) 100%)'
                        : 'rgba(0,45,68,0.8)',
                    }}
                  >
                    <p className="text-sm text-white/85">{msg.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-d2i-teal/20">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              disabled={isSending}
              className="flex-1 px-4 py-3 rounded-xl bg-d2i-navy-dark border border-d2i-teal/40 text-white placeholder-white/40 focus:border-d2i-cyan focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim() || isSending}
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
