import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  calculateTargetDifficulty,
  selectNextQuestionType,
  updateConceptMastery,
} from './src/engine/adaptiveEngine';
import { computeDashboardStats } from './src/engine/analyticsEngine';
import {
  evaluateStudentAnswer,
  generateAIQuestion,
  generateMockQuestion,
  generateMockStudyPlan,
} from './server/aiService';
import { db, getCurriculumByGrade, INITIAL_CURRICULUM } from './server/db';
import { DifficultyLevel, Test, TestQuestionItem } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Curriculum API
  app.get('/api/curriculum', (req, res) => {
    const profile = db.getProfile();
    const requestedGrade = (req.query.grade as string) || profile.grade;
    res.json(getCurriculumByGrade(requestedGrade));
  });

  // User Profile
  app.get('/api/user/profile', (req, res) => {
    res.json(db.getProfile());
  });

  app.post('/api/user/profile', (req, res) => {
    const updated = db.updateProfile(req.body);
    res.json(updated);
  });

  // Dashboard Stats
  app.get('/api/dashboard/stats', (req, res) => {
    const profile = db.getProfile();
    const activeGrade = (req.query.grade as string) || profile.grade || 'Grade 10';
    const masteries = db.getMasteries(activeGrade);
    const attempts = db.getAttempts(activeGrade);
    const stats = computeDashboardStats(masteries, attempts, activeGrade);
    res.json(stats);
  });

  // Learning Session: Get next question adaptively
  app.post('/api/learning/next-question', async (req, res) => {
    try {
      const { subjectId, chapterId, topicId, conceptId, grade } = req.body;
      const profile = db.getProfile();
      const activeGrade = grade || profile.grade || 'Grade 10';

      let targetConceptId = conceptId;
      if (!targetConceptId && topicId) {
        const activeCurriculum = getCurriculumByGrade(activeGrade);
        for (const sub of activeCurriculum.subjects) {
          for (const ch of sub.chapters) {
            for (const top of ch.topics) {
              if (top.id === topicId && top.concepts.length > 0) {
                targetConceptId = top.concepts[0].id;
                break;
              }
            }
          }
        }
      }

      if (!targetConceptId) {
        targetConceptId = activeGrade.includes('4') ? 'g4_math_div_remainders' : 'phys_elec_ohms_law';
      }

      // Fetch or seed mastery for target concept
      let mastery = db.getMasteryByConcept(targetConceptId);
      if (!mastery) {
        mastery = {
          conceptId: targetConceptId,
          conceptName: targetConceptId.replace(/_/g, ' '),
          topicId: topicId || (activeGrade.includes('4') ? 'g4_math_div_basics' : 'phys_elec_ohm'),
          subjectId: subjectId || (activeGrade.includes('4') ? 'math' : 'physics'),
          score: 50,
          band: 'Developing',
          totalAttempts: 0,
          correctAttempts: 0,
          lastPracticed: new Date().toISOString(),
          currentDifficultyTarget: 2,
          streak: 0,
        };
        db.saveMastery(mastery);
      }

      const difficulty = calculateTargetDifficulty(mastery.score);
      const questionType = selectNextQuestionType(difficulty);

      // Check recent mistakes for context
      const mistakes = db.getMistakes(activeGrade).filter((m) => m.conceptId === targetConceptId && !m.resolved);
      const mistakeContext = mistakes.length > 0 ? mistakes[0].explanation : undefined;

      const question = await generateAIQuestion(
        activeGrade,
        subjectId || mastery.subjectId,
        chapterId || (activeGrade.includes('4') ? 'g4_math_division' : 'phys_elec'),
        topicId || mastery.topicId,
        targetConceptId,
        mastery.conceptName,
        questionType,
        difficulty,
        mistakeContext
      );

      res.json({
        question,
        mastery,
      });
    } catch (e: any) {
      console.error('Error generating next question:', e);
      res.status(500).json({ error: e.message || 'Failed to generate question' });
    }
  });

  // Learning Session: Submit Answer
  app.post('/api/learning/submit-answer', async (req, res) => {
    try {
      const { question, studentAnswer, timeTakenSeconds } = req.body;

      if (!question || !studentAnswer) {
        return res.status(400).json({ error: 'Missing question or studentAnswer' });
      }

      // Evaluate answer via AI/Rules
      const evaluation = await evaluateStudentAnswer(question, studentAnswer, timeTakenSeconds || 30);

      // Fetch current mastery
      let mastery = db.getMasteryByConcept(question.conceptId) || {
        conceptId: question.conceptId,
        conceptName: question.conceptId,
        topicId: question.topicId,
        subjectId: question.subjectId,
        score: 50,
        band: 'Developing',
        totalAttempts: 0,
        correctAttempts: 0,
        lastPracticed: new Date().toISOString(),
        currentDifficultyTarget: 2,
        streak: 0,
      };

      // Calculate new mastery using Adaptive Engine
      const updateRes = updateConceptMastery(
        mastery,
        evaluation.isCorrect,
        question.difficulty,
        timeTakenSeconds || 30,
        question.estimatedTimeSeconds || 60
      );

      // Update mastery record
      mastery.score = updateRes.newScore;
      mastery.band = updateRes.newBand;
      mastery.currentDifficultyTarget = updateRes.newTargetDifficulty;
      mastery.totalAttempts += 1;
      if (evaluation.isCorrect) mastery.correctAttempts += 1;
      mastery.streak = updateRes.streak;
      mastery.lastPracticed = new Date().toISOString();

      db.saveMastery(mastery);

      // Record Attempt
      const attempt = {
        id: `att_${Date.now()}`,
        questionId: question.id,
        question,
        studentAnswer,
        isCorrect: evaluation.isCorrect,
        timeTakenSeconds: timeTakenSeconds || 30,
        mistakeCategory: evaluation.mistakeCategory,
        mistakeAnalysis: evaluation.mistakeAnalysis,
        masteryDelta: updateRes.delta,
        timestamp: new Date().toISOString(),
      };
      db.addAttempt(attempt);

      // Record Mistake if incorrect
      if (!evaluation.isCorrect) {
        db.addMistake({
          id: `mistake_${Date.now()}`,
          attemptId: attempt.id,
          conceptId: question.conceptId,
          conceptName: mastery.conceptName,
          topicId: question.topicId,
          subjectId: question.subjectId,
          questionText: question.questionText,
          studentAnswer,
          correctAnswer: question.correctAnswer,
          category: evaluation.mistakeCategory || 'Conceptual misunderstanding',
          explanation: evaluation.explanation,
          hint: evaluation.hint,
          resolved: false,
          createdAt: new Date().toISOString(),
        });
      }

      res.json({
        evaluation,
        updatedMastery: mastery,
        masteryDelta: updateRes.delta,
      });
    } catch (e: any) {
      console.error('Error submitting answer:', e);
      res.status(500).json({ error: e.message || 'Failed to submit answer' });
    }
  });

  // Tests API: Generate Test
  app.post('/api/tests/generate', async (req, res) => {
    try {
      const { subjectId, chapterId, topicId, mode, questionCount, timeLimitMinutes, grade } = req.body;

      const count = questionCount || 5;
      const profile = db.getProfile();
      const activeGrade = grade || profile.grade || 'Grade 10';
      const isGrade4 = activeGrade.includes('4') || activeGrade.toLowerCase().includes('4th');
      const activeCurriculum = getCurriculumByGrade(activeGrade);

      const targetSubject = activeCurriculum.subjects.find((s) => s.id === subjectId) || activeCurriculum.subjects[0];
      let conceptsList: { conceptId: string; conceptName: string; topicId: string; chapterId: string }[] = [];

      targetSubject.chapters.forEach((ch) => {
        if (chapterId === 'all' || !chapterId || ch.id === chapterId) {
          ch.topics.forEach((top) => {
            if (topicId === 'all' || !topicId || top.id === topicId) {
              top.concepts.forEach((conc) => {
                conceptsList.push({
                  conceptId: conc.id,
                  conceptName: conc.name,
                  topicId: top.id,
                  chapterId: ch.id,
                });
              });
            }
          });
        }
      });

      if (conceptsList.length === 0) {
        if (isGrade4) {
          conceptsList = [{
            conceptId: 'g4_math_div_remainders',
            conceptName: 'Division & Remainders',
            topicId: 'g4_math_div_basics',
            chapterId: 'g4_math_division',
          }];
        } else {
          conceptsList = [{
            conceptId: 'phys_elec_ohms_law',
            conceptName: 'Ohm’s Law',
            topicId: 'phys_elec_ohm',
            chapterId: 'phys_elec',
          }];
        }
      }

      // Generate ONLY the initial Question 1 for adaptive on-demand flow
      const firstConcept = conceptsList[0];
      const initialDiff: DifficultyLevel = 2;
      const qType = selectNextQuestionType(initialDiff);

      const q1 = await generateAIQuestion(
        activeGrade,
        targetSubject.id,
        firstConcept.chapterId,
        firstConcept.topicId,
        firstConcept.conceptId,
        firstConcept.conceptName,
        qType,
        initialDiff
      );

      let testTitle = `Adaptive Assessment — ${targetSubject.name}`;
      if (chapterId && chapterId !== 'all') {
        const chName = targetSubject.chapters.find((c) => c.id === chapterId)?.name || 'Chapter';
        testTitle = `Adaptive Test — ${chName}`;
      }

      const newTest: Test = {
        id: `test_${Date.now()}`,
        title: testTitle,
        subjectId: targetSubject.id,
        chapterId,
        topicId,
        mode: mode || 'adaptive',
        timeLimitMinutes: timeLimitMinutes || 15,
        totalPlannedCount: count,
        questions: [{ question: q1 }],
        status: 'in_progress',
        createdAt: new Date().toISOString(),
      };

      db.saveTest(newTest);
      res.json(newTest);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to generate test' });
    }
  });

  // Generate Next Adaptive Question On-Demand
  app.post('/api/tests/:testId/next-question', async (req, res) => {
    try {
      const { testId } = req.params;
      const { wasSkipped, studentAnswer, timeTakenSeconds } = req.body;

      const test = db.getTest(testId);
      if (!test) return res.status(404).json({ error: 'Test not found' });

      const totalTarget = test.totalPlannedCount || 5;
      const currentLength = test.questions.length;

      // Update student's answer / skip state on the current question
      if (currentLength > 0) {
        const lastItem = test.questions[currentLength - 1];
        if (wasSkipped) {
          lastItem.isSkipped = true;
          lastItem.studentAnswer = 'Skipped';
          lastItem.isCorrect = false;
        } else if (studentAnswer !== undefined) {
          lastItem.studentAnswer = studentAnswer;
          lastItem.isCorrect = studentAnswer === lastItem.question.correctAnswer;
        }
        if (timeTakenSeconds !== undefined) {
          lastItem.timeTakenSeconds = timeTakenSeconds;
        }
      }

      // If test already has total target questions, mark completed
      if (currentLength >= totalTarget) {
        db.saveTest(test);
        return res.json({ completed: true, test });
      }

      // Calculate adaptive parameters for next question
      const profile = db.getProfile();
      const activeGrade = profile.grade || 'Grade 10';
      const activeCurriculum = getCurriculumByGrade(activeGrade);
      const targetSubject = activeCurriculum.subjects.find((s) => s.id === test.subjectId) || activeCurriculum.subjects[0];

      let conceptsList: { conceptId: string; conceptName: string; topicId: string; chapterId: string }[] = [];
      targetSubject.chapters.forEach((ch) => {
        if (test.chapterId === 'all' || !test.chapterId || ch.id === test.chapterId) {
          ch.topics.forEach((top) => {
            if (test.topicId === 'all' || !test.topicId || top.id === test.topicId) {
              top.concepts.forEach((conc) => {
                conceptsList.push({
                  conceptId: conc.id,
                  conceptName: conc.name,
                  topicId: top.id,
                  chapterId: ch.id,
                });
              });
            }
          });
        }
      });

      if (conceptsList.length === 0) {
        conceptsList = [{
          conceptId: 'phys_elec_ohms_law',
          conceptName: 'Ohm’s Law',
          topicId: 'phys_elec_ohm',
          chapterId: 'phys_elec',
        }];
      }

      // Adaptive difficulty progression
      const lastQItem = test.questions[currentLength - 1];
      let nextDiff: DifficultyLevel = lastQItem ? lastQItem.question.difficulty : 2;

      if (wasSkipped) {
        nextDiff = Math.max(1, nextDiff - 1) as DifficultyLevel;
      } else if (lastQItem && lastQItem.isCorrect) {
        nextDiff = Math.min(5, nextDiff + 1) as DifficultyLevel;
      } else if (lastQItem && lastQItem.isCorrect === false) {
        nextDiff = Math.max(1, nextDiff - 1) as DifficultyLevel;
      }

      const nextQType = selectNextQuestionType(nextDiff);
      const conceptObj = conceptsList[currentLength % conceptsList.length];

      const nextQuestion = await generateAIQuestion(
        activeGrade,
        targetSubject.id,
        conceptObj.chapterId,
        conceptObj.topicId,
        conceptObj.conceptId,
        conceptObj.conceptName,
        nextQType,
        nextDiff,
        wasSkipped ? 'Previous question was skipped; provide a foundational conceptual question' : undefined
      );

      test.questions.push({ question: nextQuestion });
      db.saveTest(test);

      res.json({
        completed: false,
        question: nextQuestion,
        test,
      });
    } catch (e: any) {
      console.error('Error generating next adaptive question:', e);
      res.status(500).json({ error: e.message || 'Failed to generate next question' });
    }
  });

  // Get Test
  app.get('/api/tests/:testId', (req, res) => {
    const test = db.getTest(req.params.testId);
    if (!test) return res.status(404).json({ error: 'Test not found' });
    res.json(test);
  });

  // Submit Test
  app.post('/api/tests/:testId/submit', async (req, res) => {
    try {
      const { answers } = req.body; // map of questionId -> { studentAnswer, timeTakenSeconds }
      const test = db.getTest(req.params.testId);
      if (!test) return res.status(404).json({ error: 'Test not found' });

      let correctCount = 0;
      let totalTime = 0;

      await Promise.all(
        test.questions.map(async (qItem) => {
          const userAns = answers[qItem.question.id];
          if (userAns) {
            qItem.studentAnswer = userAns.studentAnswer;
            qItem.timeTakenSeconds = userAns.timeTakenSeconds || 30;
            totalTime += qItem.timeTakenSeconds;

            const evalRes = await evaluateStudentAnswer(qItem.question, userAns.studentAnswer, qItem.timeTakenSeconds);
            qItem.isCorrect = evalRes.isCorrect;
            if (evalRes.isCorrect) correctCount++;

            // Update mastery
            let mastery = db.getMasteryByConcept(qItem.question.conceptId);
            if (mastery) {
              const up = updateConceptMastery(mastery, evalRes.isCorrect, qItem.question.difficulty, qItem.timeTakenSeconds, 60);
              mastery.score = up.newScore;
              mastery.band = up.newBand;
              db.saveMastery(mastery);
            }
          }
        })
      );

      test.status = 'completed';
      test.score = correctCount;
      test.totalScore = test.questions.length;
      test.percentage = Math.round((correctCount / (test.questions.length || 1)) * 100);
      test.accuracy = test.percentage;
      test.completedAt = new Date().toISOString();

      db.saveTest(test);
      res.json(test);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to submit test' });
    }
  });

  // Mistakes API
  app.get('/api/mistakes', (req, res) => {
    const profile = db.getProfile();
    const activeGrade = (req.query.grade as string) || profile.grade;
    res.json(db.getMistakes(activeGrade));
  });

  app.post('/api/mistakes/:id/resolve', (req, res) => {
    db.resolveMistake(req.params.id);
    res.json({ success: true });
  });

  // Clear All Data Endpoint
  app.post('/api/user/clear-data', (req, res) => {
    const { name, email } = req.body || {};
    db.clearData(name, email);
    res.json({ success: true, message: 'All test and analytics data cleared.', profile: db.getProfile() });
  });

  // Study Plan API
  app.get('/api/study-plan', (req, res) => {
    const profile = db.getProfile();
    const activeGrade = (req.query.grade as string) || profile.grade;
    let plan = db.getLatestStudyPlan(activeGrade);
    if (!plan) {
      plan = generateMockStudyPlan('Alex Johnson', 2, activeGrade);
      db.saveStudyPlan(plan);
    }
    res.json(plan);
  });

  app.post('/api/study-plan/generate', (req, res) => {
    const { availableHoursPerDay, grade, selectedSubjectIds, selectedTopicIds } = req.body;
    const profile = db.getProfile();
    const activeGrade = grade || (req.query.grade as string) || profile.grade;
    const plan = generateMockStudyPlan('Alex Johnson', availableHoursPerDay || 2, activeGrade, selectedSubjectIds, selectedTopicIds);
    db.saveStudyPlan(plan);
    res.json(plan);
  });

  app.post('/api/study-plan/toggle-item', (req, res) => {
    const { planId, itemId } = req.body;
    const updated = db.toggleStudyPlanItem(planId, itemId);
    res.json(updated);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PAL Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
