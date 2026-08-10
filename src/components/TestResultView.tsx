import React, { useState } from 'react';
import {
  Award,
  BookMarked,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { SavedNote, Test } from '../types';

interface TestResultViewProps {
  test: Test;
  onRetake: () => void;
  onGoHome: () => void;
  onSaveExplanation?: (noteData: Partial<SavedNote>) => void;
}

export const TestResultView: React.FC<TestResultViewProps> = ({
  test,
  onRetake,
  onGoHome,
  onSaveExplanation,
}) => {
  const [savedNotesMap, setSavedNotesMap] = useState<Record<string, boolean>>({});
  const percentage = test.percentage || 0;

  const handleSaveNote = (q: any, studentAns: string) => {
    if (onSaveExplanation) {
      onSaveExplanation({
        subjectId: test.subjectId || q.subjectId || 'math',
        subjectName: test.subjectId === 'math' ? 'Mathematics' : test.subjectId === 'physics' ? 'Physics' : test.subjectId === 'chemistry' ? 'Chemistry' : 'English Grammar',
        topicId: test.topicId || q.topicId || 'topic_1',
        topicName: q.conceptName || 'Topic Assessment Question',
        questionText: q.questionText,
        studentAnswer: studentAns,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        solutionSteps: q.solutionSteps,
        savedAt: new Date().toISOString(),
      });

      setSavedNotesMap((prev) => ({ ...prev, [q.id]: true }));
    }
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto max-w-4xl mx-auto w-full">
      {/* Header Summary */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-center space-y-4">
        <div className="inline-flex p-3 bg-sky-50 rounded-2xl text-sky-600 mb-2">
          <Award className="w-10 h-10" />
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900">{test.title} Completed</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          PAL Engine analyzed your performance and updated concept mastery scores across Grade 10 topics.
        </p>

        {/* Score Pill Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-lg mx-auto">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 font-bold uppercase">Score</p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {test.score} / {test.totalScore}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 font-bold uppercase">Accuracy</p>
            <p className="text-2xl font-black text-sky-600 mt-1">{percentage}%</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 font-bold uppercase">Status</p>
            <p
              className={`text-xl font-extrabold mt-1 ${
                percentage >= 70 ? 'text-emerald-600' : 'text-orange-600'
              }`}
            >
              {percentage >= 70 ? 'Passed' : 'Needs Practice'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={onRetake}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 rounded-xl transition-all cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Test</span>
          </button>

          <button
            onClick={onGoHome}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-sky-200 cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Item-by-item breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-800 text-base border-b border-slate-100 pb-3">
          Question Breakdown & Explanation
        </h3>

        <div className="space-y-4 divide-y divide-slate-100">
          {test.questions.map((item, idx) => {
            const q = item.question;
            const isCorrect = item.isCorrect;
            const isSaved = savedNotesMap[q.id];

            return (
              <div key={q.id} className="pt-4 first:pt-0 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Q{idx + 1}. {q.questionText}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        Your Answer:{' '}
                        <span className="font-bold text-slate-800">
                          {item.studentAnswer || 'Not answered'}
                        </span>{' '}
                        • Correct:{' '}
                        <span className="font-bold text-emerald-700">{q.correctAnswer}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>

                    <button
                      onClick={() => handleSaveNote(q, item.studentAnswer)}
                      disabled={isSaved}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSaved
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800'
                      }`}
                    >
                      <BookMarked className="w-3.5 h-3.5" />
                      <span>{isSaved ? 'Saved' : 'Save Explanation'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 ml-7 border border-slate-100 space-y-1">
                  <span className="font-bold text-slate-800">Step-by-Step Explanation:</span>
                  <p className="whitespace-pre-line leading-relaxed">{q.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
