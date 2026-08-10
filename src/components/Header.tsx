import React from 'react';
import { Flame, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  title: string;
  profile: UserProfile;
  onProfileClick: () => void;
  onGradeChange?: (newGrade: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  profile,
  onProfileClick,
  onGradeChange,
}) => {
  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-10">
      {/* Title & Grade Selector */}
      <div className="flex items-center gap-4">
        {/* Grade Selector Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-xl text-xs font-bold text-sky-900 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span className="text-[11px] uppercase tracking-wider text-sky-600 font-extrabold hidden sm:inline">Grade:</span>
          <select
            id="header-grade-select"
            value={profile.grade || 'Grade 10'}
            onChange={(e) => onGradeChange && onGradeChange(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer pr-1"
          >
            <option value="Grade 10">Grade 10 (Math, Physics, Chem)</option>
            <option value="4th Standard">4th Standard (Math & English)</option>
          </select>
        </div>

        <span className="h-4 w-px bg-slate-200 hidden sm:block" />
        <h2 className="font-extrabold text-slate-800 text-base sm:text-lg tracking-tight">{title}</h2>
      </div>

      {/* Controls & Profile */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Streak Pill */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-orange-600 bg-orange-50 border border-orange-100 px-3.5 py-1.5 rounded-full shadow-2xs">
          <Flame className="w-4 h-4 fill-orange-500 text-orange-500 shrink-0" />
          <span>{profile.dailyStreak || 8} Day Streak</span>
        </div>

        {/* User Avatar & Name */}
        <button
          id="header-user-avatar"
          onClick={onProfileClick}
          className="flex items-center gap-3 pl-2 pr-3 py-1 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-sm shadow-2xs">
            {profile.name ? profile.name.charAt(0) : 'A'}
          </div>
          <div className="text-left hidden md:block">
            <p className="text-xs font-bold text-slate-800 leading-none">{profile.name}</p>
            <p className="text-[10px] font-semibold text-sky-600 mt-0.5">{profile.grade || 'Grade 10'}</p>
          </div>
        </button>
      </div>
    </header>
  );
};
