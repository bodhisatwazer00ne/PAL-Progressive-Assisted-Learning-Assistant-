import React, { useState } from 'react';
import {
  BookMarked,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  PlayCircle,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
} from 'lucide-react';
import { SavedNote } from '../types';

interface NotesViewProps {
  notes: SavedNote[];
  onDeleteNote?: (id: string) => void;
  onUpdateUserNote?: (id: string, userNote: string) => void;
  onStartTest?: (subjectId?: string, chapterId?: string, topicId?: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  onDeleteNote,
  onUpdateUserNote,
  onStartTest,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [userNoteInput, setUserNoteInput] = useState<string>('');

  // Extract unique subjects and topics from saved notes
  const subjectsMap: Record<string, { id: string; name: string }> = {};
  notes.forEach((n) => {
    if (!subjectsMap[n.subjectId]) {
      subjectsMap[n.subjectId] = { id: n.subjectId, name: n.subjectName };
    }
  });
  const uniqueSubjects = Object.values(subjectsMap);

  const topicsMap: Record<string, { id: string; name: string }> = {};
  notes
    .filter((n) => selectedSubject === 'all' || n.subjectId === selectedSubject)
    .forEach((n) => {
      if (!topicsMap[n.topicId]) {
        topicsMap[n.topicId] = { id: n.topicId, name: n.topicName };
      }
    });
  const availableTopics = Object.values(topicsMap);

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesSubject = selectedSubject === 'all' || note.subjectId === selectedSubject;
    const matchesTopic = selectedTopic === 'all' || note.topicId === selectedTopic;
    const matchesSearch =
      searchQuery.trim() === '' ||
      note.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.topicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.userNote && note.userNote.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSubject && matchesTopic && matchesSearch;
  });

  const handleSaveUserNote = (id: string) => {
    if (onUpdateUserNote) {
      onUpdateUserNote(id, userNoteInput);
    }
    setEditingNoteId(null);
  };

  const getSubjectBadgeColor = (subId: string) => {
    switch (subId) {
      case 'math':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'physics':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'chemistry':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'english':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50/50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-blue-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/20 rounded-full text-sky-200 text-xs font-bold border border-sky-400/30">
              <BookMarked className="w-3.5 h-3.5" />
              <span>Personal Knowledge Vault</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Saved Explanations & Notes
            </h1>
            <p className="text-sky-200 text-xs sm:text-sm font-medium max-w-2xl">
              Subject and topic-wise repository of question solutions, step-by-step breakdowns, and personalized learning insights.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <div className="p-2.5 bg-sky-500 rounded-xl text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black">{notes.length}</p>
              <p className="text-[11px] text-sky-200 font-semibold uppercase tracking-wider">
                Saved Notes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search explanations, formulas, or concepts..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
            />
          </div>

          {/* Subject Dropdown Filter */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-600 shrink-0">Subject:</label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedTopic('all');
              }}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">All Subjects</option>
              {uniqueSubjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>

            {/* Topic Filter */}
            <label className="text-xs font-bold text-slate-600 shrink-0">Topic:</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">All Topics</option>
              {availableTopics.map((top) => (
                <option key={top.id} value={top.id}>
                  {top.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notes List Grid */}
      {filteredNotes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
          <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <BookMarked className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-extrabold text-slate-900">No Saved Notes Found</h3>
            <p className="text-xs text-slate-500">
              {notes.length === 0
                ? 'Save detailed explanations directly from test results or mistake reviews to build your personal subject study guide!'
                : 'No saved explanations match your selected subject/topic filters or search terms.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden hover:shadow-md transition-all duration-200"
            >
              {/* Card Header */}
              <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getSubjectBadgeColor(
                      note.subjectId
                    )}`}
                  >
                    {note.subjectName}
                  </span>
                  <span className="px-3 py-1 bg-slate-200/70 text-slate-700 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-slate-500" />
                    <span>{note.topicName}</span>
                  </span>
                  {note.conceptName && (
                    <span className="px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-xs font-semibold">
                      {note.conceptName}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Saved on {new Date(note.savedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    title="Delete Note"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Content Body */}
              <div className="p-5 sm:p-6 space-y-5">
                {/* Question Box */}
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <HelpCircle className="w-4 h-4 text-sky-600" />
                    <span>Question</span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-slate-900 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {note.questionText}
                  </p>
                </div>

                {/* Student Answer & Correct Answer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {note.studentAnswer && (
                    <div className="p-3.5 bg-amber-50/70 border border-amber-200/60 rounded-xl">
                      <p className="text-[11px] font-bold text-amber-700 uppercase">Your Answer</p>
                      <p className="text-xs font-bold text-slate-800 mt-1">{note.studentAnswer}</p>
                    </div>
                  )}
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/60 rounded-xl">
                    <p className="text-[11px] font-bold text-emerald-700 uppercase">Correct Answer</p>
                    <p className="text-xs font-bold text-emerald-950 mt-1">{note.correctAnswer}</p>
                  </div>
                </div>

                {/* Detailed Explanation */}
                <div className="p-4 sm:p-5 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-sky-900">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    <span>Detailed Step-by-Step Explanation</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                    {note.explanation}
                  </p>

                  {/* Solution Steps */}
                  {note.solutionSteps && note.solutionSteps.length > 0 && (
                    <div className="pt-2 border-t border-sky-200/60 space-y-1.5">
                      <p className="text-[11px] font-bold text-sky-800 uppercase">Solution Breakdown:</p>
                      <ul className="space-y-1 text-xs text-slate-700 font-medium">
                        {note.solutionSteps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-sky-200 text-sky-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* User Personal Annotations */}
                <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                      <span>My Personal Study Notes</span>
                    </div>
                    {editingNoteId !== note.id && (
                      <button
                        onClick={() => {
                          setEditingNoteId(note.id);
                          setUserNoteInput(note.userNote || '');
                        }}
                        className="text-[11px] font-bold text-amber-700 hover:text-amber-900 cursor-pointer"
                      >
                        {note.userNote ? 'Edit Note' : '+ Add Note'}
                      </button>
                    )}
                  </div>

                  {editingNoteId === note.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={userNoteInput}
                        onChange={(e) => setUserNoteInput(e.target.value)}
                        placeholder="Add memory tricks, formulas to remember, or key concepts..."
                        rows={2}
                        className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-3 py-1 bg-slate-200 text-slate-700 font-bold text-xs rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveUserNote(note.id)}
                          className="px-3 py-1 bg-amber-600 text-white font-bold text-xs rounded-lg shadow-xs"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-900/80 font-medium italic">
                      {note.userNote || 'No personal notes added yet. Click "+ Add Note" to annotate.'}
                    </p>
                  )}
                </div>

                {/* Action Footer */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => onStartTest(note.subjectId, undefined, note.topicId)}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Practice Topic Test</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
