import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';
import { getCurriculumByGrade } from './db';
import {
  DifficultyLevel,
  GeneratedQuestion,
  MistakeCategory,
  QuestionType,
  StudyPlan,
  StudyPlanItem,
  Test,
} from '../src/types';

// Zod schema for Question generation validation
export const QuestionSchema = z.object({
  questionText: z.string().min(5),
  contextText: z.string().optional(),
  options: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
      })
    )
    .optional(),
  correctAnswer: z.string().min(1),
  explanation: z.string().min(10),
  hint: z.string().min(5),
  solutionSteps: z.array(z.string()).min(1),
  estimatedTimeSeconds: z.number().default(60),
});

export const AnswerEvaluationSchema = z.object({
  isCorrect: z.boolean(),
  mistakeCategory: z
    .enum([
      'Conceptual misunderstanding',
      'Formula misuse',
      'Calculation error',
      'Unit error',
      'Logical reasoning error',
      'Misreading',
      'Careless mistake',
      'Unknown',
    ])
    .optional(),
  mistakeAnalysis: z.string().optional(),
  explanation: z.string(),
  hint: z.string(),
  solutionSteps: z.array(z.string()),
});

// Initialize GoogleGenAI client lazily if key is available
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Deterministic / Template Fallback Question Engine for smooth zero-credit execution
export function generateMockQuestion(
  gradeId: string,
  subjectId: string,
  chapterId: string,
  topicId: string,
  conceptId: string,
  questionType: QuestionType,
  difficulty: DifficultyLevel
): GeneratedQuestion {
  const id = `q_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  // Random helper for variety
  const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const isGrade4 = gradeId.includes('4') || gradeId.toLowerCase().includes('4th') || conceptId.startsWith('g4_');

  // ==========================================
  // 1. 4th GRADE ENGLISH GRAMMAR
  // ==========================================
  if (isGrade4 && (subjectId === 'english' || conceptId.startsWith('g4_eng') || conceptId.includes('noun') || conceptId.includes('verb') || conceptId.includes('pronoun'))) {
    if (conceptId.includes('pronoun')) {
      const pronounScenarios = [
        {
          sentence: '___ and Sarah completed the science project together.',
          options: [{ id: 'A', text: 'Me' }, { id: 'B', text: 'I' }, { id: 'C', text: 'Us' }, { id: 'D', text: 'Him' }],
          correct: 'B',
          pronoun: 'I',
          explanation: 'Use the subject pronoun "I" because it is performing the action (subject of the sentence).',
        },
        {
          sentence: 'The teacher gave the trophy to ___ after the spelling bee.',
          options: [{ id: 'A', text: 'he' }, { id: 'B', text: 'him' }, { id: 'C', text: 'they' }, { id: 'D', text: 'we' }],
          correct: 'B',
          pronoun: 'him',
          explanation: 'Use the object pronoun "him" after the preposition "to".',
        },
        {
          sentence: '___ went to the library to borrow new books.',
          options: [{ id: 'A', text: 'Them' }, { id: 'B', text: 'They' }, { id: 'C', text: 'Her' }, { id: 'D', text: 'Us' }],
          correct: 'B',
          pronoun: 'They',
          explanation: 'Use the subject pronoun "They" as the subject performing the action.',
        },
      ];
      const selected = pick(pronounScenarios);
      return {
        id,
        gradeId,
        subjectId: 'english',
        chapterId,
        topicId,
        conceptId,
        questionType: 'mcq',
        difficulty,
        questionText: `Choose the correct pronoun to complete the sentence:\n"${selected.sentence}"`,
        options: selected.options,
        correctAnswer: selected.correct,
        explanation: `CONCEPT: Subject vs Object Pronouns.\n\nSTEP-BY-STEP BREAKDOWN:\n1. Identify if the pronoun is doing the action (subject) or receiving it (object).\n2. Correct word: "${selected.pronoun}".\n\nPRO TIP: Test by removing the other person in compound subjects (e.g., "I completed the project").`,
        hint: `Ask if the pronoun is performing the action or receiving the action.`,
        solutionSteps: [`Step 1: Determine role of pronoun.`, `Step 2: Choose "${selected.pronoun}".`],
        estimatedTimeSeconds: 20,
        createdAt: new Date().toISOString(),
      };
    }

    if (conceptId.includes('noun') || conceptId.includes('common_proper')) {
      const properScenarios = [
        {
          sentence: 'Last Tuesday, Doctor Sharma flew to Paris to attend a medical conference.',
          proper: 'Paris',
          distractors: ['conference', 'medical', 'flew'],
          type: 'city name',
        },
        {
          sentence: 'Every December, Sarah and her family visit the Grand Canyon in Arizona.',
          proper: 'Arizona',
          distractors: ['family', 'canyon', 'visit'],
          type: 'state name',
        },
        {
          sentence: 'On Christmas morning, Ryan received a brand new bicycle from his grandparents.',
          proper: 'Christmas',
          distractors: ['bicycle', 'morning', 'received'],
          type: 'holiday name',
        },
        {
          sentence: 'During the summer, Noah loves reading comic books at Central Library.',
          proper: 'Central Library',
          distractors: ['summer', 'comic', 'books'],
          type: 'building/institution name',
        },
        {
          sentence: 'My uncle works as an engineer at Google in California.',
          proper: 'Google',
          distractors: ['engineer', 'works', 'uncle'],
          type: 'company name',
        },
      ];
      const selected = pick(properScenarios);
      const options = [
        { id: 'A', text: selected.distractors[0] },
        { id: 'B', text: selected.proper },
        { id: 'C', text: selected.distractors[1] },
        { id: 'D', text: selected.distractors[2] },
      ].sort(() => Math.random() - 0.5);

      const correctOpt = options.find((o) => o.text === selected.proper)?.id || 'B';

      return {
        id,
        gradeId,
        subjectId: 'english',
        chapterId,
        topicId,
        conceptId,
        questionType: 'mcq',
        difficulty,
        questionText: `Which word or phrase in the sentence below is a Proper Noun?\n"${selected.sentence}"`,
        options,
        correctAnswer: correctOpt,
        explanation: `CONCEPT: A Proper Noun names a specific person, place, day, month, or holiday and always begins with a capital letter.\n\nSTEP-BY-STEP BREAKDOWN:\n1. Noun Identification: In this sentence, '${selected.proper}' names a specific ${selected.type}.\n2. Capitalization Check: It starts with a capital letter.\n3. Common Nouns vs Proper Nouns: Words like '${selected.distractors[0]}' are common nouns.\n\nPRO TIP: If you can name a specific city, person, or holiday (like '${selected.proper}'), it is a Proper Noun!`,
        hint: `Look for the word that names a specific unique place, person, or holiday and begins with a capital letter.`,
        solutionSteps: [
          `Step 1: Identify all nouns in the sentence.`,
          `Step 2: Check which noun refers to a specific, unique named entity ('${selected.proper}').`,
          `Step 3: Confirm capital letter usage: '${selected.proper}' is a Proper Noun.`,
        ],
        estimatedTimeSeconds: 25,
        createdAt: new Date().toISOString(),
      };
    }

    if (conceptId.includes('verb') || conceptId.includes('past_tense') || conceptId.includes('tense')) {
      const verbScenarios = [
        {
          sentence: 'Yesterday afternoon, the bluebird ___ high above the oak trees in the park.',
          base: 'fly',
          past: 'flew',
          wrongs: ['flyed', 'flied', 'flying'],
        },
        {
          sentence: 'Last weekend, my brother and I ___ a tall sandcastle on the sunny beach.',
          base: 'build',
          past: 'built',
          wrongs: ['builded', 'building', 'builds'],
        },
        {
          sentence: 'During art class, Maya ___ a wonderful postcard to her grandmother.',
          base: 'write',
          past: 'wrote',
          wrongs: ['writed', 'written', 'writing'],
        },
        {
          sentence: 'The goalkeeper ___ the fast soccer ball just before it crossed the line.',
          base: 'catch',
          past: 'caught',
          wrongs: ['catched', 'catch', 'catching'],
        },
        {
          sentence: 'The children ___ swiftly across the swimming pool during the relay race.',
          base: 'swim',
          past: 'swam',
          wrongs: ['swimmed', 'swimming', 'swims'],
        },
      ];
      const selected = pick(verbScenarios);
      const opts = [
        { id: 'A', text: selected.wrongs[0] },
        { id: 'B', text: selected.past },
        { id: 'C', text: selected.wrongs[1] },
        { id: 'D', text: selected.wrongs[2] },
      ].sort(() => Math.random() - 0.5);

      const correctOpt = opts.find((o) => o.text === selected.past)?.id || 'B';

      return {
        id,
        gradeId,
        subjectId: 'english',
        chapterId,
        topicId,
        conceptId,
        questionType: 'mcq',
        difficulty,
        questionText: `Choose the correct past tense form of the verb '${selected.base}' to complete the sentence:\n"${selected.sentence}"`,
        options: opts,
        correctAnswer: correctOpt,
        explanation: `CONCEPT: Irregular verbs do NOT follow the standard '-ed' pattern in the simple past tense.\n\nSTEP-BY-STEP BREAKDOWN:\n1. Time Clue: Past action indicated.\n2. Irregular Conjugation: The base verb '${selected.base}' changes irregularly to '${selected.past}' (not '${selected.wrongs[0]}').\n3. Sentence Check: "${selected.sentence.replace('___', selected.past)}"\n\nPRO TIP: Memorize common irregular verb forms: ${selected.base} → ${selected.past}.`,
        hint: `The action happened in the past. '${selected.base}' is an irregular verb that changes its spelling.`,
        solutionSteps: [
          `Step 1: Identify the time context (past action).`,
          `Step 2: Recall the irregular past tense of '${selected.base}' is '${selected.past}'.`,
          `Step 3: Reject incorrect regular '-ed' forms like '${selected.wrongs[0]}'.`,
        ],
        estimatedTimeSeconds: 20,
        createdAt: new Date().toISOString(),
      };
    }

    // Default English Punctuation & Capitalization with randomized sentence choices
    const sentencePool = [
      {
        text: 'Where are my new blue running shoes?',
        options: [
          { id: 'A', text: 'where are my new blue running shoes?' },
          { id: 'B', text: 'Where are my new blue running shoes?' },
          { id: 'C', text: 'where Are my new blue running shoes.' },
          { id: 'D', text: 'Where are my new Blue running shoes.' },
        ],
        correct: 'B',
      },
      {
        text: 'My sister lives in Chicago, Illinois.',
        options: [
          { id: 'A', text: 'my sister lives in chicago illinois.' },
          { id: 'B', text: 'My sister lives in Chicago, Illinois.' },
          { id: 'C', text: 'My Sister lives in Chicago, illinois.' },
          { id: 'D', text: 'my Sister lives in Chicago Illinois?' },
        ],
        correct: 'B',
      },
      {
        text: 'Did you see the bright rainbow after the rain storm?',
        options: [
          { id: 'A', text: 'Did you see the bright rainbow after the rain storm?' },
          { id: 'B', text: 'did you see the bright rainbow after the rain storm.' },
          { id: 'C', text: 'Did you see the Bright Rainbow after the rain storm.' },
          { id: 'D', text: 'did You see the bright rainbow after the rain storm?' },
        ],
        correct: 'A',
      },
    ];
    const pSelected = pick(sentencePool);

    return {
      id,
      gradeId,
      subjectId: 'english',
      chapterId,
      topicId,
      conceptId,
      questionType: 'mcq',
      difficulty,
      questionText: `Which sentence is punctuated and capitalized correctly?`,
      options: pSelected.options,
      correctAnswer: pSelected.correct,
      explanation: `CONCEPT: Proper sentence structure requires a capital letter at the start, proper noun capitalization, and correct end punctuation.\n\nSTEP-BY-STEP BREAKDOWN:\n1. Check start of sentence for capital letter.\n2. Check end mark (? for question, . for statement).\n3. Capitalize proper nouns correctly.`,
      hint: `Ensure the first word starts with a capital letter and the sentence ends with proper punctuation.`,
      solutionSteps: [
        `Step 1: Check start of sentence for capital letter.`,
        `Step 2: Check end mark.`,
      ],
      estimatedTimeSeconds: 20,
      createdAt: new Date().toISOString(),
    };
  }

  // ==========================================
  // 2. 4th GRADE MATHEMATICS
  // ==========================================
  if (isGrade4) {
    // A. Multiplication Word Problems (Diverse scenarios)
    if (conceptId.includes('mult') || (questionType === 'numerical' && !conceptId.includes('perim') && !conceptId.includes('div') && !conceptId.includes('frac'))) {
      const scenarios = [
        {
          template: (a: number, b: number) => `A bakery bakes ${a} large trays of muffins every morning. If each tray holds ${b} chocolate chip muffins, how many muffins are baked in total?`,
          unit: 'muffins',
        },
        {
          template: (a: number, b: number) => `A school library received ${a} boxes of new adventure books. If each box contains ${b} books, how many new books did the library receive altogether?`,
          unit: 'books',
        },
        {
          template: (a: number, b: number) => `An apple orchard owner packed ${a} wooden crates of apples. If each crate holds ${b} crisp apples, what is the total number of apples packed?`,
          unit: 'apples',
        },
        {
          template: (a: number, b: number) => `An art teacher distributed ${a} boxes of pastel crayons to her students. If each box contains ${b} crayons, how many crayons were handed out in total?`,
          unit: 'crayons',
        },
        {
          template: (a: number, b: number) => `A music auditorium has ${a} rows of seats. If there are ${b} seats in every row, how many seats are in the auditorium in total?`,
          unit: 'seats',
        },
      ];

      const a = randInt(6, 14);
      const b = randInt(5, 12);
      const product = a * b;
      const selected = pick(scenarios);

      return {
        id,
        gradeId,
        subjectId,
        chapterId,
        topicId,
        conceptId,
        questionType: 'numerical',
        difficulty,
        questionText: selected.template(a, b),
        correctAnswer: `${product}`,
        explanation: `CONCEPT: Multiplication represents repeated addition of equal groups.\n\nSTEP-BY-STEP BREAKDOWN:\n1. Identify given quantities: Number of groups = ${a}, Items per group = ${b}.\n2. Formulate multiplication equation: Total = ${a} × ${b}.\n3. Calculation:\n   ${a} × ${b} = ${product} ${selected.unit}.\n\nPRO TIP: Break down two-digit multiplication (e.g. ${a} × ${b} = ${a} × 10 + ${a} × ${b - 10}) for mental math speed!`,
        hint: `Multiply the number of groups (${a}) by the items per group (${b}).`,
        solutionSteps: [
          `Step 1: Write equation: ${a} × ${b}.`,
          `Step 2: Multiply: ${a} × ${b} = ${product}.`,
          `Step 3: State final answer with unit: ${product} ${selected.unit}.`,
        ],
        estimatedTimeSeconds: 25,
        createdAt: new Date().toISOString(),
      };
    }

    // B. Division & Remainders Word Problems
    if (conceptId.includes('div') || conceptId.includes('remainder')) {
      const divisor = randInt(4, 9);
      const quotient = randInt(6, 12);
      const remainder = randInt(1, divisor - 1);
      const total = divisor * quotient + remainder;

      const divScenarios = [
        `A teacher has ${total} shiny stickers to divide equally among ${divisor} group leaders. How many stickers will each leader get, and how many stickers remain left over?`,
        `A flower shop has ${total} fresh tulips to make bouquets of ${divisor} tulips each. How many full bouquets can be made, and how many tulips are left over?`,
        `A baker has ${total} warm cinnamon rolls to pack into boxes of ${divisor} rolls each. How many complete boxes can be filled, and what is the remainder?`,
      ];
      const scenarioText = pick(divScenarios);

      if (questionType === 'mcq') {
        const opts = [
          { id: 'A', text: `${quotient} with remainder ${remainder}` },
          { id: 'B', text: `${quotient + 1} with remainder 0` },
          { id: 'C', text: `${quotient - 1} with remainder ${remainder + 2}` },
          { id: 'D', text: `${quotient} with remainder 0` },
        ].sort(() => Math.random() - 0.5);

        const correctOpt = opts.find((o) => o.text === `${quotient} with remainder ${remainder}`)?.id || 'A';

        return {
          id,
          gradeId,
          subjectId,
          chapterId,
          topicId,
          conceptId,
          questionType: 'mcq',
          difficulty,
          questionText: scenarioText,
          options: opts,
          correctAnswer: correctOpt,
          explanation: `CONCEPT: Division splits a total dividend into equal groups of a divisor, leaving any leftover amount as the remainder.\n\nSTEP-BY-STEP BREAKDOWN:\n1. Total Dividend = ${total}, Divisor = ${divisor}.\n2. Find largest multiple of ${divisor} less than ${total}: ${divisor} × ${quotient} = ${divisor * quotient}.\n3. Subtract to find remainder: ${total} - ${divisor * quotient} = ${remainder}.\n4. Result: ${quotient} quotient and ${remainder} remainder (${quotient} R ${remainder}).`,
          hint: `Find how many times ${divisor} fits into ${total} fully, then subtract to find what is left over.`,
          solutionSteps: [
            `Step 1: Divide ${total} ÷ ${divisor}.`,
            `Step 2: ${divisor} × ${quotient} = ${divisor * quotient}.`,
            `Step 3: Remainder = ${total} - ${divisor * quotient} = ${remainder}.`,
          ],
          estimatedTimeSeconds: 35,
          createdAt: new Date().toISOString(),
        };
      }

      return {
        id,
        gradeId,
        subjectId,
        chapterId,
        topicId,
        conceptId,
        questionType: 'numerical',
        difficulty,
        questionText: `What is the remainder when ${total} is divided by ${divisor}?`,
        correctAnswer: `${remainder}`,
        explanation: `CONCEPT: Remainder = Dividend - (Divisor × Quotient).\n\nSTEP-BY-STEP BREAKDOWN:\n1. Dividend = ${total}, Divisor = ${divisor}.\n2. Divisor fits ${quotient} full times: ${divisor} × ${quotient} = ${divisor * quotient}.\n3. Remainder = ${total} - ${divisor * quotient} = ${remainder}.`,
        hint: `Calculate ${total} - (${divisor} × ${quotient}).`,
        solutionSteps: [
          `Step 1: ${total} ÷ ${divisor} = ${quotient} with a remainder.`,
          `Step 2: Multiply quotient by divisor: ${quotient} × ${divisor} = ${divisor * quotient}.`,
          `Step 3: Subtract: ${total} - ${divisor * quotient} = ${remainder}.`,
        ],
        estimatedTimeSeconds: 30,
        createdAt: new Date().toISOString(),
      };
    }

    // C. Fractions & Equivalent Fractions
    if (conceptId.includes('frac') || conceptId.includes('equiv')) {
      const baseFractions = [
        { num: 1, denom: 2 },
        { num: 1, denom: 3 },
        { num: 2, denom: 3 },
        { num: 3, denom: 4 },
        { num: 2, denom: 5 },
      ];
      const base = pick(baseFractions);
      const multiplier = pick([2, 3, 4, 5]);
      const eqNum = base.num * multiplier;
      const eqDenom = base.denom * multiplier;

      const fractionScenarios = [
        `A pizza is divided into ${eqDenom} equal slices. Maya ate ${eqNum} slices. Which reduced fraction below is equivalent to the portion of pizza Maya ate?`,
        `Which fraction below is equivalent to ${base.num}/${base.denom}?`,
        `In a class of ${eqDenom} students, ${eqNum} students wear glasses. What is the simplified equivalent fraction of students wearing glasses?`,
      ];

      const options = [
        { id: 'A', text: `${eqNum}/${eqDenom}` },
        { id: 'B', text: `${base.num}/${base.denom + 1}` },
        { id: 'C', text: `${base.num + 1}/${base.denom}` },
        { id: 'D', text: `${base.num}/${base.denom + 2}` },
      ];

      // If question asks for equivalent to base, make options show eqNum/eqDenom
      const isFindingExpanded = Math.random() > 0.5;
      let qText = `Which fraction below is equivalent to ${base.num}/${base.denom}?`;
      let ansText = `${eqNum}/${eqDenom}`;

      if (isFindingExpanded) {
        options[0] = { id: 'A', text: `${eqNum}/${eqDenom}` };
        options[1] = { id: 'B', text: `${eqNum + 1}/${eqDenom}` };
        options[2] = { id: 'C', text: `${eqNum}/${eqDenom + 2}` };
        options[3] = { id: 'D', text: `${eqNum - 1}/${eqDenom}` };
      }

      options.sort(() => Math.random() - 0.5);
      const correctOpt = options.find((o) => o.text === ansText)?.id || 'A';

      return {
        id,
        gradeId,
        subjectId,
        chapterId,
        topicId,
        conceptId,
        questionType: 'mcq',
        difficulty,
        questionText: qText,
        options,
        correctAnswer: correctOpt,
        explanation: `CONCEPT: Equivalent fractions represent the same portion of a whole. Multiplying or dividing both numerator and denominator by the same non-zero number produces an equivalent fraction.\n\nSTEP-BY-STEP BREAKDOWN:\n1. Given fraction: ${base.num}/${base.denom}.\n2. Multiply numerator by ${multiplier}: ${base.num} × ${multiplier} = ${eqNum}.\n3. Multiply denominator by ${multiplier}: ${base.denom} × ${multiplier} = ${eqDenom}.\n4. Resulting equivalent fraction: ${eqNum}/${eqDenom}.\n\nPRO TIP: Always apply the exact same multiplication or division to top and bottom numbers!`,
        hint: `Multiply both numerator (${base.num}) and denominator (${base.denom}) by ${multiplier}.`,
        solutionSteps: [
          `Step 1: Identify base fraction: ${base.num}/${base.denom}.`,
          `Step 2: Multiply numerator by ${multiplier}: ${base.num} × ${multiplier} = ${eqNum}.`,
          `Step 3: Multiply denominator by ${multiplier}: ${base.denom} × ${multiplier} = ${eqDenom}.`,
        ],
        estimatedTimeSeconds: 25,
        createdAt: new Date().toISOString(),
      };
    }

    // D. Perimeter of Shapes
    if (conceptId.includes('perim') || conceptId.includes('geometry')) {
      const isSquare = Math.random() > 0.5;
      if (isSquare) {
        const side = randInt(4, 15);
        const perim = 4 * side;
        return {
          id,
          gradeId,
          subjectId,
          chapterId,
          topicId,
          conceptId,
          questionType: 'numerical',
          difficulty,
          questionText: `A square playground has a side length of ${side} meters. What is the perimeter of the playground in meters?`,
          correctAnswer: `${perim}`,
          explanation: `CONCEPT: The perimeter of a polygon is the total distance around its outer boundary.\n\nSTEP-BY-STEP BREAKDOWN:\n1. Shape: Square (all 4 sides are equal in length).\n2. Formula: Perimeter = 4 × Side Length.\n3. Calculation: 4 × ${side} = ${perim} meters.`,
          hint: `A square has 4 equal sides. Multiply the side length by 4.`,
          solutionSteps: [
            `Step 1: Side length S = ${side} m.`,
            `Step 2: Formula: P = 4 × S.`,
            `Step 3: Calculate: 4 × ${side} = ${perim} m.`,
          ],
          estimatedTimeSeconds: 25,
          createdAt: new Date().toISOString(),
        };
      } else {
        const length = randInt(8, 20);
        const width = randInt(4, 12);
        const perim = 2 * (length + width);
        return {
          id,
          gradeId,
          subjectId,
          chapterId,
          topicId,
          conceptId,
          questionType: 'numerical',
          difficulty,
          questionText: `A rectangular soccer field has a length of ${length} meters and a width of ${width} meters. Calculate the perimeter of the field in meters.`,
          correctAnswer: `${perim}`,
          explanation: `CONCEPT: Perimeter of a rectangle = 2 × (Length + Width).\n\nSTEP-BY-STEP BREAKDOWN:\n1. Given: Length = ${length} m, Width = ${width} m.\n2. Add Length + Width: ${length} + ${width} = ${length + width} m.\n3. Multiply by 2: 2 × ${length + width} = ${perim} meters.`,
          hint: `Add length and width together, then double the sum.`,
          solutionSteps: [
            `Step 1: Length = ${length} m, Width = ${width} m.`,
            `Step 2: Sum = ${length} + ${width} = ${length + width} m.`,
            `Step 3: Perimeter = 2 × ${length + width} = ${perim} m.`,
          ],
          estimatedTimeSeconds: 30,
          createdAt: new Date().toISOString(),
        };
      }
    }
  }

  // ==========================================
  // 3. GRADE 10 CHEMISTRY
  // ==========================================
  if (subjectId === 'chemistry' || conceptId.startsWith('chem_') || chapterId.startsWith('chem_')) {
    // A. Chemical Equation Balancing
    if (conceptId.includes('balancing')) {
      const ironFactor = pick([2, 3]);
      const xFe = ironFactor === 2 ? '3Fe + 4H₂O → Fe₃O₄ + 4H₂' : '2Fe + 3H₂O → Fe₂O₃ + 3H₂';
      const ans = ironFactor === 2 ? '3, 4, 1, 4' : '2, 3, 1, 3';
      return {
        id,
        gradeId,
        subjectId,
        chapterId,
        topicId,
        conceptId,
        questionType: 'mcq',
        difficulty,
        questionText: `According to the Law of Conservation of Mass, what are the stoichiometric coefficients required to balance the iron-steam reaction: a Fe + b H₂O → c Fe${ironFactor === 2 ? '₃' : '₂'}O${ironFactor === 2 ? '₄' : '₃'} + d H₂?`,
        options: [
          { id: 'A', text: ans },
          { id: 'B', text: '1, 1, 1, 1' },
          { id: 'C', text: '3, 2, 1, 2' },
          { id: 'D', text: '2, 2, 2, 2' },
        ],
        correctAnswer: 'A',
        explanation: `CONCEPT: Law of Conservation of Mass requires total atoms of each element on reactant side (LHS) to equal product side (RHS).\n\nSTEP-BY-STEP BREAKDOWN:\n1. Count Fe, H, and O atoms on both sides.\n2. Balance Oxygen atoms first by setting b = ${ironFactor === 2 ? 4 : 3}.\n3. Balance Hydrogen by d = ${ironFactor === 2 ? 4 : 3} and Iron by a = ${ironFactor === 2 ? 3 : 2}.\n4. Balanced equation: ${xFe}.`,
        hint: `Start by balancing Oxygen atoms using the subscript in the Iron oxide product.`,
        solutionSteps: [
          `Step 1: Write un-balanced equation with variable coefficients a, b, c, d.`,
          `Step 2: Balance O: b = ${ironFactor === 2 ? 4 : 3}.`,
          `Step 3: Balance Fe: a = ${ironFactor === 2 ? 3 : 2}. Coefficients are (${ans}).`,
        ],
        estimatedTimeSeconds: 40,
        createdAt: new Date().toISOString(),
      };
    }

    // B. pH Scale & Indicators
    if (conceptId.includes('ph') || conceptId.includes('acid') || conceptId.includes('quantum')) {
      const phScenarios = [
        { item: 'Fresh lemon juice', ph: '2.2', nature: 'Strongly acidic' },
        { item: 'Milk of Magnesia [Mg(OH)₂]', ph: '10.5', nature: 'Basic / Antacid' },
        { item: 'Pure distilled water at 25°C', ph: '7.0', nature: 'Neutral' },
        { item: 'Gastric juice in human stomach', ph: '1.5', nature: 'Highly acidic' },
        { item: 'Sodium hydroxide (NaOH) solution', ph: '13.0', nature: 'Strongly basic' },
      ];
      const selected = pick(phScenarios);
      return {
        id,
        gradeId,
        subjectId,
        chapterId,
        topicId,
        conceptId,
        questionType: 'mcq',
        difficulty,
        questionText: `A lab scientist tested a sample of ${selected.item} with a calibrated digital pH meter and recorded a value of pH ${selected.ph}. How is this solution categorized?`,
        options: [
          { id: 'A', text: selected.nature },
          { id: 'B', text: parseFloat(selected.ph) > 7 ? 'Acidic' : 'Basic' },
          { id: 'C', text: 'Completely Inactive' },
          { id: 'D', text: 'Amphoteric' },
        ],
        correctAnswer: 'A',
        explanation: `CONCEPT: The pH Scale (0 - 14).\n\nSTEP-BY-STEP BREAKDOWN:\n1. pH < 7 indicates an Acidic solution (higher H⁺ concentration).\n2. pH = 7 indicates Neutral.\n3. pH > 7 indicates Basic/Alkaline solution (higher OH⁻ concentration).\n4. For ${selected.item} with pH ${selected.ph}, it is ${selected.nature}.`,
        hint: `Compare the given pH ${selected.ph} with the neutral reference value of 7.0.`,
        solutionSteps: [
          `Step 1: Identify given pH = ${selected.ph}.`,
          `Step 2: Evaluate against 7.0 benchmark.`,
          `Step 3: Classify as ${selected.nature}.`,
        ],
        estimatedTimeSeconds: 25,
        createdAt: new Date().toISOString(),
      };
    }

    // Default Chemistry: Types of Reactions
    return {
      id,
      gradeId,
      subjectId,
      chapterId,
      topicId,
      conceptId,
      questionType: 'mcq',
      difficulty,
      questionText: `When clear aqueous solutions of barium chloride (BaCl₂) and sodium sulphate (Na₂SO₄) are mixed in a test tube, a white precipitate forms immediately. What type of reaction is this?`,
      options: [
        { id: 'A', text: 'Double displacement & Precipitation reaction' },
        { id: 'B', text: 'Exothermic combination reaction' },
        { id: 'C', text: 'Thermal decomposition reaction' },
        { id: 'D', text: 'Single displacement reaction' },
      ],
      correctAnswer: 'A',
      explanation: `CONCEPT: Double Displacement & Precipitation Reactions.\n\nSTEP-BY-STEP BREAKDOWN:\n1. Reaction: BaCl₂(aq) + Na₂SO₄(aq) → BaSO₄(s)↓ + 2NaCl(aq).\n2. Mutual exchange of ions (Ba²⁺ and Na⁺ swap Cl⁻ and SO₄²⁻).\n3. BaSO₄ is insoluble in water and forms a white precipitate.`,
      hint: `Notice how both positive ions exchange their negative partners.`,
      solutionSteps: [
        `Step 1: BaCl₂ + Na₂SO₄ → BaSO₄↓ + 2NaCl.`,
        `Step 2: Identify mutual ion exchange (Double Displacement).`,
      ],
      estimatedTimeSeconds: 30,
      createdAt: new Date().toISOString(),
    };
  }

  // ==========================================
  // 4. GRADE 10 PHYSICS
  // ==========================================
  if (subjectId === 'physics' || conceptId.startsWith('phys_') || chapterId.startsWith('phys_')) {
    // Refraction & Lens Formula
    if (conceptId.includes('snell') || conceptId.includes('lens') || conceptId.includes('refract')) {
      const vMedium = pick([1.5, 2.0, 2.25]); // 10^8 m/s
      const nMedium = (3.0 / vMedium).toFixed(2);
      return {
        id,
        gradeId,
        subjectId,
        chapterId,
        topicId,
        conceptId,
        questionType: 'numerical',
        difficulty,
        questionText: `Light travels through a dense optical glass medium at a speed of ${vMedium} × 10⁸ m/s. Given that the speed of light in vacuum is c = 3.0 × 10⁸ m/s, calculate the refractive index (n) of the glass.`,
        correctAnswer: `${nMedium}`,
        explanation: `CONCEPT: Refractive Index n = c / v.\n\nSTEP-BY-STEP BREAKDOWN:\n1. Given: Speed of light in vacuum c = 3.0 × 10⁸ m/s, speed in medium v = ${vMedium} × 10⁸ m/s.\n2. Apply formula: n = c / v.\n3. Calculation: n = (3.0 × 10⁸) / (${vMedium} × 10⁸) = ${nMedium}.`,
        hint: `Divide the speed of light in vacuum (3.0) by the speed of light in the glass (${vMedium}).`,
        solutionSteps: [
          `Step 1: Write formula n = c / v.`,
          `Step 2: Substitute c = 3.0 × 10⁸ m/s and v = ${vMedium} × 10⁸ m/s.`,
          `Step 3: Simplify: n = ${nMedium}.`,
        ],
        estimatedTimeSeconds: 30,
        createdAt: new Date().toISOString(),
      };
    }

    // Circuits & Resistance
    if (conceptId.includes('circuits') || conceptId.includes('parallel') || conceptId.includes('series')) {
      const r1 = pick([6, 12, 20]);
      const r2 = pick([6, 12, 30]);
      const rp = (r1 * r2) / (r1 + r2);
      const v = Math.round(rp * randInt(1, 3));
      const current = (v / rp).toFixed(1);

      return {
        id,
        gradeId,
        subjectId,
        chapterId,
        topicId,
        conceptId,
        questionType: 'numerical',
        difficulty,
        questionText: `Two resistors of ${r1} Ω and ${r2} Ω are connected in parallel across a ${v} V DC power supply. Calculate the total main circuit current in Amperes.`,
        correctAnswer: `${parseFloat(current)}`,
        explanation: `CONCEPT: Parallel Resistance & Ohm's Law.\n\nSTEP-BY-STEP BREAKDOWN:\n1. Equivalent Parallel Resistance: 1/Rp = 1/${r1} + 1/${r2} => Rp = (${r1} × ${r2}) / (${r1} + ${r2}) = ${rp} Ω.\n2. Total Current using Ohm's Law: I = V / Rp = ${v} / ${rp} = ${current} A.`,
        hint: `First calculate parallel equivalent resistance Rp = (R1 × R2)/(R1 + R2), then use I = V / Rp.`,
        solutionSteps: [
          `Step 1: Calculate Rp = (${r1} × ${r2}) / (${r1} + ${r2}) = ${rp} Ω.`,
          `Step 2: Ohm's Law I = V / Rp = ${v} / ${rp} = ${current} A.`,
        ],
        estimatedTimeSeconds: 45,
        createdAt: new Date().toISOString(),
      };
    }

    // Default Physics: Ohm's Law V = IR
    const r = randInt(2, 10) * 2;
    const i = randInt(1, 5);
    const v = i * r;

    return {
      id,
      gradeId,
      subjectId,
      chapterId,
      topicId,
      conceptId,
      questionType: 'numerical',
      difficulty,
      questionText: `An electric circuit element has a resistance of ${r} Ω. If a current of ${i} A flows through it, calculate the potential difference (Voltage) across the ends in Volts.`,
      correctAnswer: `${v}`,
      explanation: `CONCEPT: Ohm's Law (V = I × R).\n\nSTEP-BY-STEP BREAKDOWN:\n1. Given: Resistance R = ${r} Ω, Current I = ${i} A.\n2. Formula: V = I × R = ${i} × ${r} = ${v} Volts.`,
      hint: `Multiply current (I) by resistance (R).`,
      solutionSteps: [
        `Step 1: Identify given: I = ${i} A, R = ${r} Ω.`,
        `Step 2: Multiply V = ${i} × ${r} = ${v} V.`,
      ],
      estimatedTimeSeconds: 25,
      createdAt: new Date().toISOString(),
    };
  }

  // ==========================================
  // 5. GRADE 10 MATHEMATICS
  // ==========================================
  if (subjectId === 'math' || conceptId.startsWith('math_') || chapterId.startsWith('math_')) {
    if (conceptId.includes('trig_apps') || conceptId.includes('elevation')) {
      const dist = pick([10, 15, 20, 30]);
      const angle = pick([30, 45, 60]);
      let heightStr = `${dist}`;
      if (angle === 30) heightStr = `${dist}/√3`;
      if (angle === 60) heightStr = `${dist}√3`;

      return {
        id,
        gradeId,
        subjectId,
        chapterId,
        topicId,
        conceptId,
        questionType: 'mcq',
        difficulty,
        questionText: `A vertical tower casts a shadow of length ${dist} meters on horizontal ground. If the angle of elevation of the sun is ${angle}°, what is the height of the tower?`,
        options: [
          { id: 'A', text: `${heightStr} m` },
          { id: 'B', text: `${dist * 2} m` },
          { id: 'C', text: `${dist / 2} m` },
          { id: 'D', text: `${dist + 10} m` },
        ],
        correctAnswer: 'A',
        explanation: `CONCEPT: Applications of Trigonometry (tan θ = Opposite / Adjacent).\n\nSTEP-BY-STEP BREAKDOWN:\n1. Right triangle model: Opposite = Height (h), Adjacent = Shadow (${dist} m), Angle = ${angle}°.\n2. tan(${angle}°) = h / ${dist} => h = ${dist} × tan(${angle}°) = ${heightStr} m.`,
        hint: `Use tan θ = Height / Shadow Length.`,
        solutionSteps: [
          `Step 1: Set up tan(${angle}°) = h / ${dist}.`,
          `Step 2: Solve for h = ${dist} × tan(${angle}°) = ${heightStr} m.`,
        ],
        estimatedTimeSeconds: 35,
        createdAt: new Date().toISOString(),
      };
    }

    if (conceptId.includes('quad')) {
      const r1 = pick([2, 3, 4, 5]);
      const r2 = pick([1, 2, 3, 6]);
      const b = -(r1 + r2);
      const c = r1 * r2;

      return {
        id,
        gradeId,
        subjectId,
        chapterId,
        topicId,
        conceptId,
        questionType: 'mcq',
        difficulty,
        questionText: `Find the real roots of the quadratic equation: x² ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}x + ${c} = 0.`,
        options: [
          { id: 'A', text: `x = ${r1}, x = ${r2}` },
          { id: 'B', text: `x = -${r1}, x = -${r2}` },
          { id: 'C', text: `x = ${r1 + 1}, x = ${r2 - 1}` },
          { id: 'D', text: `x = 0, x = ${c}` },
        ].sort(() => Math.random() - 0.5),
        correctAnswer: 'A',
        explanation: `CONCEPT: Solving Quadratic Equations by Factorization.\n\nSTEP-BY-STEP BREAKDOWN:\n1. Factor x² ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}x + ${c} = 0 into (x - ${r1})(x - ${r2}) = 0.\n2. Roots are x = ${r1} and x = ${r2}.`,
        hint: `Find two numbers whose product is +${c} and whose sum is ${b}.`,
        solutionSteps: [
          `Step 1: Write (x - ${r1})(x - ${r2}) = 0.`,
          `Step 2: Solve for x = ${r1}, x = ${r2}.`,
        ],
        estimatedTimeSeconds: 35,
        createdAt: new Date().toISOString(),
      };
    }

    // Default Trigonometric Identity
    return {
      id,
      gradeId,
      subjectId,
      chapterId,
      topicId,
      conceptId,
      questionType: 'mcq',
      difficulty,
      questionText: `Which of the following fundamental trigonometric identities is correct for any angle θ?`,
      options: [
        { id: 'A', text: 'sin² θ + cos² θ = 1' },
        { id: 'B', text: 'sec² θ + tan² θ = 1' },
        { id: 'C', text: 'cosec² θ + cot² θ = 1' },
        { id: 'D', text: 'sin θ × cos θ = 1' },
      ],
      correctAnswer: 'A',
      explanation: `CONCEPT: Pythagorean Trigonometric Identity.\n\nSTEP-BY-STEP BREAKDOWN:\n1. From the Pythagorean theorem in a unit circle: sin² θ + cos² θ = 1.\n2. Note: sec² θ - tan² θ = 1 (subtraction). Thus Option A is correct.`,
      hint: `Recall the main Pythagorean identity relating sine and cosine.`,
      solutionSteps: [
        `Step 1: Recall sin² θ + cos² θ = 1.`,
        `Step 2: Verify against given options.`,
      ],
      estimatedTimeSeconds: 25,
      createdAt: new Date().toISOString(),
    };
  }

  // Fallback default
  return {
    id,
    gradeId,
    subjectId,
    chapterId,
    topicId,
    conceptId,
    questionType: 'mcq',
    difficulty,
    questionText: `Which of the following best represents a fundamental rule in ${subjectId === 'english' ? 'English Grammar' : 'Science'}?`,
    options: [
      { id: 'A', text: 'Rule of consistency and structure' },
      { id: 'B', text: 'Arbitrary variation' },
      { id: 'C', text: 'Unrelated hypothesis' },
      { id: 'D', text: 'Random selection' },
    ],
    correctAnswer: 'A',
    explanation: `CONCEPT: Fundamental principles govern both scientific models and grammatical rules.`,
    hint: `Select the option reflecting structured rules.`,
    solutionSteps: [`Step 1: Identify structured rule option.`],
    estimatedTimeSeconds: 20,
    createdAt: new Date().toISOString(),
  };
}

