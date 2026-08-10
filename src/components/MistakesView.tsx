import React, { useState } from 'react';
import {
  AlertCircle,
  BookMarked,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Filter,
  Lightbulb,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { MistakeRecord, SavedNote } from '../types';

interface MistakesViewProps {
  mistakes: MistakeRecord[];
  onResolveMistake: (mistakeId: string) => void;
  onStartTest: (subjectId: string, chapterId?: string, topicId?: string) => void;
  onSaveExplanation?: (noteData: Partial<SavedNote>) => void;
}

export const MistakesView: React.FC<MistakesViewProps> = ({
  mistakes,
  onResolveMistake,
  onStartTest,
  onSaveExplanation,
}) => {
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterResolved, setFilterResolved] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [savedNotesMap, setSavedNotesMap] = useState<Record<string, boolean>>({});

  // Extract unique dates from mistakes
  const dates = Array.from<string>(
    new Set(
      mistakes
        .map((m) => {
          try {
            return new Date(m.createdAt).toISOString().split('T')[0];
          } catch {
            return '';
          }
        })
        .filter((d) => d !== '')
    )
  ).sort((a, b) => (a < b ? 1 : -1));

  const filtered = mistakes.filter((m) => {
    if (filterSubject !== 'all' && m.subjectId !== filterSubject) return false;
    if (filterResolved !== m.resolved) return false;

    if (selectedDate !== 'all') {
      try {
        const itemDate = new Date(m.createdAt).toISOString().split('T')[0];
        if (itemDate !== selectedDate) return false;
      } catch {
        return true;
      }
    }
    return true;
  });

  const handleSaveNote = (m: MistakeRecord) => {
    if (onSaveExplanation) {
      onSaveExplanation({
        subjectId: m.subjectId,
        subjectName: m.subjectId === 'math' ? 'Mathematics' : m.subjectId === 'physics' ? 'Physics' : m.subjectId === 'chemistry' ? 'Chemistry' : 'English Grammar',
        topicId: m.topicId,
        topicName: m.conceptName || 'Topic Review',
        conceptName: m.conceptName,
        questionText: m.questionText,
        studentAnswer: m.studentAnswer,
        correctAnswer: m.correctAnswer,
        explanation: m.explanation,
        savedAt: new Date().toISOString(),
      });

      setSavedNotesMap((prev) => ({ ...prev, [m.id]: true }));
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto max-w-5xl mx-auto w-full">
      {/* Header & Filter Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-sky-600" />
            <span>Mistake Tracker & Reinforcement</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Review past test mistakes date-wise, analyze misconceptions, and bookmark key explanations to your personal notes.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="all">All Dates</option>
              {dates.map((d) => (
                <option key={d} value={d}>
                  {new Date(d).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </option>
              ))}
            </select>
          </div>

          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none"
          >
            <option value="all">All Subjects</option>
            <option value="math">Mathematics</option>
            <option value="physics">Physics</option>
            <option value="chemistry">Chemistry</option>
            <option value="english">English Grammar</option>
          </select>

          <button
            onClick={() => setFilterResolved(!filterResolved)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              filterResolved
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-sky-50 border-sky-200 text-sky-800'
            }`}
          >
            {filterResolved ? 'Showing Resolved' : 'Showing Unresolved'}
          </button>
        </div>
      </div>

      {/* List of Mistakes */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-slate-800">No {filterResolved ? 'resolved' : 'unresolved'} mistakes found for this filter!</h3>
          <p className="text-xs text-slate-500">
            Keep taking topic assessment tests adaptively to build your mastery and track progress over time.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((m) => {
            const isSaved = savedNotesMap[m.id];
            const dateFormatted = new Date(m.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={m.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 hover:border-sky-200 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-red-100 text-red-800 font-bold text-[10px] rounded-md uppercase">
                        {m.category}
                      </span>
                      <span className="text-xs font-bold text-slate-600 capitalize">
                        {m.subjectId} • {m.conceptName}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        Date: {dateFormatted}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mt-2">{m.questionText}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveNote(m)}
                      disabled={isSaved}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSaved
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800'
                      }`}
                    >
                      <BookMarked className="w-3.5 h-3.5" />
                      <span>{isSaved ? 'Saved to Notes' : 'Save Explanation'}</span>
                    </button>

                    {!m.resolved && (
                      <button
                        onClick={() => onResolveMistake(m.id)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 shrink-0 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mark Resolved</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Answers Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-red-50/70 border border-red-100 rounded-2xl">
                    <span className="font-bold text-red-900 uppercase text-[10px] block mb-0.5">
                      Your Answer:
                    </span>
                    <span className="font-medium text-red-950">{m.studentAnswer}</span>
                  </div>

                  <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
                    <span className="font-bold text-emerald-900 uppercase text-[10px] block mb-0.5">
                      Correct Answer:
                    </span>
                    <span className="font-medium text-emerald-950">{m.correctAnswer}</span>
                  </div>
                </div>

                {/* AI Explanation & Hint */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs space-y-2 text-slate-700">
                  <div className="flex items-center gap-1.5 text-sky-800 font-bold">
                    <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span>Detailed Solution & Concept Reinforcement:</span>
                  </div>
                  <p className="font-medium leading-relaxed">{m.explanation}</p>
                </div>

                {/* Action */}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => onStartTest(m.subjectId, undefined, m.topicId)}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Take Practice Test</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

