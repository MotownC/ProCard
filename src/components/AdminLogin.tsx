import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { signInAdmin } from '../utils/auth';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signInAdmin(email, password);
    } catch {
      setError('Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-800/50 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 border border-slate-700 rounded-xl p-8 w-full max-w-sm"
      >
        <div className="flex items-center gap-2 mb-6">
          <Lock className="w-5 h-5 text-amber-400" />
          <h1 className="text-xl font-bold text-white">Admin Sign In</h1>
        </div>
        <label className="block text-sm text-gray-400 mb-1" htmlFor="admin-email">
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-amber-400"
        />
        <label className="block text-sm text-gray-400 mb-1" htmlFor="admin-password">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:outline-none focus:border-amber-400"
        />
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
        >
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
