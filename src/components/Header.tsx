'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Icons } from './ui/Icons';

export function Header() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [profileData, setProfileData] = useState({
    name: '',
    role: '',
    avatar: '👨‍💻',
  });

  const user = session?.user as any;

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        role: user.role || '',
        avatar: user.avatar || '👨‍💻',
      });
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setShowProfileEdit(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (res.ok) {
        await update({
          ...session,
          user: { ...session?.user, ...profileData },
        });
        setShowProfileEdit(false);
        setShowDropdown(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const avatarOptions = ['👨‍💻', '👩‍💻', '🧠', '⚡', '🎨', '📊', '🚀', '💼', '🔧', '🎯'];

  if (!user) return null;

  return (
    <header className="h-16 flex items-center justify-end px-6 border-b border-d2i-teal/20">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => {
            setShowDropdown(!showDropdown);
            setShowProfileEdit(false);
          }}
          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-d2i-navy/50 transition-colors"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-d2i-cyan">{user.role}</p>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-gradient-to-br from-d2i-teal to-d2i-cyan">
            {user.avatar || '👨‍💻'}
          </div>
        </button>

        {showDropdown && !showProfileEdit && (
          <div className="absolute right-0 top-14 w-56 rounded-xl border border-d2i-teal/30 bg-d2i-navy-dark shadow-xl animate-fade-in z-50">
            <div className="p-3 border-b border-d2i-teal/20">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-d2i-cyan">{user.email}</p>
            </div>
            <div className="p-2">
              <button
                onClick={() => setShowProfileEdit(true)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-d2i-navy/50 transition-colors text-left"
              >
                <Icons.Settings />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-d2i-navy/50 transition-colors text-left"
              >
                <Icons.Logout />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {showDropdown && showProfileEdit && (
          <div className="absolute right-0 top-14 w-72 rounded-xl border border-d2i-teal/30 bg-d2i-navy-dark shadow-xl animate-fade-in z-50">
            <div className="p-4 border-b border-d2i-teal/20 flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">Edit Profile</h3>
              <button
                onClick={() => setShowProfileEdit(false)}
                className="text-white/50 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white bg-d2i-navy border border-d2i-teal/40 focus:border-d2i-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Role</label>
                <input
                  type="text"
                  value={profileData.role}
                  onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white bg-d2i-navy border border-d2i-teal/40 focus:border-d2i-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Avatar</label>
                <div className="flex flex-wrap gap-2">
                  {avatarOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setProfileData({ ...profileData, avatar: emoji })}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all"
                      style={{
                        backgroundColor: profileData.avatar === emoji ? 'rgba(37,226,204,0.3)' : '#003D5A',
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
          </div>
        )}
      </div>
    </header>
  );
}
