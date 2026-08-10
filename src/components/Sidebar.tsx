import React from 'react';
import {
  BookMarked,
  BookOpen,
  CheckSquare,
  Clock,
  LayoutDashboard,
  LineChart,
  LogOut,
  RotateCcw,
  User,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'curriculum'
  | 'test'
  | 'mistakes'
  | 'notes'
  | 'analytics'
  | 'study-plan'
  | 'profile';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  weeklyProgress: { covered: number; total: number };
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  weeklyProgress,
  onLogout,
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'curriculum' as NavTab, label: 'Curriculum', icon: BookOpen },
    { id: 'test' as NavTab, label: 'Topic Assessment Tests', icon: CheckSquare },
    { id: 'mistakes' as NavTab, label: 'Mistake Tracker', icon: RotateCcw },
    { id: 'notes' as NavTab, label: 'Saved Explanations', icon: BookMarked },
    { id: 'analytics' as NavTab, label: 'Analytics', icon: LineChart },
    { id: 'study-plan' as NavTab, label: 'Weekly Plan', icon: Clock },
    { id: 'profile' as NavTab, label: 'Profile', icon: User },
  ];

  const progressPercent = Math.min(
    100,
    Math.round((weeklyProgress.covered / weeklyProgress.total) * 100)
  );

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 h-screen sticky top-0 select-none justify-between">
      <div>
        {/* Brand Logo */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-9 h-9 bg-sky-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm shadow-sky-200">
              P
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                PAL
              </span>
              <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest mt-0.5">
                Assisted Learning
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs border border-sky-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div>
        {/* Weekly Goal Widget */}
        <div className="p-4 bg-slate-50 mx-4 mb-3 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Weekly Progress
            </p>
            <span className="text-xs font-bold text-indigo-600">{progressPercent}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 mt-2 font-medium">
            {weeklyProgress.covered}/{weeklyProgress.total} Topics Covered
          </p>
        </div>

        {/* Logout Option */}
        {onLogout && (
          <div className="p-4 pt-0">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-500 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
