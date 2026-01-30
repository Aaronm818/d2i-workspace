'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Icons } from '@/components/ui/Icons';

// For MVP, this is a UI mockup - real-time chat would require WebSockets/Pusher
export default function ChatPage() {
  const { data: session } = useSession();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { user: 'Mark H.', message: 'The data profiling needs human review before AI corrections', time: '10:30 AM', avatar: '🧠' },
    { user: 'Michael', message: 'Agreed. I think we should have response plans as documents', time: '10:32 AM', avatar: '⚡' },
    { user: 'Aaron', message: 'I can refine the checkbox interface from yesterday for that', time: '10:35 AM', avatar: '👨‍💻' },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;
    
    setMessages([
      ...messages,
      {
        user: session?.user?.name?.split(' ')[0] || 'You',
        message: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: session?.user?.avatar || '👤',
      },
    ]);
    setMessage('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Team Chat</h1>
        <p className="text-d2i-cyan/80">Communicate with your team</p>
      </div>

      <div
        className="flex flex-col rounded-2xl overflow-hidden bg-gradient-to-br from-d2i-navy/90 to-d2i-navy-dark/90 border border-d2i-teal/20"
        style={{ height: '500px' }}
      >
        {/* Messages */}
        <div className="flex-1 p-6 overflow-auto space-y-4">
          {messages.map((msg, i) => {
            const isMe = msg.user === session?.user?.name?.split(' ')[0] || msg.user === 'You';
            return (
              <div key={i} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,115,127,0.5) 0%, #003D5A 100%)',
                  }}
                >
                  {msg.avatar}
                </div>
                <div className={`max-w-md ${isMe ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">{msg.user}</span>
                    <span className="text-xs text-d2i-cyan/60">{msg.time}</span>
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
              className="flex-1 px-4 py-3 rounded-xl bg-d2i-navy-dark border border-d2i-teal/40 text-white placeholder-white/40 focus:border-d2i-cyan focus:outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim()}
              className="p-3 text-white rounded-xl bg-gradient-to-r from-d2i-teal to-d2i-cyan hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Icons.Send />
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-white/40 text-sm">
        💡 For real-time chat, integrate with Pusher or Railway's built-in WebSocket support
      </p>
    </div>
  );
}
