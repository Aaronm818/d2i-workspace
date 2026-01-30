'use client';

import { useState, useEffect } from 'react';
import { Icons } from '@/components/ui/Icons';

interface User {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface Task {
  id: string;
  task: string;
  category: string;
  completed: boolean;
}

interface Module {
  id: string;
  name: string;
  description?: string;
  status: string;
  progress: number;
  assignee?: User | null;
  tasks: Task[];
}

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newModule, setNewModule] = useState({ name: '', description: '', assigneeId: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [modulesRes, usersRes] = await Promise.all([
        fetch('/api/modules'),
        fetch('/api/team'),
      ]);
      const modulesData = await modulesRes.json();
      const usersData = await usersRes.json();
      setModules(modulesData.modules || []);
      setUsers(usersData.users || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createModule = async () => {
    if (!newModule.name) return;

    try {
      // For now, we'll need to create a default project first or use an existing one
      // This is a simplified version - in production you'd have project selection
      const res = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newModule,
          projectId: 'default', // You'll need to handle this properly
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewModule({ name: '', description: '', assigneeId: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create module:', error);
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
          <h1 className="text-2xl font-bold text-white">Modules</h1>
          <p className="text-d2i-cyan/80">Manage project modules and assignments</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl text-white font-medium bg-gradient-to-r from-d2i-teal to-d2i-cyan hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Icons.Plus className="w-4 h-4" />
          New Module
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {modules.map((module) => (
          <div
            key={module.id}
            className="p-5 rounded-2xl transition-all card-hover bg-gradient-to-br from-d2i-navy/90 to-d2i-navy-dark/90 border border-d2i-teal/30"
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className="text-xs px-2 py-1 rounded-full capitalize"
                style={{
                  backgroundColor:
                    module.status === 'review'
                      ? 'rgba(37,226,204,0.25)'
                      : module.status === 'in-progress'
                      ? 'rgba(0,115,127,0.25)'
                      : module.status === 'complete'
                      ? 'rgba(16,185,129,0.25)'
                      : '#003D5A',
                  color:
                    module.status === 'review'
                      ? '#25E2CC'
                      : module.status === 'in-progress'
                      ? '#25E2CC'
                      : module.status === 'complete'
                      ? '#10b981'
                      : 'rgba(255,255,255,0.5)',
                }}
              >
                {module.status.replace('-', ' ')}
              </span>
              <span className="text-sm text-d2i-cyan/80">{module.progress}%</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{module.name}</h3>
            <p className="text-sm text-white/50 mb-4">
              Assigned to: {module.assignee?.name || 'Unassigned'}
            </p>
            <div className="h-2 rounded-full overflow-hidden bg-d2i-navy-dark">
              <div
                className="h-full rounded-full bg-gradient-to-r from-d2i-teal to-d2i-cyan"
                style={{ width: `${module.progress}%` }}
              />
            </div>
            <div className="mt-4 pt-4 border-t border-d2i-teal/20">
              <p className="text-xs text-white/40">
                {module.tasks.filter((t) => t.completed).length}/{module.tasks.length} tasks completed
              </p>
            </div>
          </div>
        ))}

        {/* Add Module Card */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="p-5 rounded-2xl border-2 border-dashed border-d2i-teal/40 flex flex-col items-center justify-center gap-2 text-d2i-cyan/80 hover:text-d2i-cyan hover:border-d2i-cyan/60 transition-all card-hover"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl bg-d2i-navy">
            <Icons.Plus />
          </div>
          <span className="text-sm font-medium">Add Module</span>
        </button>
      </div>

      {modules.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/50">No modules yet. Create your first module to get started!</p>
        </div>
      )}

      {/* Create Module Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-d2i-navy-dark border border-d2i-teal/30 rounded-2xl p-6 w-full max-w-md animate-slide-up">
            <h2 className="text-xl font-semibold text-white mb-4">Create New Module</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Module name"
                value={newModule.name}
                onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-d2i-navy border border-d2i-teal/40 text-white placeholder-white/40 focus:border-d2i-cyan focus:outline-none"
              />
              <textarea
                placeholder="Description (optional)"
                value={newModule.description}
                onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-d2i-navy border border-d2i-teal/40 text-white placeholder-white/40 focus:border-d2i-cyan focus:outline-none resize-none"
                rows={3}
              />
              <select
                value={newModule.assigneeId}
                onChange={(e) => setNewModule({ ...newModule, assigneeId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-d2i-navy border border-d2i-teal/40 text-white focus:border-d2i-cyan focus:outline-none"
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 rounded-xl border border-d2i-teal/40 text-white/70 hover:text-white hover:border-d2i-teal transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createModule}
                disabled={!newModule.name}
                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-d2i-teal to-d2i-cyan text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
