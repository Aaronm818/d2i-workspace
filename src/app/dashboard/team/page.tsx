'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  online: boolean;
}

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await fetch('/api/team');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch team:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-d2i-cyan animate-pulse">Loading team...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Team</h1>
        <p className="text-d2i-cyan/80">Your project team members</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {users.map((member) => (
          <div
            key={member.id}
            className="p-6 rounded-2xl bg-gradient-to-br from-d2i-navy/90 to-d2i-navy-dark/90 border border-d2i-teal/30 card-hover"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,115,127,0.4) 0%, #003D5A 100%)',
                  }}
                >
                  {member.avatar}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${
                    member.online ? 'bg-emerald-500' : 'bg-slate-500'
                  }`}
                  style={{ border: '2px solid #002d44' }}
                />
              </div>
              <div>
                <h3 className="font-semibold text-white">{member.name}</h3>
                <p className="text-sm text-d2i-cyan">{member.role}</p>
              </div>
            </div>
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{
                backgroundColor: member.online ? 'rgba(16, 185, 129, 0.2)' : '#003D5A',
                color: member.online ? '#10b981' : 'rgba(255,255,255,0.5)',
              }}
            >
              {member.online ? 'Online' : 'Offline'}
            </span>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/50">No team members yet. Invite people to join your project!</p>
        </div>
      )}
    </div>
  );
}
