import React from 'react';
import { Award, Brain, LineChart, Target, Zap } from 'lucide-react';
import {
  Bar,
  BarChart,
  Line,
  LineChart as ReLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DashboardStats } from '../types';

interface AnalyticsViewProps {
  stats: DashboardStats;
}

const SUBJECT_CONFIG: Record<string, { stroke: string; name: string }> = {
  math: { stroke: '#6366F1', name: 'Mathematics' },
  physics: { stroke: '#3B82F6', name: 'Physics' },
  chemistry: { stroke: '#10B981', name: 'Chemistry' },
  english: { stroke: '#0EA5E9', name: 'English Grammar' },
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ stats }) => {
  const activeSubjects = Object.keys(stats.subjectMastery);

  const skillData = Object.entries(stats.skillDistribution).map(([type, acc]) => ({
    name: type.replace(/_/g, ' ').toUpperCase(),
    accuracy: acc,
  }));

  const diffLabels: Record<string, string> = {
    '1': 'Basic (Diff 1)',
    '2': 'Easy (Diff 2)',
    '3': 'Moderate (Diff 3)',
    '4': 'Difficult (Diff 4)',
    '5': 'Advanced (Diff 5)',
  };

  const diffData = Object.entries(stats.difficultyPerformance || {}).map(([diff, perf]) => {
    const acc = perf.attempted > 0 ? Math.round((perf.correct / perf.attempted) * 100) : 0;
    return {
      name: diffLabels[diff] || `Diff ${diff}`,
      accuracy: acc,
    };
  });

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-indigo-600" />
            <span>Detailed Learning & Mastery Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry on subject growth, question format proficiency, and difficulty band performance.
          </p>
        </div>
      </div>

      {/* Grid 1: Line Chart for Subject Mastery Trend */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
          <Brain className="w-4 h-4 text-indigo-600" />
          <span>Subject Mastery Growth Trend</span>
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ReLineChart data={stats.masteryTrend}>
              <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff' }}
              />
              {activeSubjects.map((subKey) => {
                const conf = SUBJECT_CONFIG[subKey] || { stroke: '#64748B', name: subKey };
                return (
                  <Line
                    key={subKey}
                    type="monotone"
                    dataKey={subKey}
                    stroke={conf.stroke}
                    strokeWidth={3}
                    name={conf.name}
                  />
                );
              })}
            </ReLineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid 2: Question Type Skill Bar + Difficulty Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Question Type Skill Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            <span>Question-Type Accuracy (%)</span>
          </h3>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillData} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" domain={[0, 100]} stroke="#94A3B8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={10} width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Bar dataKey="accuracy" fill="#4F46E5" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Difficulty Band Performance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Difficulty Band Accuracy (%)</span>
          </h3>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diffData}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} />
                <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Bar dataKey="accuracy" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
