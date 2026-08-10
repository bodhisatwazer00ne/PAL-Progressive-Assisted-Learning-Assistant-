import React, { useState } from 'react';
import {
  BookOpen,
  CheckSquare,
  Clock,
  Flame,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { Grade, TestConfig, TestMode } from '../types';

interface TestSetupViewProps {
  curriculum: Grade;
  onStartTest: (config: TestConfig) => void;
  defaultSubjectId?: string;
  defaultChapterId?: string;
  defaultTopicId?: string;
}

export const TestSetupView: React.FC<TestSetupViewProps> = ({
  curriculum,
  onStartTest,
  defaultSubjectId = 'physics',
  defaultChapterId = 'phys_elec',
  defaultTopicId = 'phys_elec_ohm',
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => {
    return curriculum.subjects.some((s) => s.id === defaultSubjectId)
      ? defaultSubjectId
      : curriculum.subjects[0]?.id || 'math';
  });
  const [selectedChapterId, setSelectedChapterId] = useState<string>(defaultChapterId);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(defaultTopicId);
  const [mode, setMode] = useState<TestMode>('adaptive');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(15);

  // Sync selectedSubjectId if curriculum changes
  React.useEffect(() => {
    if (!curriculum.subjects.some((s) => s.id === selectedSubjectId)) {
      const fallbackSub = curriculum.subjects[0]?.id || 'math';
      setSelectedSubjectId(fallbackSub);
      const sub = curriculum.subjects.find((s) => s.id === fallbackSub);
      if (sub && sub.chapters[0]) {
        setSelectedChapterId(sub.chapters[0].id);
        setSelectedTopicId('all');
      }
    }
  }, [curriculum, selectedSubjectId]);

  const subject = curriculum.subjects.find((s) => s.id === selectedSubjectId) || curriculum.subjects[0];
  const chapter = subject?.chapters.find((c) => c.id === selectedChapterId);

  const modes: { id: TestMode; title: string; desc: string; icon: any }[] = [
    {
      id: 'adaptive',
      title: 'Adaptive & Progressive Test',
      desc: 'One single test that progressively advances through concepts and auto-adjusts difficulty item-by-item.',
      icon: Flame,
    },
    {
      id: 'weak_area',
      title: 'Weak Area Focus Test',
      desc: 'Targeted test focusing specifically on your lowest mastery concepts.',
      icon: Target,
    },
    {
      id: 'revision',
      title: 'Mistake Revision Test',
      desc: 'Re-tests concepts where you previously made mistakes.',
      icon: RotateCcw,
    },
  ];

  const handleLaunch = () => {
    onStartTest({
      subjectId: selectedSubjectId,
      chapterId: selectedChapterId,
      topicId: selectedTopicId,
      mode,
      questionCount,
      timeLimitMinutes,
      grade: curriculum.id || curriculum.name,
    });
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto max-w-4xl mx-auto w-full">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-8">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-600" />
            <span>Configure Assessment Test</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Select subject, full chapter or topic scope, test mode, and timing parameters.
          </p>
        </div>

        {/* Subject & Chapter & Topic selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                const newSubId = e.target.value;
                setSelectedSubjectId(newSubId);
                const sub = curriculum.subjects.find((s) => s.id === newSubId);
                if (sub && sub.chapters[0]) {
                  setSelectedChapterId(sub.chapters[0].id);
                  if (sub.chapters[0].topics[0]) {
                    setSelectedTopicId(sub.chapters[0].topics[0].id);
                  }
                } else {
                  setSelectedChapterId('all');
                  setSelectedTopicId('all');
                }
              }}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-sm text-slate-800"
            >
              {curriculum.subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Chapter */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Chapter Scope</label>
            <select
              value={selectedChapterId}
              onChange={(e) => {
                const newChapId = e.target.value;
                setSelectedChapterId(newChapId);
                if (newChapId === 'all') {
                  setSelectedTopicId('all');
                } else {
                  const ch = subject.chapters.find((c) => c.id === newChapId);
                  if (ch && ch.topics[0]) {
                    setSelectedTopicId('all'); // default to all topics of chapter
                  }
                }
              }}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-sm text-slate-800"
            >
              <option value="all">All Chapters ({subject.name})</option>
              {subject.chapters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Topic Scope</label>
            <select
              value={selectedTopicId}
              disabled={selectedChapterId === 'all'}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-sm text-slate-800 disabled:opacity-60"
            >
              <option value="all">All Topics of Chapter</option>
              {chapter?.topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scope Context Info Pill */}
        <div className="p-3.5 bg-indigo-50/80 rounded-xl border border-indigo-100 flex items-center justify-between text-xs font-semibold text-indigo-900">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              Target Coverage:{' '}
              <strong className="text-indigo-950 font-black">
                {selectedChapterId === 'all'
                  ? `Full ${subject.name} Subject (${subject.chapters.length} Chapters)`
                  : selectedTopicId === 'all'
                  ? `Full Chapter: ${chapter?.name || 'Selected Chapter'}`
                  : chapter?.topics.find((t) => t.id === selectedTopicId)?.name || 'Selected Topic'}
              </strong>
            </span>
          </div>
        </div>

        {/* Mode Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-3 uppercase">Select Test Mode</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {modes.map((m) => {
              const Icon = m.icon;
              const isSelected = mode === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-snug">{m.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Length & Time Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">
              Number of Questions: {questionCount}
            </label>
            <input
              type="range"
              min="3"
              max="15"
              step="1"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
              <span>3 Qs (Quick)</span>
              <span>10 Qs (Standard)</span>
              <span>15 Qs (Comprehensive)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">
              Time Limit: {timeLimitMinutes} Minutes
            </label>
            <input
              type="range"
              min="5"
              max="30"
              step="5"
              value={timeLimitMinutes}
              onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
              <span>5 mins</span>
              <span>15 mins</span>
              <span>30 mins</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 flex justify-end">
          <button
            id="start-test-btn"
            onClick={handleLaunch}
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-indigo-200 cursor-pointer active:scale-98 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate & Start Adaptive Test</span>
          </button>
        </div>
      </div>
    </div>
  );
};
