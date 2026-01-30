'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Icons } from '@/components/ui/Icons';

interface Task {
  id: string;
  task: string;
  category: string;
  completed: boolean;
  verifiedBy?: { name: string } | null;
}

interface Module {
  id: string;
  name: string;
  description?: string;
  progress: number;
  status: string;
  tasks: Task[];
}

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  message: string;
  createdAt?: Date;
}

export default function WorkspacePage() {
  const { data: session } = useSession();
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch user's assigned modules
  useEffect(() => {
    fetchModules();
  }, []);

  // Load chat history when module changes
  useEffect(() => {
    if (selectedModule) {
      fetchChatHistory(selectedModule.id);
    }
  }, [selectedModule?.id]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchModules = async () => {
    try {
      const res = await fetch('/api/modules?assigned=true');
      const data = await res.json();
      setModules(data.modules || []);
      if (data.modules?.length > 0) {
        setSelectedModule(data.modules[0]);
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    } finally {
      setIsLoadingModules(false);
    }
  };

  const fetchChatHistory = async (moduleId: string) => {
    try {
      const res = await fetch(`/api/chat?moduleId=${moduleId}`);
      const data = await res.json();
      setChatMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedModule || isLoading) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    // Add user message optimistically
    setChatMessages((prev) => [...prev, { role: 'user', message: userMessage }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          moduleId: selectedModule.id,
          history: chatMessages.slice(-10), // Send last 10 messages for context
        }),
      });

      const data = await res.json();

      if (data.message) {
        setChatMessages((prev) => [...prev, { role: 'assistant', message: data.message }]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', message: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    if (!selectedModule) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, completed }),
      });

      if (res.ok) {
        // Refresh module to get updated progress
        const modulesRes = await fetch('/api/modules?assigned=true');
        const data = await modulesRes.json();
        setModules(data.modules || []);
        
        const updated = data.modules?.find((m: Module) => m.id === selectedModule.id);
        if (updated) setSelectedModule(updated);
      }
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  if (isLoadingModules) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-d2i-cyan animate-pulse">Loading workspace...</div>
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-d2i-navy mb-4">
          <Icons.Workspace className="w-8 h-8 text-d2i-cyan" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">No Modules Assigned</h2>
        <p className="text-white/50 max-w-md">
          You don't have any modules assigned yet. Ask your project lead to assign a module to you, or create one from the Modules page.
        </p>
      </div>
    );
  }

  const completedTasks = selectedModule?.tasks.filter((t) => t.completed).length || 0;
  const totalTasks = selectedModule?.tasks.length || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Module Selector */}
      {modules.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => setSelectedModule(module)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                selectedModule?.id === module.id
                  ? 'bg-gradient-to-r from-d2i-teal to-d2i-cyan text-white'
                  : 'bg-d2i-navy border border-d2i-teal/30 text-white/70 hover:text-white'
              }`}
            >
              {module.name}
            </button>
          ))}
        </div>
      )}

      {/* Module Header */}
      <div className="p-4 rounded-2xl flex items-center justify-between bg-gradient-to-r from-d2i-teal/20 to-d2i-cyan/10 border border-d2i-cyan/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-d2i-teal to-d2i-cyan text-white">
            <Icons.Code />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{selectedModule?.name}</h2>
            <p className="text-sm text-d2i-cyan">Assigned to: {session?.user?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{progress}%</p>
            <p className="text-xs text-d2i-cyan">
              {completedTasks}/{totalTasks} tasks
            </p>
          </div>
          <div className="w-16 h-16 relative">
            <svg className="w-16 h-16 -rotate-90">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#002d44" strokeWidth="4" />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="#25E2CC"
                strokeWidth="4"
                strokeDasharray={`${progress * 1.76} 176`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="grid grid-cols-5 gap-4" style={{ height: '500px' }}>
        {/* Chat Window */}
        <div className="col-span-3 flex flex-col rounded-2xl overflow-hidden bg-gradient-to-br from-d2i-navy/95 to-d2i-navy-dark/95 border border-d2i-teal/20">
          <div className="px-4 py-3 flex items-center gap-2 border-b border-d2i-teal/20">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-d2i-teal to-d2i-cyan">
              <span className="text-sm">🤖</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">AI Coding Assistant</p>
              <p className="text-xs text-d2i-cyan">Powered by Claude</p>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-auto space-y-3">
            {chatMessages.length === 0 && (
              <div className="text-center text-white/50 py-8">
                <p className="mb-2">👋 Ready to start building!</p>
                <p className="text-sm">Describe what you want to implement and I'll help you code it.</p>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md ${msg.role === 'user' ? 'order-1' : ''}`}>
                  <div
                    className="p-3 rounded-2xl"
                    style={{
                      background:
                        msg.role === 'user'
                          ? 'linear-gradient(135deg, rgba(0,115,127,0.4) 0%, rgba(37,226,204,0.3) 100%)'
                          : '#002d44',
                      border: `1px solid ${msg.role === 'user' ? 'rgba(37,226,204,0.3)' : 'rgba(0,115,127,0.2)'}`,
                    }}
                  >
                    <p className="text-sm text-white/90 whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="p-3 rounded-2xl bg-d2i-navy-dark border border-d2i-teal/20">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-d2i-cyan rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-d2i-cyan rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-2 h-2 bg-d2i-cyan rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 border-t border-d2i-teal/20">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Describe what you want to build..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/40 bg-d2i-navy-dark border border-d2i-teal/40 focus:border-d2i-cyan focus:outline-none transition-colors disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="p-2.5 text-white rounded-xl bg-gradient-to-r from-d2i-teal to-d2i-cyan hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Icons.Send />
              </button>
            </div>
          </div>
        </div>

        {/* Task Checklist */}
        <div className="col-span-2 flex flex-col rounded-2xl overflow-hidden bg-gradient-to-br from-d2i-navy/95 to-d2i-navy-dark/95 border border-d2i-teal/20">
          <div className="px-4 py-3 flex items-center justify-between border-b border-d2i-teal/20">
            <div>
              <p className="text-sm font-medium text-white">Task Checklist</p>
              <p className="text-xs text-d2i-cyan">Verified by Project Lead</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-d2i-teal/20 text-d2i-cyan">
              {completedTasks} done
            </span>
          </div>

          <div className="flex-1 p-3 overflow-auto space-y-2">
            {selectedModule?.tasks.map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-xl flex items-start gap-3 transition-all"
                style={{
                  background: task.completed ? 'rgba(0,115,127,0.15)' : 'transparent',
                  border: `1px solid ${task.completed ? 'rgba(37,226,204,0.3)' : 'rgba(0,115,127,0.15)'}`,
                }}
              >
                <button
                  onClick={() => toggleTask(task.id, !task.completed)}
                  className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                  style={{
                    background: task.completed
                      ? 'linear-gradient(135deg, #00737F 0%, #25E2CC 100%)'
                      : 'transparent',
                    border: `2px solid ${task.completed ? 'transparent' : 'rgba(0,115,127,0.5)'}`,
                  }}
                >
                  {task.completed && <Icons.Check className="text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${task.completed ? 'line-through text-white/50' : 'text-white/90'}`}
                  >
                    {task.task}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-d2i-navy-dark text-d2i-cyan/80">
                      {task.category}
                    </span>
                    {task.verifiedBy && (
                      <span className="text-xs text-d2i-cyan">✓ {task.verifiedBy.name}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {selectedModule?.tasks.length === 0 && (
              <p className="text-center text-white/50 py-8 text-sm">
                No tasks yet. Add tasks from the Modules page.
              </p>
            )}
          </div>

          <div className="p-3 border-t border-d2i-teal/20">
            <p className="text-xs text-center text-d2i-cyan/60">
              Tasks verified by <span className="text-d2i-cyan">Project Lead</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
