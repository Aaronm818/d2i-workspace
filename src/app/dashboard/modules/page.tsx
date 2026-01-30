'use client';

import { useState, useEffect } from 'react';

interface Module {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  assignee?: {
    id: string;
    name: string;
    avatar: string;
  };
  tasks: { id: string; completed: boolean }[];
}

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const res = await fetch('/api/modules');
      const data = await res.json();
      if (data.modules) {
        const withProgress = data.modules.map((m: any) => ({
          ...m,
          progress: m.tasks.length > 0 
            ? Math.round((m.tasks.filter((t: any) => t.completed).length / m.tasks.length) * 100)
            : 0,
        }));
        setModules(withProgress);
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-d2i-cyan animate-pulse">Loading modules...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Project Modules</h1>
          <p className="text-d2i-cyan/80">Track progress across all modules</p>
        </div>
      </div>

      <div className="grid gap-4">
        {modules.map((module) => (
          <div
            key={module.id}
            className="p-5 rounded-2xl bg-gradient-to-br from-d2i-navy/90 to-d2i-navy-dark/90 border border-d2i-teal/20"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white">{module.name}</h3>
                <p className="text-sm text-white/50">{module.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {module.assignee && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-d2i-navy-dark">
                    <span>{module.assignee.avatar}</span>
                    <span className="text-sm text-white/70">{module.assignee.name}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-2 bg-d2i-navy-dark rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-d2i-teal to-d2i-cyan transition-all"
                  style={{ width: `${module.progress}%` }}
                />
              </div>
              <span className="text-sm text-d2i-cyan">{module.progress}%</span>
            </div>
            <div className="mt-3 text-xs text-white/50">
              {module.tasks.filter(t => t.completed).length} of {module.tasks.length} tasks completed
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
