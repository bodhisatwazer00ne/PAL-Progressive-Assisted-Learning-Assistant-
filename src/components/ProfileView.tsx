import React, { useState } from 'react';
import { Award, BookOpen, Clock, Save, Sparkles, User } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
}) => {
  const [name, setName] = useState<string>(profile.name || 'Alex Johnson');
  const [targetExamDate, setTargetExamDate] = useState<string>(profile.targetExamDate || '2026-03-15');
  const [weeklyGoalHours, setWeeklyGoalHours] = useState<number>(profile.weeklyStudyHoursGoal || 15);
  const [savedMessage, setSavedMessage] = useState<boolean>(false);

  const handleSave = () => {
    onUpdateProfile({
      name,
      targetExamDate,
      weeklyStudyHoursGoal: weeklyGoalHours,
    });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto max-w-3xl mx-auto w-full">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-indigo-200">
            {name ? name.charAt(0) : 'A'}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{name}</h2>
            <p className="text-xs text-slate-500 font-medium">
              Grade 10 • Primary Target: Math, Physics, Chemistry
            </p>
          </div>
        </div>

        {savedMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800">
            Profile settings saved successfully!
          </div>
        )}

        {/* Form Controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">
              Student Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">
              Target Exam Date
            </label>
            <input
              type="date"
              value={targetExamDate}
              onChange={(e) => setTargetExamDate(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">
              Weekly Practice Hours Goal: {weeklyGoalHours} Hours
            </label>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={weeklyGoalHours}
              onChange={(e) => setWeeklyGoalHours(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
