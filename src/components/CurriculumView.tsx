import React, { useState } from 'react';
import {
  BookOpen,
  Calculator,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  FlaskConical,
  Zap,
} from 'lucide-react';
import { ConceptMastery, Grade } from '../types';

interface CurriculumViewProps {
  curriculum: Grade;
  masteries: ConceptMastery[];
  onStartTest: (subjectId: string, chapterId?: string, topicId?: string) => void;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  curriculum,
  masteries,
  onStartTest,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('math');
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({
    math_trig: true,
    phys_elec: true,
    chem_rxn: true,
  });

  const subject = curriculum.subjects.find((s) => s.id === selectedSubjectId) || curriculum.subjects[0];

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const getSubjectIcon = (code: string) => {
    switch (code) {
      case 'math':
        return <Calculator className="w-5 h-5 text-indigo-600" />;
      case 'physics':
        return <Zap className="w-5 h-5 text-blue-600" />;
      case 'chemistry':
        return <FlaskConical className="w-5 h-5 text-emerald-600" />;
      default:
        return <BookOpen className="w-5 h-5 text-indigo-600" />;
    }
  };

  const getConceptMasteryScore = (conceptId: string) => {
    const m = masteries.find((x) => x.conceptId === conceptId);
    return m ? m.score : 50;
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Subject Tabs */}
      <div className="flex gap-4 border-b border-slate-200 pb-4">
        {curriculum.subjects.map((sub) => {
          const isSelected = sub.id === selectedSubjectId;
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {getSubjectIcon(sub.code)}
              <span>{sub.name}</span>
            </button>
          );
        })}
      </div>

      {/* Subject Overview Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-slate-900 text-lg">{subject.name} Syllabus Overview</h3>
          <p className="text-xs text-slate-500 mt-0.5">{subject.description}</p>
        </div>
        <button
          onClick={() => onStartTest(subject.id, 'all', 'all')}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
        >
          <CheckSquare className="w-4 h-4" />
          <span>Take Subject Assessment Test</span>
        </button>
      </div>

      {/* Chapters & Topics List */}
      <div className="space-y-6">
        {subject.chapters.map((chapter) => {
          const isExpanded = !!expandedChapters[chapter.id];

          return (
            <div
              key={chapter.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
            >
              {/* Chapter Header */}
              <div
                onClick={() => toggleChapter(chapter.id)}
                className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors"
              >
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                    <span>{chapter.name}</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-200 text-slate-700 rounded-full">
                      {chapter.topics.length} Topics
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{chapter.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartTest(subject.id, chapter.id, 'all');
                    }}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Chapter Test</span>
                  </button>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Topics Container */}
              {isExpanded && (
                <div className="p-5 space-y-5 divide-y divide-slate-100">
                  {chapter.topics.map((topic) => (
                    <div key={topic.id} className="pt-4 first:pt-0 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-600" />
                            <span>{topic.name}</span>
                          </h4>
                          <p className="text-xs text-slate-500 ml-4 mt-0.5">{topic.description}</p>
                        </div>

                        {/* Actions for Topic */}
                        <div className="flex items-center gap-2 ml-4 sm:ml-0 shrink-0">
                          <button
                            onClick={() => onStartTest(subject.id, chapter.id, topic.id)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span>Take Topic Test</span>
                          </button>
                        </div>
                      </div>

                      {/* Concepts List */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4">
                        {topic.concepts.map((concept) => {
                          const score = getConceptMasteryScore(concept.id);
                          return (
                            <div
                              key={concept.id}
                              onClick={() => onStartTest(subject.id, chapter.id, topic.id)}
                              className="p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer flex items-center justify-between group"
                            >
                              <div className="pr-2">
                                <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-950">
                                  {concept.name}
                                </p>
                                <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                  {concept.description}
                                </p>
                              </div>

                              <div className="text-right shrink-0">
                                <span
                                  className={`text-xs font-black px-2 py-0.5 rounded-md ${
                                    score >= 75
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : score >= 50
                                      ? 'bg-indigo-100 text-indigo-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {score}%
                                </span>
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
  );
};