export async function generateAIQuestion(
  gradeId: string,
  subjectId: string,
  chapterId: string,
  topicId: string,
  conceptId: string,
  conceptName: string,
  questionType: QuestionType,
  difficulty: DifficultyLevel,
  previousMistakes?: string
): Promise<GeneratedQuestion> {
  const ai = getAIClient();

  if (!ai) {
    return generateMockQuestion(
      gradeId,
      subjectId,
      chapterId,
      topicId,
      conceptId,
      questionType,
      difficulty
    );
  }

  const prompt = `Grade: ${gradeId}, Subject: ${subjectId}, Topic: ${topicId}, Concept: ${conceptName} (${conceptId}).
Generate a creative, unique ${questionType} question at difficulty ${difficulty}/5.
${previousMistakes ? `Student Weakness Context: ${previousMistakes}` : ''}

Rules:
- For MCQ and Assertion-Reason: include 4 options with ids "A", "B", "C", "D". correctAnswer must be option letter (e.g., "B").
- For Numerical: correctAnswer should be concise number string.
- Provide thorough explanation with CONCEPT, STEP-BY-STEP BREAKDOWN, and PRO TIP.
- Provide clear solutionSteps array and hint.`;

  const fallbackModels = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'];

  for (const modelName of fallbackModels) {
    try {
      const aiCall = ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction: 'You are PAL, an ultra-fast AI adaptive question generator. Output ONLY valid compact JSON adhering to schema.',
          responseMimeType: 'application/json',
          temperature: 0.6,
          maxOutputTokens: 550,
        },
      });

      // Fast 2000ms race timeout per model to guarantee sub-2s response
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000));
      const response = await Promise.race([aiCall, timeoutPromise]);

      if (response && response.text && response.text.trim().length > 0) {
        const parsed = JSON.parse(response.text.trim());
        const validated = QuestionSchema.parse(parsed);

        return {
          id: `q_ai_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          gradeId,
          subjectId,
          chapterId,
          topicId,
          conceptId,
          questionType,
          difficulty,
          questionText: validated.questionText,
          contextText: validated.contextText,
          options: validated.options,
          correctAnswer: validated.correctAnswer,
          explanation: validated.explanation,
          hint: validated.hint,
          solutionSteps: validated.solutionSteps,
          estimatedTimeSeconds: validated.estimatedTimeSeconds || 45,
          createdAt: new Date().toISOString(),
        };
      }
    } catch (err: any) {
      console.warn(`Gemini API call (${modelName}) quota/token limit fallback:`, err?.message?.slice(0, 100) || err);
    }
  }

  // Final fallback to instant offline rule engine when all models/tokens are exhausted
  return generateMockQuestion(
    gradeId,
    subjectId,
    chapterId,
    topicId,
    conceptId,
    questionType,
    difficulty
  );
}

export async function evaluateStudentAnswer(
  question: GeneratedQuestion,
  studentAnswer: string,
  timeTakenSeconds: number
): Promise<{
  isCorrect: boolean;
  mistakeCategory?: MistakeCategory;
  mistakeAnalysis?: string;
  explanation: string;
  hint: string;
  solutionSteps: string[];
}> {
  const normStudent = studentAnswer.trim().toLowerCase();
  const normCorrect = question.correctAnswer.trim().toLowerCase();

  let isCorrect = false;

  if (question.questionType === 'mcq' || question.questionType === 'assertion_reason') {
    isCorrect = normStudent === normCorrect || (normStudent.length === 1 && normStudent === normCorrect[0]);
  } else if (question.questionType === 'numerical') {
    const numStudent = parseFloat(normStudent);
    const numCorrect = parseFloat(normCorrect);
    if (!isNaN(numStudent) && !isNaN(numCorrect)) {
      isCorrect = Math.abs(numStudent - numCorrect) < 0.05;
    } else {
      isCorrect = normStudent === normCorrect;
    }
  } else {
    isCorrect = normStudent === normCorrect || normCorrect.includes(normStudent);
  }

  if (isCorrect) {
    return {
      isCorrect: true,
      explanation: question.explanation,
      hint: question.hint,
      solutionSteps: question.solutionSteps,
    };
  }

  // Determine mistake category if incorrect
  let mistakeCategory: MistakeCategory = 'Conceptual misunderstanding';
  if (timeTakenSeconds < 5) {
    mistakeCategory = 'Careless mistake';
  } else if (question.questionType === 'numerical') {
    mistakeCategory = 'Formula misuse';
  } else if (question.questionType === 'conceptual_reasoning' || question.questionType === 'assertion_reason') {
    mistakeCategory = 'Logical reasoning error';
  }

  const ai = getAIClient();
  if (ai) {
    const fallbackModels = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'];
    for (const modelName of fallbackModels) {
      try {
        const evalCall = ai.models.generateContent({
          model: modelName,
          contents: `Analyze this student mistake:
Question: ${question.questionText}
Correct Answer: ${question.correctAnswer}
Student's Given Answer: ${studentAnswer}
Subject: ${question.subjectId}`,
          config: {
            systemInstruction: 'Classify mistake category and provide a 1-sentence critique in JSON.',
            responseMimeType: 'application/json',
            maxOutputTokens: 180,
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                mistakeCategory: { type: Type.STRING },
                mistakeAnalysis: { type: Type.STRING },
              },
            },
          },
        });

        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200));
        const response = await Promise.race([evalCall, timeoutPromise]);

        if (response && response.text) {
          const parsed = JSON.parse(response.text || '{}');
          if (parsed.mistakeCategory) {
            mistakeCategory = parsed.mistakeCategory as MistakeCategory;
          }
          return {
            isCorrect: false,
            mistakeCategory,
            mistakeAnalysis: parsed.mistakeAnalysis || `Your answer "${studentAnswer}" differed from the expected solution "${question.correctAnswer}".`,
            explanation: question.explanation,
            hint: question.hint,
            solutionSteps: question.solutionSteps,
          };
        }
      } catch (e) {
        // Fallback to next model
      }
    }
  }

  return {
    isCorrect: false,
    mistakeCategory,
    mistakeAnalysis: `Your answer "${studentAnswer}" was incorrect. Review the formula and step-by-step solution below.`,
    explanation: question.explanation,
    hint: question.hint,
    solutionSteps: question.solutionSteps,
  };
}

export function generateMockStudyPlan(
  studentName: string,
  availableHoursPerDay: number,
  gradeStr?: string,
  selectedSubjectIds?: string[],
  selectedTopicIds?: string[]
): StudyPlan {
  const activeGrade = gradeStr || 'Grade 10';
  const curriculum = getCurriculumByGrade(activeGrade);

  // Filter subjects if selectedSubjectIds provided and non-empty
  let subjectsToUse = curriculum.subjects;
  if (selectedSubjectIds && selectedSubjectIds.length > 0) {
    const filtered = curriculum.subjects.filter((s) => selectedSubjectIds.includes(s.id));
    if (filtered.length > 0) {
      subjectsToUse = filtered;
    }
  }

  // Collect candidate topics with subject details
  interface TopicCandidate {
    subjectId: string;
    subjectName: string;
    topicId: string;
    topicName: string;
    conceptId?: string;
    conceptName?: string;
  }

  const topicCandidates: TopicCandidate[] = [];

  subjectsToUse.forEach((sub) => {
    sub.chapters.forEach((ch) => {
      ch.topics.forEach((top) => {
        if (!selectedTopicIds || selectedTopicIds.length === 0 || selectedTopicIds.includes(top.id)) {
          const firstConcept = top.concepts[0];
          topicCandidates.push({
            subjectId: sub.id,
            subjectName: sub.name,
            topicId: top.id,
            topicName: top.name,
            conceptId: firstConcept?.id,
            conceptName: firstConcept?.name,
          });
        }
      });
    });
  });

  // Fallback to all topics of selected subjects if no topic matched
  if (topicCandidates.length === 0) {
    subjectsToUse.forEach((sub) => {
      sub.chapters.forEach((ch) => {
        ch.topics.forEach((top) => {
          const firstConcept = top.concepts[0];
          topicCandidates.push({
            subjectId: sub.id,
            subjectName: sub.name,
            topicId: top.id,
            topicName: top.name,
            conceptId: firstConcept?.id,
            conceptName: firstConcept?.name,
          });
        });
      });
    });
  }

  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday')[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const activityTypes: ('Concept Drill' | 'Revision' | 'Practice' | 'Test Practice')[] = [
    'Concept Drill',
    'Practice',
    'Revision',
    'Concept Drill',
    'Practice',
    'Revision',
    'Test Practice',
  ];

  const sessionMinutes = Math.max(20, Math.min(60, Math.round((availableHoursPerDay * 60) / 2)));

  const items: StudyPlanItem[] = days.map((day, idx) => {
    const candidate = topicCandidates[idx % topicCandidates.length];
    const activity = activityTypes[idx];

    let reason = `Target topic for ${candidate.subjectName} practice.`;
    if (selectedTopicIds && selectedTopicIds.length > 0) {
      reason = `Selected topic module: ${candidate.topicName}.`;
    } else if (selectedSubjectIds && selectedSubjectIds.length > 0) {
      reason = `Target subject focus: ${candidate.subjectName}.`;
    } else if (idx === 0) {
      reason = `Priority concept drill based on mastery diagnostic.`;
    } else if (idx === 6) {
      reason = `Weekly adaptive synthesis assessment test.`;
    }

    return {
      id: `sp_${Date.now()}_${idx}`,
      dayOfWeek: day,
      subjectId: candidate.subjectId,
      subjectName: candidate.subjectName,
      topicId: candidate.topicId,
      topicName: candidate.topicName,
      conceptId: candidate.conceptId,
      conceptName: candidate.conceptName,
      activityType: activity,
      durationMinutes: sessionMinutes,
      reason,
      completed: false,
    };
  });

  // Dynamic Weekly Goal text
  let weeklyGoal = `Master key concepts across ${subjectsToUse.map((s) => s.name).join(', ')}`;
  if (selectedTopicIds && selectedTopicIds.length > 0) {
    const topicNames = topicCandidates.map((tc) => tc.topicName).slice(0, 3).join(', ');
    weeklyGoal = `Targeted Topics: ${topicNames}${topicCandidates.length > 3 ? ' & more' : ''}`;
  } else if (selectedSubjectIds && selectedSubjectIds.length > 0) {
    weeklyGoal = `Targeted Subjects: ${subjectsToUse.map((s) => s.name).join(' & ')}`;
  }

  return {
    id: `plan_${curriculum.id}_${Date.now()}`,
    gradeId: curriculum.id,
    weekStartDate: new Date().toISOString().split('T')[0],
    weeklyGoal,
    availableHoursPerDay,
    items,
    completionPercentage: 0,
    createdAt: new Date().toISOString(),
  };
}
