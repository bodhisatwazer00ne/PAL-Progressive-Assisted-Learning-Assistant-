import { ConceptMastery, DifficultyLevel, MasteryBand, QuestionType } from '../types';

export function getMasteryBand(score: number): MasteryBand {
  if (score <= 30) return 'Beginner';
  if (score <= 50) return 'Developing';
  if (score <= 70) return 'Intermediate';
  if (score <= 85) return 'Advanced';
  return 'Mastered';
}

export function calculateTargetDifficulty(masteryScore: number): DifficultyLevel {
  if (masteryScore <= 25) return 1;
  if (masteryScore <= 45) return 2;
  if (masteryScore <= 68) return 3;
  if (masteryScore <= 85) return 4;
  return 5;
}

export interface MasteryUpdateResult {
  newScore: number;
  delta: number;
  newBand: MasteryBand;
  newTargetDifficulty: DifficultyLevel;
  streak: number;
}

export function updateConceptMastery(
  current: ConceptMastery,
  isCorrect: boolean,
  questionDifficulty: DifficultyLevel,
  timeTakenSeconds: number,
  estimatedTimeSeconds: number
): MasteryUpdateResult {
  let score = current.score;
  let streak = current.streak;

  if (isCorrect) {
    streak = streak + 1;
    // Base gain scales with question difficulty
    let baseGain = 4 + questionDifficulty * 2.5; // Diff 1: 6.5, Diff 3: 11.5, Diff 5: 16.5
    
    // Streak multiplier
    if (streak >= 3) baseGain *= 1.25;
    if (streak >= 5) baseGain *= 1.4;

    // Time efficiency modifier
    if (estimatedTimeSeconds > 0 && timeTakenSeconds <= estimatedTimeSeconds * 0.75) {
      baseGain += 2; // Fast and accurate bonus
    }

    score += baseGain;
  } else {
    streak = 0;
    // Base loss scales inversely with difficulty (failing a diff 1 question hurts mastery more than failing diff 5)
    let baseLoss = 12 - questionDifficulty * 1.5; // Diff 1: 10.5 loss, Diff 5: 4.5 loss
    
    // Time modifier: if guessed extremely quickly (< 5s), count as careless penalty
    if (timeTakenSeconds < 5) {
      baseLoss += 3;
    }

    score -= baseLoss;
  }

  // Ensure 0 - 100 boundaries
  score = Math.max(0, Math.min(100, Math.round(score * 10) / 10));

  const newBand = getMasteryBand(score);
  const newTargetDifficulty = calculateTargetDifficulty(score);
  const delta = Math.round((score - current.score) * 10) / 10;

  return {
    newScore: score,
    delta,
    newBand,
    newTargetDifficulty,
    streak,
  };
}

export function selectNextQuestionType(
  targetDifficulty: DifficultyLevel,
  skillDistribution?: Record<QuestionType, number>
): QuestionType {
  // Map difficulty to appropriate question types
  const typesForDifficulty: Record<DifficultyLevel, QuestionType[]> = {
    1: ['mcq', 'fill_in_blank'],
    2: ['mcq', 'fill_in_blank', 'numerical'],
    3: ['mcq', 'numerical', 'conceptual_reasoning', 'assertion_reason'],
    4: ['numerical', 'conceptual_reasoning', 'assertion_reason', 'graph_based'],
    5: ['conceptual_reasoning', 'graph_based', 'case_based', 'numerical'],
  };

  const pool = typesForDifficulty[targetDifficulty] || ['mcq'];

  // If skill distribution available, slightly prioritize question types with lower accuracy
  if (skillDistribution) {
    const sorted = [...pool].sort((a, b) => (skillDistribution[a] ?? 100) - (skillDistribution[b] ?? 100));
    // 60% chance to pick the weaker format to help practice
    if (Math.random() < 0.6) {
      return sorted[0];
    }
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
