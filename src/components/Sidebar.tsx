'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Icons, D2ILogo } from './ui/Icons';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Icons.Dashboard },
  { href: '/dashboard/modules', label: 'Modules', icon: Icons.Modules },
  { href: '/dashboard/workspace', label: 'Workspace', icon: Icons.Workspace },
  { href: '/dashboard/chat', label: 'Team Chat', icon: Icons.Chat },
  { href: '/dashboard/notes', label: 'My Notes', icon: Icons.Notes },
  { href: '/dashboard/team', label: 'Team', icon: Icons.Team },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, update } = useSession();
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    role: '',
    avatar: '👨‍💻',
  });

  const user = session?.user;

  // Update local state when session changes
  useEffect(() => {
    if (session?.user) {
      setProfileData({
        name: session.user.name || '',
        role: session.user.role || '',
        avatar: session.user.avatar || '👨‍💻',
      });
    }
  }, [session?.user]);

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (res.ok) {
        // Update the session with new data
        await update({
          ...session,
          user: {
            ...session?.user,
            ...profileData,
          },
        });
        setShowProfileEdit(false);
        // Refresh the page to show updated data
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const avatarOptions = ['👨‍💻', '👩‍💻', '🧠', '⚡', '🎨', '📊', '🚀', '💼', '🔧', '🎯'];

  return (
    <aside className="w-72 p-6 flex flex-col bg-d2i-navy-dark/80 border-r border-d2i-teal/20">
      <div className="mb-8">
        <D2ILogo />
      </div>

      {/* User Profile Card */}
      {user && (
        <div className="relative mb-6 p-4 rounded-2xl bg-gradient-to-br from-d2i-navy/80 to-d2i-navy-dark/80 border border-d2i-teal/20">
          <button
            onClick={() => {
              setProfileData({
                name: user.name || '',
                role: user.role || '',
                avatar: user.avatar || '👨‍💻',
              });
              setShowProfileEdit(!showProfileEdit);
            }}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-d2i-teal/20 text-d2i-cyan hover:bg-d2i-teal/30 transition-colors"
          >
            <Icons.Settings />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-lg bg-gradient-to-br from-d2i-teal to-d2i-cyan">
                {user.avatar || '👨‍💻'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-d2i-navy-dark" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">{user.name}</h3>
              <p className="text-sm truncate text-d2i-cyan">{user.role}</p>
            </div>
          </div>

          {/* Profile Edit Form */}
          {showProfileEdit && (
            <div className="mt-4 pt-4 space-y-3 border-t border-d2i-teal/30">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white bg-d2i-navy-dark border border-d2i-teal/40 focus:border-d2i-cyan focus:outline-none"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Role</label>
                <input
                  type="text"
                  value={profileData.role}
                  onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white bg-d2i-navy-dark border border-d2i-teal/40 focus:border-d2i-cyan focus:outline-none"
                  placeholder="Your role"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Avatar</label>
                <div className="flex flex-wrap gap-2">
                  {avatarOptions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setProfileData({ ...profileData, avatar: emoji })}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all"
                      style={{
                        backgroundColor: profileData.avatar === emoji ? 'rgba(37,226,204,0.3)' : '#002d44',
                        border: profileData.avatar === emoji ? '2px solid #25E2CC' : '1px solid rgba(0,115,127,0.3)',
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={saveProfile}
                disabled={isSaving}
                className="w-full py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-d2i-teal to-d2i-cyan hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-d2i-teal/30 to-d2i-cyan/20 border border-d2i-cyan/40 text-d2i-cyan'
                  : 'text-white/50 hover:text-white/80 hover:bg-d2i-navy/50 border border-transparent'
              }`}
            >
              <Icon />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all mt-4 text-white/50 hover:text-white/80 hover:bg-d2i-navy/50"
      >
        <Icons.Logout />
        <span>Logout</span>
      </button>
    </aside>
  );
}
