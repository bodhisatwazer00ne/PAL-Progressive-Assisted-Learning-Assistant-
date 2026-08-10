import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  Layers,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import { Grade, StudyPlan, Subject, Topic } from '../types';

interface StudyPlanViewProps {
  onStartTest: (subjectId: string, chapterId?: string, topicId?: string) => void;
  onStartWeeklyTest: (subjectId: string) => void;
  currentGrade?: string;
  curriculum?: Grade | null;
}

export const StudyPlanView: React.FC<StudyPlanViewProps> = ({
  onStartTest,
  onStartWeeklyTest,
  currentGrade,
  curriculum: propCurriculum,
}) => {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [showCustomizer, setShowCustomizer] = useState<boolean>(false);

  // Customization Form State
  const [hours, setHours] = useState<number>(2);
  const [curriculumData, setCurriculumData] = useState<Grade | null>(propCurriculum || null);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);

  // Load Curriculum data if not provided via props
  useEffect(() => {
    if (propCurriculum) {
      setCurriculumData(propCurriculum);
    } else {
      const url = currentGrade ? `/api/curriculum?grade=${encodeURIComponent(currentGrade)}` : '/api/curriculum';
      fetch(url)
        .then((res) => res.json())
        .then((data: Grade) => setCurriculumData(data))
        .catch((e) => console.error('Failed to load curriculum for study plan:', e));
    }
  }, [propCurriculum, currentGrade]);

  // Sync default selection when curriculum loads
  useEffect(() => {
    if (curriculumData && curriculumData.subjects) {
      const allSubIds = curriculumData.subjects.map((s) => s.id);
      setSelectedSubjectIds((prev) => (prev.length === 0 ? allSubIds : prev));

      const allTopIds: string[] = [];
      curriculumData.subjects.forEach((s) => {
        s.chapters.forEach((ch) => {
          ch.topics.forEach((top) => {
            allTopIds.push(top.id);
          });
        });
      });
      setSelectedTopicIds((prev) => (prev.length === 0 ? allTopIds : prev));
      if (!expandedSubjectId && allSubIds.length > 0) {
        setExpandedSubjectId(allSubIds[0]);
      }
    }
  }, [curriculumData]);

  // Initial Fetch Plan
  const fetchPlan = async () => {
    setLoading(true);
    try {
      const url = currentGrade ? `/api/study-plan?grade=${encodeURIComponent(currentGrade)}` : '/api/study-plan';
      const res = await fetch(url);
      const data = await res.json();
      setPlan(data);
    } catch (e) {
      console.error('Failed to load study plan:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [currentGrade]);

  const handleToggle = async (itemId: string) => {
    if (!plan) return;
    try {
      const res = await fetch('/api/study-plan/toggle-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, itemId }),
      });
      const updated = await res.json();
      setPlan(updated);
    } catch (e) {
      console.error('Failed to toggle plan item:', e);
    }
  };

  const handleGenerateCustomPlan = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/study-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availableHoursPerDay: hours,
          grade: currentGrade,
          selectedSubjectIds,
          selectedTopicIds,
        }),
      });
      const newPlan = await res.json();
      setPlan(newPlan);
      setShowCustomizer(false);
    } catch (e) {
      console.error('Failed to generate study plan:', e);
    } finally {
      setGenerating(false);
    }
  };

  // Selection Helper Handlers
  const toggleSubject = (subjectId: string) => {
    if (selectedSubjectIds.includes(subjectId)) {
      // Unselect subject & its topics
      setSelectedSubjectIds((prev) => prev.filter((id) => id !== subjectId));
      if (curriculumData) {
        const sub = curriculumData.subjects.find((s) => s.id === subjectId);
        if (sub) {
          const subTopicIds = sub.chapters.flatMap((ch) => ch.topics.map((t) => t.id));
          setSelectedTopicIds((prev) => prev.filter((id) => !subTopicIds.includes(id)));
        }
      }
    } else {
      // Select subject & all its topics
      setSelectedSubjectIds((prev) => [...prev, subjectId]);
      if (curriculumData) {
        const sub = curriculumData.subjects.find((s) => s.id === subjectId);
        if (sub) {
          const subTopicIds = sub.chapters.flatMap((ch) => ch.topics.map((t) => t.id));
          setSelectedTopicIds((prev) => Array.from(new Set([...prev, ...subTopicIds])));
        }
      }
    }
  };

  const toggleTopic = (topicId: string, subjectId: string) => {
    if (selectedTopicIds.includes(topicId)) {
      setSelectedTopicIds((prev) => prev.filter((id) => id !== topicId));
    } else {
      setSelectedTopicIds((prev) => [...prev, topicId]);
      // Ensure parent subject is selected
      if (!selectedSubjectIds.includes(subjectId)) {
        setSelectedSubjectIds((prev) => [...prev, subjectId]);
      }
    }
  };

  const selectAllSubjects = () => {
    if (!curriculumData) return;
    const allSubIds = curriculumData.subjects.map((s) => s.id);
    setSelectedSubjectIds(allSubIds);

    const allTopIds: string[] = [];
    curriculumData.subjects.forEach((s) => {
      s.chapters.forEach((ch) => {
        ch.topics.forEach((top) => {
          allTopIds.push(top.id);
        });
      });
    });
    setSelectedTopicIds(allTopIds);
  };

  const selectAllTopicsForSubject = (subject: Subject) => {
    const subTopicIds = subject.chapters.flatMap((ch) => ch.topics.map((t) => t.id));
    setSelectedTopicIds((prev) => Array.from(new Set([...prev, ...subTopicIds])));
    if (!selectedSubjectIds.includes(subject.id)) {
      setSelectedSubjectIds((prev) => [...prev, subject.id]);
    }
  };

  const deselectAllTopicsForSubject = (subject: Subject) => {
    const subTopicIds = subject.chapters.flatMap((ch) => ch.topics.map((t) => t.id));
    setSelectedTopicIds((prev) => prev.filter((id) => !subTopicIds.includes(id)));
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500 mt-3">Building personalized study plan...</p>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto max-w-5xl mx-auto w-full font-sans">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold rounded-lg uppercase">
              Weekly Plan
            </span>
            <span className="text-xs text-slate-400 font-semibold">Week of {plan.weekStartDate}</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">{plan.weeklyGoal}</h2>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setShowCustomizer((prev) => !prev)}
            className={`px-4 py-2.5 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 border ${
              showCustomizer
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{showCustomizer ? 'Close Customizer' : 'Select Subjects & Topics'}</span>
          </button>

          <button
            onClick={() => onStartWeeklyTest('physics')}
            className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Generate Weekly Test</span>
          </button>
        </div>
      </div>

      {/* Expandable Customization Card */}
      {showCustomizer && (
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-md p-6 space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900">Customize Weekly Plan Selection</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose the specific subjects and topics you want to focus on for this week.
              </p>
            </div>
            <button
              onClick={() => setShowCustomizer(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Daily Pace Selector */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Target Daily Practice Time</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((h) => (
                <button
                  key={h}
                  onClick={() => setHours(h)}
                  className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer border ${
                    hours === h
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {h} {h === 1 ? 'Hour/day' : 'Hours/day'}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Filter Controls */}
          {curriculumData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Select Subjects ({selectedSubjectIds.length}/{curriculumData.subjects.length})</span>
                </label>

                <button
                  onClick={selectAllSubjects}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Select All Subjects
                </button>
              </div>

              {/* Subject Pills Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {curriculumData.subjects.map((sub) => {
                  const isSelected = selectedSubjectIds.includes(sub.id);
                  const subTopicCount = sub.chapters.flatMap((c) => c.topics).length;
                  const selectedSubTopicCount = sub.chapters
                    .flatMap((c) => c.topics)
                    .filter((t) => selectedTopicIds.includes(t.id)).length;

                  return (
                    <div
                      key={sub.id}
                      onClick={() => toggleSubject(sub.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950 shadow-2xs'
                          : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                            isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <p className="text-xs font-extrabold">{sub.name}</p>
                          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                            {selectedSubTopicCount}/{subTopicCount} topics selected
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Topic Accordion Filter */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Select Specific Topics</span>
                </label>

                <div className="space-y-2">
                  {curriculumData.subjects
                    .filter((sub) => selectedSubjectIds.includes(sub.id))
                    .map((sub) => {
                      const isExpanded = expandedSubjectId === sub.id;
                      const allTopics = sub.chapters.flatMap((ch) => ch.topics);
                      const selectedCount = allTopics.filter((t) => selectedTopicIds.includes(t.id)).length;

                      return (
                        <div key={sub.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/30">
                          <div
                            onClick={() => setExpandedSubjectId(isExpanded ? null : sub.id)}
                            className="p-3 bg-slate-100/70 hover:bg-slate-100 flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-slate-900">{sub.name} Topics</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md">
                                {selectedCount} of {allTopics.length} selected
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (selectedCount === allTopics.length) {
                                    deselectAllTopicsForSubject(sub);
                                  } else {
                                    selectAllTopicsForSubject(sub);
                                  }
                                }}
                                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 mr-1"
                              >
                                {selectedCount === allTopics.length ? 'Deselect All' : 'Select All'}
                              </button>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-slate-500" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-500" />
                              )}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="p-3 bg-white space-y-3">
                              {sub.chapters.map((ch) => (
                                <div key={ch.id} className="space-y-1.5">
                                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
                                    Chapter: {ch.name}
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {ch.topics.map((top) => {
                                      const isTopicSelected = selectedTopicIds.includes(top.id);
                                      return (
                                        <div
                                          key={top.id}
                                          onClick={() => toggleTopic(top.id, sub.id)}
                                          className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 ${
                                            isTopicSelected
                                              ? 'bg-indigo-50/50 border-indigo-200 text-slate-900'
                                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                                          }`}
                                        >
                                          <div
                                            className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-colors shrink-0 ${
                                              isTopicSelected
                                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                                : 'border-slate-300 bg-white'
                                            }`}
                                          >
                                            {isTopicSelected && <Check className="w-3 h-3" />}
                                          </div>
                                          <div>
                                            <p className="text-xs font-bold leading-snug">{top.name}</p>
                                            <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                              {top.description}
                                            </p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium">
              Selected <strong className="text-slate-900">{selectedSubjectIds.length} subjects</strong> and{' '}
              <strong className="text-slate-900">{selectedTopicIds.length} topics</strong>
            </span>

            <button
              onClick={handleGenerateCustomPlan}
              disabled={generating || selectedTopicIds.length === 0}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-200 cursor-pointer flex items-center gap-2"
            >
              {generating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating Tailored Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Customized Weekly Plan</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Progress Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex justify-between items-center text-xs font-bold mb-2">
          <span className="text-slate-600 uppercase">Weekly Goal Completion</span>
          <span className="text-indigo-600">{plan.completionPercentage}% Completed</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${plan.completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Schedule Items List */}
      <div className="space-y-3">
        {plan.items.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              item.completed
                ? 'bg-slate-50 border-slate-200 opacity-75'
                : 'bg-white border-slate-200 shadow-xs hover:border-indigo-200'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <button
                onClick={() => handleToggle(item.id)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
                  item.completed ? 'bg-emerald-600 text-white' : 'border-2 border-slate-300 hover:border-indigo-600'
                }`}
              >
                {item.completed && <CheckCircle2 className="w-4 h-4" />}
              </button>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-xs text-indigo-950 px-2 py-0.5 bg-indigo-50 rounded-md">
                    {item.dayOfWeek}
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    {item.subjectName} • {item.durationMinutes} mins
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                      item.activityType === 'Concept Drill'
                        ? 'bg-red-100 text-red-800'
                        : item.activityType === 'Revision'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {item.activityType}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {item.topicName} — {item.conceptName || 'All Concepts'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{item.reason}</p>
              </div>
            </div>

            <button
              onClick={() => onStartTest(item.subjectId, undefined, item.topicId)}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl shrink-0 transition-colors cursor-pointer self-end sm:self-center flex items-center gap-1.5"
            >
              <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
              <span>Start Assessment</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
