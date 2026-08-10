import React, { useState } from 'react';
import { Lock, Mail, RotateCcw, User, UserCheck, UserPlus, Zap } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginViewProps {
  onLoginSuccess: (profile: Partial<UserProfile>) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('alex@student.pal');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (isRegister && !name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setIsLoading(true);

    const userName = isRegister && name.trim() ? name.trim() : email.split('@')[0].replace('.', ' ').toUpperCase();

    if (isRegister) {
      try {
        await fetch('/api/user/clear-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: userName, email }),
        });
      } catch (err) {
        console.error('Failed to clear data on registration:', err);
      }
    }

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        email,
        name: userName,
      });
    }, 300);
  };

  const handleQuickDemoSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        email: 'alex@student.pal',
        name: 'Alex Johnson',
      });
    }, 300);
  };

  const handleClearDataAndDemoSignIn = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/user/clear-data', { method: 'POST' });
    } catch (e) {
      console.error('Failed to clear data:', e);
    } finally {
      setIsLoading(false);
      onLoginSuccess({
        email: 'alex@student.pal',
        name: 'Alex Johnson',
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 font-sans text-slate-800">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-8 sm:p-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-2xl text-white font-black text-2xl shadow-md shadow-indigo-100 mb-1">
            P
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            PAL Progressive Assisted Learning Platform
          </h1>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setErrorMessage(''); }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
              !isRegister
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setErrorMessage(''); }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
              isRegister
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Account</span>
          </button>
        </div>

        {/* Action Buttons Section */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              id="quick-demo-login-btn"
              onClick={handleQuickDemoSignIn}
              disabled={isLoading}
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Demo Sign In</span>
            </button>

            <button
              type="button"
              id="clear-data-demo-btn"
              onClick={handleClearDataAndDemoSignIn}
              disabled={isLoading}
              className="px-4 py-3 bg-white hover:bg-rose-50 border border-rose-200 hover:border-rose-300 text-rose-700 disabled:opacity-50 font-bold text-xs rounded-xl transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <span>Clear Data & Demo</span>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {errorMessage && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200">
              {errorMessage}
            </div>
          )}

          {/* Name Field (Register Mode Only) */}
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  required={isRegister}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 font-medium text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@pal.school"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 font-medium text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 font-medium text-xs text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="login-submit-btn"
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-indigo-100 cursor-pointer active:scale-98 flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isRegister ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Register & Sign In</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};


