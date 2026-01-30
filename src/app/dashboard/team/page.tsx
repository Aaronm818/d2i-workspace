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
  const [team, setTeam] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await fetch('/api/team');
      const data = await res.json();
      if (data.users) {
        setTeam(data.users);
      }
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
        <h1 className="text-2xl font-bold text-white">Team Members</h1>
        <p className="text-d2i-cyan/80">{team.length} team members</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {team.map((member) => (
          <div
            key={member.id}
            className="p-5 rounded-2xl bg-gradient-to-br from-d2i-navy/90 to-d2i-navy-dark/90 border border-d2i-teal/20"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br from-d2i-teal/30 to-d2i-cyan/20">
                  {member.avatar || '👤'}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-d2i-navy-dark ${
                    member.online ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{member.name}</h3>
                <p className="text-sm text-d2i-cyan">{member.role}</p>
                <p className="text-xs text-white/40">{member.email}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
