import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Flag,
  HelpCircle,
  RotateCcw,
  Send,
  Sparkles,
} from 'lucide-react';
import { Test } from '../types';

interface TestRunnerViewProps {
  test: Test;
  onSubmitTest: (answers: Record<string, { studentAnswer: string; timeTakenSeconds: number }>) => void;
}

export const TestRunnerView: React.FC<TestRunnerViewProps> = ({
  test: initialTest,
  onSubmitTest,
}) => {
  const [currentTest, setCurrentTest] = useState<Test>(initialTest);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, { studentAnswer: string; timeTakenSeconds: number }>>({});
  const [skipped, setSkipped] = useState<Record<string, boolean>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number>(initialTest.timeLimitMinutes * 60);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [loadingNext, setLoadingNext] = useState<boolean>(false);

  const totalPlanned = currentTest.totalPlannedCount || 5;

  useEffect(() => {
    setCurrentTest(initialTest);
  }, [initialTest]);

  // Background prefetching for next adaptive question to eliminate loading wait time
  useEffect(() => {
    if (currentIndex === currentTest.questions.length - 1 && currentTest.questions.length < totalPlanned) {
      const isPrefetchingKey = `prefetch_${currentTest.id}_${currentTest.questions.length}`;
      if ((window as any)[isPrefetchingKey]) return;
      (window as any)[isPrefetchingKey] = true;

      fetch(`/api/tests/${currentTest.id}/next-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wasSkipped: false,
          studentAnswer: '',
          timeTakenSeconds: 15,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.question) {
            setCurrentTest((prev) => {
              if (prev.questions.some((q) => q.question.id === data.question.id)) return prev;
              return {
                ...prev,
                questions: [...prev.questions, { question: data.question }],
              };
            });
          }
        })
        .catch((e) => {
          console.warn('Background prefetch note:', e);
        });
    }
  }, [currentIndex, currentTest.questions.length, totalPlanned, currentTest.id]);

  // Time remaining countdown
  useEffect(() => {
    if (remainingSeconds <= 0) {
      handleFinalSubmit();
      return;
    }
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [remainingSeconds]);

  const currentQItem = currentTest.questions[currentIndex];
  const currentQ = currentQItem?.question;

  const handleSelectAnswer = (ans: string) => {
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        studentAnswer: ans,
        timeTakenSeconds: (prev[currentQ.id]?.timeTakenSeconds || 0) + 15,
      },
    }));
    // Remove skipped state if answered
    setSkipped((prev) => ({ ...prev, [currentQ.id]: false }));
  };

  const toggleFlag = (qId: string) => {
    setFlagged((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleAdvance = async (wasSkippedAction: boolean) => {
    if (!currentQ) return;

    if (wasSkippedAction) {
      setSkipped((prev) => ({ ...prev, [currentQ.id]: true }));
    }

    // If we're not at the end of generated questions list, simply step forward
    if (currentIndex < currentTest.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    // If we reached target count, show completion prompt
    if (currentTest.questions.length >= totalPlanned) {
      setShowSubmitModal(true);
      return;
    }

    // Otherwise, generate the next adaptive question on-demand!
    setLoadingNext(true);
    try {
      const res = await fetch(`/api/tests/${currentTest.id}/next-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wasSkipped: wasSkippedAction,
          studentAnswer: answers[currentQ.id]?.studentAnswer || (wasSkippedAction ? 'Skipped' : ''),
          timeTakenSeconds: answers[currentQ.id]?.timeTakenSeconds || 20,
        }),
      });

      const data = await res.json();
      if (data.completed || !data.question) {
        setShowSubmitModal(true);
      } else {
        const updatedQuestions = [...currentTest.questions, { question: data.question }];
        setCurrentTest((prev) => ({
          ...prev,
          questions: updatedQuestions,
        }));
        setCurrentIndex(updatedQuestions.length - 1);
      }
    } catch (e) {
      console.error('Failed to generate next question:', e);
    } finally {
      setLoadingNext(false);
    }
  };

  const handleFinalSubmit = () => {
    onSubmitTest(answers);
  };

  if (!currentQ) return null;

  const currentAns = answers[currentQ.id]?.studentAnswer || '';
  const answeredCount = Object.keys(answers).filter((k) => !!answers[k]?.studentAnswer && !skipped[k]).length;
  const skippedCount = Object.keys(skipped).filter((k) => skipped[k]).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto max-w-5xl mx-auto w-full">
      {/* Top Test Navigation Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-slate-800 text-base">{currentTest.title}</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Question {currentIndex + 1} of {totalPlanned} • Adaptive On-Demand Mode
          </p>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-center">
          {/* Countdown Timer */}
          <div className="flex items-center gap-2 font-mono font-bold text-xs sm:text-sm text-sky-800 bg-sky-50 border border-sky-200 px-3.5 py-1.5 rounded-xl shadow-2xs">
            <Clock className="w-4 h-4 text-sky-600" />
            <span>
              {Math.floor(remainingSeconds / 60)}:
              {(remainingSeconds % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Test</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Question Card */}
        <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6 flex flex-col justify-between min-h-[440px] relative overflow-hidden">
          {loadingNext ? (
            <div className="my-auto py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Generating Adaptive Question...</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Analyzing your previous responses to tailor the optimal difficulty level and concept format.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {/* Question Header Badge & Flag */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-lg uppercase tracking-wider">
                      Format: {currentQ.questionType.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                      Difficulty {currentQ.difficulty} / 5
                    </span>
                  </div>

                  <button
                    onClick={() => toggleFlag(currentQ.id)}
                    className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
                      flagged[currentQ.id]
                        ? 'bg-amber-100 border-amber-300 text-amber-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>{flagged[currentQ.id] ? 'Flagged' : 'Flag Question'}</span>
                  </button>
                </div>

                {/* Scenario / Context Box for Graph/Case/Diagram questions */}
                {currentQ.contextText && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 leading-relaxed font-medium">
                    <p className="font-bold text-slate-900 text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1.5 text-sky-800">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Context Scenario</span>
                    </p>
                    <p className="whitespace-pre-line text-slate-700">{currentQ.contextText}</p>
                  </div>
                )}

                {/* Main Question Text */}
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                  {currentQ.questionText}
                </h2>

                {/* Options / Input Field */}
                {currentQ.options && currentQ.options.length > 0 ? (
                  <div className="space-y-3 pt-2">
                    {currentQ.options.map((opt) => {
                      const isSelected = currentAns === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleSelectAnswer(opt.id)}
                          className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                            isSelected
                              ? 'border-sky-600 bg-sky-50/70 shadow-2xs'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-sky-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {opt.id}
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-slate-800">{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Your Numeric / Answer Input</label>
                    <input
                      type="text"
                      value={currentAns}
                      onChange={(e) => handleSelectAnswer(e.target.value)}
                      placeholder="Type your calculated answer here..."
                      className="w-full p-3.5 rounded-2xl border-2 border-slate-200 text-sm font-bold text-slate-900 focus:border-sky-600 focus:bg-white focus:outline-none bg-slate-50/50 transition-all"
                    />
                  </div>
                )}
              </div>

              {/* Navigation Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 font-bold text-xs text-slate-700 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-2">
                  {/* Skip Question Button */}
                  <button
                    onClick={() => handleAdvance(true)}
                    className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                    <span>Skip Question</span>
                  </button>

                  {/* Next Question / Submit Answer Button */}
                  <button
                    onClick={() => handleAdvance(false)}
                    className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Question Palette Sidebar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
            Question Palette ({currentTest.questions.length} / {totalPlanned})
          </h4>

          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: totalPlanned }).map((_, idx) => {
              const item = currentTest.questions[idx];
              const qId = item?.question.id;
              const isGenerated = !!item;
              const isAnswered = qId ? !!answers[qId]?.studentAnswer : false;
              const isSkippedItem = qId ? !!skipped[qId] : false;
              const isCurrent = idx === currentIndex;
              const isFlagged = qId ? !!flagged[qId] : false;

              return (
                <button
                  key={idx}
                  disabled={!isGenerated}
                  onClick={() => isGenerated && setCurrentIndex(idx)}
                  className={`h-9 rounded-xl font-extrabold text-xs transition-all border cursor-pointer ${
                    isCurrent
                      ? 'ring-2 ring-sky-600 border-sky-600 bg-sky-100 text-sky-900'
                      : isFlagged
                      ? 'bg-amber-100 border-amber-300 text-amber-900'
                      : isSkippedItem
                      ? 'bg-amber-50 border-amber-200 text-amber-700'
                      : isAnswered
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                      : isGenerated
                      ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                      : 'bg-slate-50 border-slate-100 text-slate-300 opacity-50 cursor-not-allowed'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-600 font-bold">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span>Skipped ({skippedCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span>Flagged ({Object.keys(flagged).filter((k) => flagged[k]).length})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4 shadow-xl border border-slate-100">
            <h3 className="text-lg font-extrabold text-slate-900">Confirm Assessment Submission</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              You have answered <span className="font-bold text-slate-900">{answeredCount}</span> of{' '}
              <span className="font-bold text-slate-900">{totalPlanned}</span> questions ({skippedCount} skipped). Are you ready to submit and calculate your updated topic mastery?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2.5 bg-slate-100 font-bold text-xs text-slate-700 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors"
              >
                Continue Test
              </button>
              <button
                onClick={handleFinalSubmit}
                className="px-5 py-2.5 bg-sky-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer hover:bg-sky-700 transition-colors"
              >
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
