import { Attempt, ConceptMastery, DashboardStats, DifficultyLevel } from '../types';

export function computeDashboardStats(
  masteries: ConceptMastery[],
  attempts: Attempt[],
  gradeStr?: string
): DashboardStats {
  const isGrade4 = gradeStr && (gradeStr.includes('4') || gradeStr.toLowerCase().includes('4th'));

  const totalAttempts = attempts.length;
  const hasAttempts = totalAttempts > 0;

  // Total questions attempted and study hours
  const totalQuestionsAttempted = totalAttempts;
  const totalTimeSeconds = attempts.reduce((acc, a) => acc + a.timeTakenSeconds, 0);
  const totalStudyHours = totalTimeSeconds > 0 ? Math.round((totalTimeSeconds / 3600) * 10) / 10 : 0;

  // Accuracy Rate
  const correctAttempts = attempts.filter((a) => a.isCorrect).length;
  const accuracyRate = hasAttempts ? Math.round((correctAttempts / totalAttempts) * 1000) / 10 : 0;

  // Overall Mastery
  const masteriesWithAttempts = masteries.filter((m) => m.totalAttempts > 0);
  const totalMastery = hasAttempts && masteriesWithAttempts.length > 0
    ? Math.round(masteriesWithAttempts.reduce((acc, m) => acc + m.score, 0) / masteriesWithAttempts.length)
    : 0;

  // Subject masteries
  const subjectScores: Record<string, { total: number; count: number; attempts: number }> = {};
  masteries.forEach((m) => {
    if (!subjectScores[m.subjectId]) {
      subjectScores[m.subjectId] = { total: 0, count: 0, attempts: 0 };
    }
    subjectScores[m.subjectId].total += m.score;
    subjectScores[m.subjectId].count += 1;
    subjectScores[m.subjectId].attempts += m.totalAttempts;
  });

  const subjectMastery: Record<string, number> = {};
  if (isGrade4) {
    subjectMastery['math'] = (subjectScores['math'] && subjectScores['math'].attempts > 0)
      ? Math.round(subjectScores['math'].total / subjectScores['math'].count)
      : 0;
    subjectMastery['english'] = (subjectScores['english'] && subjectScores['english'].attempts > 0)
      ? Math.round(subjectScores['english'].total / subjectScores['english'].count)
      : 0;
  } else {
    subjectMastery['math'] = (subjectScores['math'] && subjectScores['math'].attempts > 0)
      ? Math.round(subjectScores['math'].total / subjectScores['math'].count)
      : 0;
    subjectMastery['physics'] = (subjectScores['physics'] && subjectScores['physics'].attempts > 0)
      ? Math.round(subjectScores['physics'].total / subjectScores['physics'].count)
      : 0;
    subjectMastery['chemistry'] = (subjectScores['chemistry'] && subjectScores['chemistry'].attempts > 0)
      ? Math.round(subjectScores['chemistry'].total / subjectScores['chemistry'].count)
      : 0;
  }

  // Strong concepts (>= 70%) and Weak concepts (< 70%) only for concepts that have attempts
  const masteriesAttempted = masteries.filter((m) => m.totalAttempts > 0);
  const sortedMasteries = [...masteriesAttempted].sort((a, b) => b.score - a.score);
  const strongConcepts = sortedMasteries.filter((m) => m.score >= 70).slice(0, 4);
  const weakConcepts = [...masteriesAttempted].sort((a, b) => a.score - b.score).filter((m) => m.score < 70).slice(0, 4);

  // Skill distribution by question type
  const typeStats: Record<string, { total: number; correct: number }> = {};
  attempts.forEach((a) => {
    const qType = a.question.questionType;
    if (!typeStats[qType]) typeStats[qType] = { total: 0, correct: 0 };
    typeStats[qType].total += 1;
    if (a.isCorrect) typeStats[qType].correct += 1;
  });

  const skillDistribution: Record<string, number> = {
    mcq: typeStats['mcq'] ? Math.round((typeStats['mcq'].correct / typeStats['mcq'].total) * 100) : 0,
    numerical: typeStats['numerical'] ? Math.round((typeStats['numerical'].correct / typeStats['numerical'].total) * 100) : 0,
    conceptual_reasoning: typeStats['conceptual_reasoning'] ? Math.round((typeStats['conceptual_reasoning'].correct / typeStats['conceptual_reasoning'].total) * 100) : 0,
    graph_based: typeStats['graph_based'] ? Math.round((typeStats['graph_based'].correct / typeStats['graph_based'].total) * 100) : 0,
    case_based: typeStats['case_based'] ? Math.round((typeStats['case_based'].correct / typeStats['case_based'].total) * 100) : 0,
    assertion_reason: typeStats['assertion_reason'] ? Math.round((typeStats['assertion_reason'].correct / typeStats['assertion_reason'].total) * 100) : 0,
    fill_in_blank: typeStats['fill_in_blank'] ? Math.round((typeStats['fill_in_blank'].correct / typeStats['fill_in_blank'].total) * 100) : 0,
  };

  // Difficulty performance
  const diffPerf: Record<DifficultyLevel, { attempted: number; correct: number }> = {
    1: { attempted: 0, correct: 0 },
    2: { attempted: 0, correct: 0 },
    3: { attempted: 0, correct: 0 },
    4: { attempted: 0, correct: 0 },
    5: { attempted: 0, correct: 0 },
  };

  attempts.forEach((a) => {
    const diff = a.question.difficulty;
    if (diffPerf[diff]) {
      diffPerf[diff].attempted += 1;
      if (a.isCorrect) diffPerf[diff].correct += 1;
    }
  });

  // Recommendation
  const aiRecommendation = hasAttempts
    ? {
        title: 'Targeted Drill Recommended',
        description: `Based on your recent attempts, focus on practicing core concepts to boost your mastery.`,
        actionConceptId: weakConcepts[0]?.conceptId || (isGrade4 ? 'g4_math_div_remainders' : 'phys_elec_ohm'),
        actionTopicId: weakConcepts[0]?.topicId || (isGrade4 ? 'g4_math_div_basics' : 'phys_elec_ohm'),
        actionSubjectId: weakConcepts[0]?.subjectId || (isGrade4 ? 'math' : 'physics'),
      }
    : {
        title: 'Welcome to PAL!',
        description: 'You have created a new account. Take your first test or learning drill to begin tracking your analytics & mastery.',
        actionConceptId: isGrade4 ? 'g4_math_div_remainders' : 'phys_elec_ohm',
        actionTopicId: isGrade4 ? 'g4_math_div_basics' : 'phys_elec_ohm',
        actionSubjectId: isGrade4 ? 'math' : 'physics',
      };

  // Mastery Trend
  const masteryTrend = hasAttempts
    ? (isGrade4
        ? [
            { date: 'Week 1', math: 0, english: 0 },
            { date: 'Current', math: subjectMastery.math || 0, english: subjectMastery.english || 0 },
          ]
        : [
            { date: 'Week 1', math: 0, physics: 0, chemistry: 0 },
            { date: 'Current', math: subjectMastery.math || 0, physics: subjectMastery.physics || 0, chemistry: subjectMastery.chemistry || 0 },
          ])
    : (isGrade4
        ? [
            { date: 'Start', math: 0, english: 0 },
            { date: 'Current', math: 0, english: 0 },
          ]
        : [
            { date: 'Start', math: 0, physics: 0, chemistry: 0 },
            { date: 'Current', math: 0, physics: 0, chemistry: 0 },
          ]);

  return {
    overallMastery: totalMastery,
    masteryDelta: 0,
    accuracyRate,
    totalQuestionsAttempted,
    totalStudyHours,
    streakDays: hasAttempts ? 1 : 0,
    subjectMastery,
    strongConcepts,
    weakConcepts,
    skillDistribution,
    difficultyPerformance: diffPerf,
    aiRecommendation,
    masteryTrend: masteryTrend as any,
  };
}
