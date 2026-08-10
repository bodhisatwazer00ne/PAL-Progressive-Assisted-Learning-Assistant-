import React, { useState, useEffect } from 'react';
import { AnalyticsView } from './components/AnalyticsView';
import { CurriculumView } from './components/CurriculumView';
import { DashboardView } from './components/DashboardView';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { MistakesView } from './components/MistakesView';
import { NotesView } from './components/NotesView';
import { ProfileView } from './components/ProfileView';
import { NavTab, Sidebar } from './components/Sidebar';
import { StudyPlanView } from './components/StudyPlanView';
import { TestResultView } from './components/TestResultView';
import { TestRunnerView } from './components/TestRunnerView';
import { TestSetupView } from './components/TestSetupView';
import {
  ConceptMastery,
  DashboardStats,
  Grade,
  MistakeRecord,
  SavedNote,
  Test,
  TestConfig,
  UserProfile,
} from './types';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showGradeModal, setShowGradeModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Application Data State
  const [curriculum, setCurriculum] = useState<Grade | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [masteries, setMasteries] = useState<ConceptMastery[]>([]);
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Default Test Setup Pre-selections
  const [testDefaults, setTestDefaults] = useState<{
    subjectId: string;
    chapterId: string;
    topicId: string;
  }>({
    subjectId: 'physics',
    chapterId: 'phys_elec',
    topicId: 'phys_elec_ohm',
  });

  // Active Test State
  const [activeTest, setActiveTest] = useState<Test | null>(null);

  // Fetch initial state from Express backend
  const refreshAllData = async (overrideGrade?: string) => {
    try {
      const activeGrade = overrideGrade || profile?.grade || 'Grade 10';
      const [currRes, profRes, statsRes, mistRes] = await Promise.all([
        fetch(`/api/curriculum?grade=${encodeURIComponent(activeGrade)}`),
        fetch('/api/user/profile'),
        fetch(`/api/dashboard/stats?grade=${encodeURIComponent(activeGrade)}`),
        fetch(`/api/mistakes?grade=${encodeURIComponent(activeGrade)}`),
      ]);

      if (currRes.ok) setCurriculum(await currRes.json());
      if (profRes.ok) setProfile(await profRes.json());
      if (statsRes.ok) {
        const s = await statsRes.json();
        setStats(s);
        if (s.weakConcepts) {
          setMasteries([...(s.weakConcepts || []), ...(s.strongConcepts || [])]);
        }
      }
      if (mistRes.ok) setMistakes(await mistRes.json());
    } catch (e) {
      console.error('Error fetching data:', e);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Handlers
  const handleLoginSuccess = async (partialProfile: Partial<UserProfile>) => {
    if (profile) {
      const updated = { ...profile, ...partialProfile };
      setProfile(updated);
      try {
        await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        });
      } catch (e) {
        console.error('Failed to sync login profile:', e);
      }
    }
    await refreshAllData();
    setIsAuthenticated(true);
    setShowGradeModal(true);
    setActiveTab('dashboard');
  };

  const handleGradeChange = async (newGrade: string) => {
    if (profile) {
      const updated = { ...profile, grade: newGrade };
      setProfile(updated);
      try {
        await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        });
        await refreshAllData(newGrade);
      } catch (e) {
        console.error('Failed to change grade:', e);
      }
    }
  };

  const handleGradeSelection = async (selectedGrade: string) => {
    setShowGradeModal(false);
    await handleGradeChange(selectedGrade);
  };

  const handleStartTestSetup = (subjectId?: string, chapterId?: string, topicId?: string) => {
    setActiveTest(null);
    if (subjectId) {
      setTestDefaults({
        subjectId,
        chapterId: chapterId || 'all',
        topicId: topicId || 'all',
      });
    }
    setActiveTab('test');
  };

  const handleGenerateTest = async (config: TestConfig) => {
    try {
      const payload = {
        ...config,
        grade: config.grade || profile?.grade || 'Grade 10',
      };
      const res = await fetch('/api/tests/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const newTest = await res.json();
      setActiveTest(newTest);
    } catch (e) {
      console.error('Failed to generate test:', e);
    }
  };

  const handleSubmitTest = async (answers: Record<string, { studentAnswer: string; timeTakenSeconds: number }>) => {
    if (!activeTest) return;
    try {
      const res = await fetch(`/api/tests/${activeTest.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      const completedTest = await res.json();
      setActiveTest(completedTest);
      refreshAllData();
    } catch (e) {
      console.error('Failed to submit test:', e);
    }
  };

  const handleResolveMistake = async (mistakeId: string) => {
    try {
      await fetch(`/api/mistakes/${mistakeId}/resolve`, { method: 'POST' });
      refreshAllData();
    } catch (e) {
      console.error('Failed to resolve mistake:', e);
    }
  };

  const handleSaveExplanation = (noteData: Partial<SavedNote>) => {
    const newNote: SavedNote = {
      id: noteData.id || `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      subjectId: noteData.subjectId || 'math',
      subjectName: noteData.subjectName || 'Mathematics',
      topicId: noteData.topicId || 'topic_1',
      topicName: noteData.topicName || 'Topic Review',
      conceptName: noteData.conceptName,
      questionText: noteData.questionText || '',
      studentAnswer: noteData.studentAnswer,
      correctAnswer: noteData.correctAnswer || '',
      explanation: noteData.explanation || '',
      solutionSteps: noteData.solutionSteps,
      userNote: noteData.userNote || '',
      savedAt: noteData.savedAt || new Date().toISOString(),
    };
    setSavedNotes((prev) => [newNote, ...prev.filter((n) => n.questionText !== newNote.questionText)]);
  };

  const handleDeleteNote = (noteId: string) => {
    setSavedNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  const handleUpdateUserNote = (noteId: string, userNoteText: string) => {
    setSavedNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, userNote: userNoteText } : n))
    );
  };

  const handleUpdateProfile = async (updated: Partial<UserProfile>) => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const newProf = await res.json();
      setProfile(newProf);
      if (updated.grade) {
        await refreshAllData(updated.grade);
      }
    } catch (e) {
      console.error('Failed to update profile:', e);
    }
  };

  // Header Title Resolver
  const getHeaderTitle = () => {
    const currentGrade = profile?.grade || 'Grade 10';
    switch (activeTab) {
      case 'dashboard':
        return 'Overview Dashboard';
      case 'curriculum':
        return `${currentGrade} Curriculum`;
      case 'test':
        return activeTest ? activeTest.title : 'Topic Assessment Tests';
      case 'mistakes':
        return 'Mistake Tracker & Reinforcement';
      case 'notes':
        return 'Saved Explanations & Notes';
      case 'analytics':
        return 'Performance Telemetry';
      case 'study-plan':
        return 'Personalized Weekly Plan';
      case 'profile':
        return 'Student Profile Settings';
      default:
        return 'PAL — Progressive Assisted Learning';
    }
  };

  // If not authenticated, display clean LoginView start page
  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  if (!profile || !stats) {
    return (
      <div className="flex h-screen w-screen bg-[#F8FAFC] items-center justify-center font-sans text-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-600">Initializing PAL Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden relative">
      {/* Post-Login Grade Selection Modal */}
      {showGradeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-sky-100 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-sky-600 text-white rounded-2xl flex items-center justify-center mx-auto font-black text-xl shadow-md shadow-sky-200">
                P
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Select Target Standard</h3>
              <p className="text-xs text-slate-500 font-medium">Choose a grade level to run adaptive & progressive tests:</p>
            </div>

            <div className="space-y-3">
              <button
                id="select-grade-10-btn"
                onClick={() => handleGradeSelection('Grade 10')}
                className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 text-left transition-all group flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="font-extrabold text-sm text-slate-900 group-hover:text-sky-700">10th Standard</p>
                  <p className="text-xs text-slate-500">Mathematics, Physics, Chemistry</p>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 bg-slate-100 group-hover:bg-sky-600 group-hover:text-white rounded-xl text-slate-700 transition-colors">Select</span>
              </button>

              <button
                id="select-grade-4-btn"
                onClick={() => handleGradeSelection('4th Standard')}
                className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 text-left transition-all group flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="font-extrabold text-sm text-slate-900 group-hover:text-sky-700">4th Standard</p>
                  <p className="text-xs text-slate-500">Mathematics & English Grammar</p>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 bg-slate-100 group-hover:bg-sky-600 group-hover:text-white rounded-xl text-slate-700 transition-colors">Select Demo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sleek Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab !== 'test') setActiveTest(null);
          setActiveTab(tab);
          refreshAllData();
        }}
        weeklyProgress={{ covered: 15, total: 20 }}
        onLogout={() => setIsAuthenticated(false)}
      />

      {/* Main App Canvas */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Sleek Header */}
        <Header
          title={getHeaderTitle()}
          profile={profile}
          onProfileClick={() => setActiveTab('profile')}
          onGradeChange={handleGradeChange}
        />

        {/* Tab View Renderer */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              onStartTest={(sub, chap, top) => handleStartTestSetup(sub, chap, top)}
              onViewAnalytics={() => setActiveTab('analytics')}
            />
          )}

          {activeTab === 'curriculum' && curriculum && (
            <CurriculumView
              curriculum={curriculum}
              masteries={masteries}
              onStartTest={(sub, chap, top) => handleStartTestSetup(sub, chap, top)}
            />
          )}

          {activeTab === 'test' && (
            <>
              {!activeTest && curriculum && (
                <TestSetupView
                  curriculum={curriculum}
                  onStartTest={handleGenerateTest}
                  defaultSubjectId={testDefaults.subjectId}
                  defaultChapterId={testDefaults.chapterId}
                  defaultTopicId={testDefaults.topicId}
                />
              )}

              {activeTest && activeTest.status === 'in_progress' && (
                <TestRunnerView
                  test={activeTest}
                  onSubmitTest={handleSubmitTest}
                />
              )}

              {activeTest && activeTest.status === 'completed' && (
                <TestResultView
                  test={activeTest}
                  onSaveExplanation={handleSaveExplanation}
                  onRetake={() => {
                    if (activeTest) {
                      handleGenerateTest({
                        subjectId: activeTest.subjectId,
                        chapterId: activeTest.chapterId,
                        topicId: activeTest.topicId,
                        mode: activeTest.mode,
                        questionCount: activeTest.questions.length,
                        timeLimitMinutes: activeTest.timeLimitMinutes,
                      });
                    }
                  }}
                  onGoHome={() => {
                    setActiveTest(null);
                    setActiveTab('dashboard');
                    refreshAllData();
                  }}
                />
              )}
            </>
          )}

          {activeTab === 'mistakes' && (
            <MistakesView
              mistakes={mistakes}
              onResolveMistake={handleResolveMistake}
              onStartTest={(sub, chap, top) => handleStartTestSetup(sub, chap, top)}
              onSaveExplanation={handleSaveExplanation}
            />
          )}

          {activeTab === 'notes' && (
            <NotesView
              notes={savedNotes}
              onDeleteNote={handleDeleteNote}
              onUpdateUserNote={handleUpdateUserNote}
            />
          )}

          {activeTab === 'analytics' && <AnalyticsView stats={stats} />}

          {activeTab === 'study-plan' && (
            <StudyPlanView
              onStartTest={(sub, chap, top) => handleStartTestSetup(sub, chap, top)}
              onStartWeeklyTest={(sub) => handleStartTestSetup(sub)}
              currentGrade={profile?.grade}
              curriculum={curriculum}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
        </div>
      </main>
    </div>
  );
}
