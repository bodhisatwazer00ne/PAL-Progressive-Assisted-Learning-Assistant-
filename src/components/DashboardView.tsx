import React from 'react';
import {
  ArrowUpRight,
  Award,
  BarChart3,
  Brain,
  CheckCircle2,
  CheckSquare,
  Clock,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { DashboardStats } from '../types';

interface DashboardViewProps {
  stats: DashboardStats;
  onStartTest: (subjectId: string, chapterId?: string, topicId?: string) => void;
  onViewAnalytics: () => void;
}

const SUBJECT_CONFIG: Record<string, { fill: string; bg: string; text: string; lightBg: string; name: string }> = {
  math: { fill: '#6366F1', bg: 'bg-indigo-600', text: 'text-indigo-700', lightBg: 'bg-indigo-50 border-indigo-100', name: 'Mathematics' },
  physics: { fill: '#0284C7', bg: 'bg-sky-600', text: 'text-sky-700', lightBg: 'bg-sky-50 border-sky-100', name: 'Physics' },
  chemistry: { fill: '#059669', bg: 'bg-emerald-600', text: 'text-emerald-700', lightBg: 'bg-emerald-50 border-emerald-100', name: 'Chemistry' },
  english: { fill: '#D97706', bg: 'bg-amber-600', text: 'text-amber-700', lightBg: 'bg-amber-50 border-amber-100', name: 'English' },
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  onStartTest,
  onViewAnalytics,
}) => {
  const activeSubjects = Object.keys(stats.subjectMastery);

  return (
    <div className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto max-w-7xl mx-auto w-full font-sans">
      {/* Sleek Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-sky-50 border border-sky-100 text-sky-700 text-xs font-bold rounded-lg uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-600" />
              Progress Summary
            </span>
            <span className="text-xs text-slate-400 font-semibold">Adaptive Engine Active</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">Learning Performance Overview</h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onViewAnalytics}
            className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer border border-slate-200/80 flex items-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5 text-slate-600" />
            <span>Full Telemetry</span>
          </button>
        </div>
      </div>

      {/* 4 Light Hero Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Overall Mastery */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all group">
          <div className="flex items-center justify-between">
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Overall Mastery</p>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
            {stats.overallMastery}
            <span className="text-sm font-bold text-slate-400 ml-1">/100</span>
          </h3>
          <div className="text-xs text-emerald-600 font-bold mt-2.5 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{stats.masteryDelta}% this week</span>
          </div>
        </div>

        {/* Accuracy Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-all group">
          <div className="flex items-center justify-between">
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Accuracy Rate</p>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
            {stats.accuracyRate}%
          </h3>
          <div className="text-xs text-emerald-600 font-bold mt-2.5 flex items-center gap-1">
            <span>High precision band</span>
          </div>
        </div>

        {/* Questions Attempted */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-sky-200 transition-all group">
          <div className="flex items-center justify-between">
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Attempted Questions</p>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
            {stats.totalQuestionsAttempted.toLocaleString()}
          </h3>
          <div className="text-xs text-slate-400 font-medium mt-2.5">
            Avg ~45 practice questions/day
          </div>
        </div>

        {/* Study Time */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-200 transition-all group">
          <div className="flex items-center justify-between">
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Study Time</p>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
            {stats.totalStudyHours}
            <span className="text-sm font-bold text-slate-400 ml-1">hrs</span>
          </h3>
          <div className="text-xs text-slate-400 font-medium mt-2.5">
            Active session time logged
          </div>
        </div>
      </div>

      {/* Middle Row: Mastery Trend Chart & AI Focus Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Mastery Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">Subject Mastery Trajectory</h4>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] text-slate-600 font-bold uppercase tracking-wider">
              Last 30 Days
            </span>
          </div>

          <div className="p-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.masteryTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px', padding: '10px 14px' }}
                  itemStyle={{ color: '#F1F5F9' }}
                />
                {activeSubjects.map((subKey) => {
                  const conf = SUBJECT_CONFIG[subKey] || { fill: '#64748B', name: subKey };
                  return (
                    <Bar
                      key={subKey}
                      dataKey={subKey}
                      fill={conf.fill}
                      radius={[6, 6, 0, 0]}
                      name={conf.name}
                    />
                  );
                })}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="px-5 py-3.5 bg-slate-50/70 flex justify-around text-xs font-bold text-slate-600 border-t border-slate-100 flex-wrap gap-3">
            {activeSubjects.map((subKey) => {
              const conf = SUBJECT_CONFIG[subKey] || { bg: 'bg-slate-500', text: 'text-slate-700', lightBg: 'bg-slate-100', name: subKey };
              return (
                <div key={subKey} className={`px-2.5 py-1 rounded-lg border flex items-center gap-2 ${conf.lightBg}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${conf.bg} inline-block`} />
                  <span className="text-[11px] font-extrabold">{conf.name}: {stats.subjectMastery[subKey]}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Focus Recommendation Card - Light, Modern Glassmorphic Design */}
        <div className="bg-gradient-to-br from-indigo-50/90 via-sky-50/60 to-blue-50/80 rounded-2xl border border-indigo-100/90 p-6 flex flex-col justify-between shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/30 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-indigo-600 rounded-lg text-white shadow-2xs">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <span className="text-xs font-extrabold text-indigo-700 uppercase tracking-wide">AI Recommended Focus</span>
            </div>

            <h4 className="text-base font-extrabold text-slate-900 leading-snug mb-2">{stats.aiRecommendation.title}</h4>

            <p className="text-slate-600 text-xs leading-relaxed mb-6 font-medium">
              "{stats.aiRecommendation.description}"
            </p>

            <button
              id="dash-start-test-btn"
              onClick={() =>
                onStartTest(
                  stats.aiRecommendation.actionSubjectId,
                  undefined,
                  stats.aiRecommendation.actionTopicId
                )
              }
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl text-xs font-extrabold w-full transition-all shadow-md shadow-indigo-200 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Start Adaptive Assessment Test</span>
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-indigo-100 relative z-10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Target Threshold
              </span>
              <span className="text-[11px] bg-white border border-indigo-100 px-2.5 py-0.5 rounded-md font-extrabold text-indigo-700 shadow-2xs">
                12% to Advanced Band
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Weak Concepts, Strong Concepts, Skill Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Priority Focus Areas (Weak Concepts) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-500" />
                <span>Priority Focus Areas</span>
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md">
                Needs Practice
              </span>
            </div>

            {stats.weakConcepts.length === 0 ? (
              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 text-center">
                <p className="text-xs text-slate-500 font-medium">No priority focus areas yet.</p>
                <p className="text-[11px] text-slate-400 mt-1">Take a test to identify concepts needing practice.</p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {stats.weakConcepts.map((m) => (
                  <li
                    key={m.conceptId}
                    onClick={() => onStartTest(m.subjectId, undefined, m.topicId)}
                    className="p-3 bg-slate-50/80 hover:bg-rose-50/50 rounded-xl cursor-pointer transition-all border border-slate-200/60 hover:border-rose-200 flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 group-hover:text-rose-950">{m.conceptName}</p>
                      <p className="text-[10px] text-slate-500 font-semibold capitalize mt-0.5">
                        {m.subjectId} • {m.conceptId.startsWith('g4_') || m.subjectId === 'english' ? '4th Standard' : 'Grade 10'}
                      </p>
                    </div>
                    <div className="text-xs font-extrabold text-rose-700 px-2.5 py-1 bg-white rounded-lg border border-rose-100 shadow-2xs">
                      {m.score}%
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Mastered Concepts */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" />
                <span>Mastered Concepts</span>
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
                High Mastery
              </span>
            </div>

            {stats.strongConcepts.length === 0 ? (
              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 text-center">
                <p className="text-xs text-slate-500 font-medium">No mastered concepts yet.</p>
                <p className="text-[11px] text-slate-400 mt-1">Complete assessments to build concept mastery.</p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {stats.strongConcepts.map((m) => (
                  <li
                    key={m.conceptId}
                    className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">{m.conceptName}</p>
                      <p className="text-[10px] text-slate-500 font-semibold capitalize mt-0.5">
                        {m.subjectId} • {m.conceptId.startsWith('g4_') || m.subjectId === 'english' ? '4th Standard' : 'Grade 10'}
                      </p>
                    </div>
                    <div className="text-xs font-extrabold text-emerald-700 px-2.5 py-1 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                      {m.score}%
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Question Type Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-4">
              Question Type Accuracy
            </h4>

            <div className="space-y-3">
              {Object.entries(stats.skillDistribution).map(([type, acc]) => (
                <div key={type} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 capitalize">{type.replace(/_/g, ' ')}</span>
                    <span className="font-extrabold text-indigo-700">{acc}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                      style={{ width: `${acc}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center border-t border-slate-100 pt-3">
            <button
              onClick={onViewAnalytics}
              className="text-xs text-indigo-600 font-extrabold hover:text-indigo-800 transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <span>View Detailed Analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
