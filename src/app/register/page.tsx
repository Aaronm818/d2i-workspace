'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Developer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
      } else {
        router.push('/login');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-d2i-navy-dark via-d2i-navy to-d2i-teal">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse bg-d2i-cyan/10" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-pulse bg-d2i-teal/15" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-d2i-teal to-d2i-cyan shadow-lg">
              <svg viewBox="0 0 24 24" className="w-10 h-10" fill="white">
                <path d="M4 4h4v16H4V4zm6 0h4v16h-4V4zm6 0h4v16h-4V4z" opacity="0.6"/>
                <circle cx="12" cy="12" r="3" fill="white"/>
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">D2I</h1>
          <p className="text-d2i-cyan">Data to Intelligence</p>
        </div>

        {/* Register form */}
        <div className="p-8 rounded-3xl glass">
          <h2 className="text-xl font-semibold text-white mb-6">Create Account</h2>
          
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-d2i-navy border border-d2i-teal/40 text-white placeholder-white/40 focus:border-d2i-cyan transition-colors"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-d2i-navy border border-d2i-teal/40 text-white placeholder-white/40 focus:border-d2i-cyan transition-colors"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl bg-d2i-navy border border-d2i-teal/40 text-white placeholder-white/40 focus:border-d2i-cyan transition-colors"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-d2i-navy border border-d2i-teal/40 text-white focus:border-d2i-cyan transition-colors"
            >
              <option value="Developer">Developer</option>
              <option value="AI Engineer">AI Engineer</option>
              <option value="Architect">Architect</option>
              <option value="Project Lead">Project Lead</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-d2i-teal to-d2i-cyan hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center mt-4 text-sm text-white/50">
            Already have an account?{' '}
            <Link href="/login" className="text-d2i-cyan hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
