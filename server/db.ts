import fs from 'fs';
import path from 'path';
import {
  Attempt,
  ConceptMastery,
  Grade,
  MistakeRecord,
  StudyPlan,
  Test,
  UserProfile,
} from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'pal_db.json');

// Initial seed curriculum for Grade 10
export const INITIAL_CURRICULUM: Grade = {
  id: 'grade_10',
  name: 'Grade 10',
  subjects: [
    {
      id: 'math',
      name: 'Mathematics',
      code: 'math',
      description: 'Algebra, Trigonometry, Geometry, and Statistics',
      color: 'indigo',
      icon: 'Calculator',
      chapters: [
        {
          id: 'math_trig',
          name: 'Trigonometry',
          description: 'Ratios, identities, and real-world height & distance applications',
          subjectId: 'math',
          topics: [
            {
              id: 'math_trig_ratios',
              name: 'Trigonometric Ratios',
              description: 'Sine, Cosine, Tangent, Cosecant, Secant, Cotangent in right triangles',
              chapterId: 'math_trig',
              concepts: [
                { id: 'math_trig_ratios_basic', name: 'Definitions of Six Ratios', description: 'sin θ = opp/hyp, cos θ = adj/hyp, tan θ = opp/adj', topicId: 'math_trig_ratios' },
                { id: 'math_trig_ratios_values', name: 'Ratios of Specific Angles (0°, 30°, 45°, 60°, 90°)', description: 'Standard values and calculations', topicId: 'math_trig_ratios' },
              ],
            },
            {
              id: 'math_trig_identities',
              name: 'Trigonometric Identities',
              description: 'Pythagorean identities and simplification proofs',
              chapterId: 'math_trig',
              concepts: [
                { id: 'math_trig_ident_pythagorean', name: 'Pythagorean Identity: sin²θ + cos²θ = 1', description: 'Fundamental identities and transformations', topicId: 'math_trig_identities' },
                { id: 'math_trig_ident_proofs', name: 'Proving Trigonometric Identities', description: 'Manipulating LHS to equal RHS', topicId: 'math_trig_identities' },
              ],
            },
            {
              id: 'math_trig_apps',
              name: 'Heights and Distances',
              description: 'Angles of elevation and depression in word problems',
              chapterId: 'math_trig',
              concepts: [
                { id: 'math_trig_apps_elevation', name: 'Angle of Elevation & Depression', description: 'Calculating tree heights, tower distances using tan θ', topicId: 'math_trig_apps' },
              ],
            },
          ],
        },
        {
          id: 'math_quad',
          name: 'Polynomials & Quadratic Equations',
          description: 'Roots, factorization, nature of roots, and quadratic formula',
          subjectId: 'math',
          topics: [
            {
              id: 'math_quad_eq',
              name: 'Solving Quadratic Equations',
              description: 'Factorization and completing the square method',
              chapterId: 'math_quad',
              concepts: [
                { id: 'math_quad_factorization', name: 'Solving by Factorization', description: 'Splitting middle term to find roots', topicId: 'math_quad_eq' },
                { id: 'math_quad_formula', name: 'Quadratic Formula & Discriminant', description: 'x = (-b ± √(b² - 4ac)) / 2a and D = b² - 4ac', topicId: 'math_quad_eq' },
                { id: 'math_quad_nature_roots', name: 'Nature of Roots', description: 'Real & distinct (D > 0), Real & equal (D = 0), No real roots (D < 0)', topicId: 'math_quad_eq' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'physics',
      name: 'Physics',
      code: 'physics',
      description: 'Electricity, Magnetism, Light Reflection & Refraction',
      color: 'blue',
      icon: 'Zap',
      chapters: [
        {
          id: 'phys_elec',
          name: 'Electricity',
          description: 'Electric charge, current, voltage, resistance, and electrical energy',
          subjectId: 'physics',
          topics: [
            {
              id: 'phys_elec_current',
              name: 'Current and Potential Difference',
              description: 'Flow of charge I = Q/t and Voltage V = W/Q',
              chapterId: 'phys_elec',
              concepts: [
                { id: 'phys_elec_current_def', name: 'Electric Current & Ammeters', description: 'Definition of Ampere, charge flow rate I = Q/t', topicId: 'phys_elec_current' },
                { id: 'phys_elec_voltage_def', name: 'Potential Difference & Voltmeters', description: 'Work done per unit charge V = W/Q', topicId: 'phys_elec_current' },
              ],
            },
            {
              id: 'phys_elec_ohm',
              name: 'Ohm’s Law & Resistance',
              description: 'V = IR, resistivity, and factors affecting resistance',
              chapterId: 'phys_elec',
              concepts: [
                { id: 'phys_elec_ohms_law', name: 'Ohm’s Law (V = IR)', description: 'Direct proportionality of voltage and current at constant temperature', topicId: 'phys_elec_ohm' },
                { id: 'phys_elec_resistivity', name: 'Resistivity & Length/Area Factors', description: 'R = ρ L / A, temperature & material dependence', topicId: 'phys_elec_ohm' },
                { id: 'phys_elec_circuits', name: 'Series and Parallel Circuits', description: 'Equivalent resistance Rs = R1+R2, 1/Rp = 1/R1 + 1/R2', topicId: 'phys_elec_ohm' },
              ],
            },
            {
              id: 'phys_elec_power',
              name: 'Heating Effect & Electrical Power',
              description: 'Joule’s Law of Heating H = I²Rt, P = VI = I²R = V²/R',
              chapterId: 'phys_elec',
              concepts: [
                { id: 'phys_elec_power_calc', name: 'Electric Power & Energy Units', description: 'Calculating power (Watts) and commercial energy (kWh)', topicId: 'phys_elec_power' },
              ],
            },
          ],
        },
        {
          id: 'phys_light',
          name: 'Light - Reflection & Refraction',
          description: 'Mirrors, lenses, Snell’s Law, and image formation',
          subjectId: 'physics',
          topics: [
            {
              id: 'phys_light_refraction',
              name: 'Refraction & Lens Formula',
              description: 'Snell’s Law, refractive index, lens formula 1/f = 1/v - 1/u',
              chapterId: 'phys_light',
              concepts: [
                { id: 'phys_light_snell', name: 'Snell’s Law & Refractive Index', description: 'sin i / sin r = n2/n1, speed of light in media', topicId: 'phys_light_refraction' },
                { id: 'phys_light_lens_formula', name: 'Lens Formula & Magnification', description: '1/f = 1/v - 1/u, m = v/u = h\'/h', topicId: 'phys_light_refraction' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'chemistry',
      name: 'Chemistry',
      code: 'chemistry',
      description: 'Chemical Reactions, Acids & Bases, Metals, and Carbon Compounds',
      color: 'emerald',
      icon: 'FlaskConical',
      chapters: [
        {
          id: 'chem_rxn',
          name: 'Chemical Reactions & Equations',
          description: 'Types of chemical reactions, balancing, redox, and corrosion',
          subjectId: 'chemistry',
          topics: [
            {
              id: 'chem_rxn_types',
              name: 'Types of Chemical Reactions',
              description: 'Combination, Decomposition, Displacement, Double Displacement',
              chapterId: 'chem_rxn',
              concepts: [
                { id: 'chem_rxn_balancing', name: 'Balancing Chemical Equations', description: 'Law of Conservation of Mass and stoichiometric balancing', topicId: 'chem_rxn_types' },
                { id: 'chem_rxn_combination', name: 'Combination & Decomposition Reactions', description: 'Exothermic synthesis and endothermic breakdown reactions', topicId: 'chem_rxn_types' },
                { id: 'chem_rxn_redox', name: 'Oxidation and Reduction (Redox)', description: 'Gain/loss of oxygen/hydrogen, electron transfer', topicId: 'chem_rxn_types' },
              ],
            },
          ],
        },
        {
          id: 'chem_acid',
          name: 'Acids, Bases and Salts',
          description: 'pH scale, chemical properties, indicators, and important salts',
          subjectId: 'chemistry',
          topics: [
            {
              id: 'chem_acid_ph',
              name: 'pH Scale & Indicators',
              description: 'Hydrogen ion concentration [H+], universal indicator, neutralization',
              chapterId: 'chem_acid',
              concepts: [
                { id: 'chem_acid_ph_scale', name: 'The pH Scale (0 - 14)', description: 'Acidic (pH < 7), Neutral (pH = 7), Basic (pH > 7)', topicId: 'chem_acid_ph' },
                { id: 'chem_acid_quantum', name: 'Quantum Numbers & Ionization', description: 'Electron loss/gain in acid-base dissociation', topicId: 'chem_acid_ph' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const CURRICULUM_GRADE_10: Grade = INITIAL_CURRICULUM;

export const CURRICULUM_GRADE_4: Grade = {
  id: 'grade_4',
  name: '4th Standard',
  subjects: [
    {
      id: 'math',
      name: 'Mathematics',
      code: 'math',
      description: 'Multiplication, Division, Fractions, Geometry & Measurement',
      color: 'indigo',
      icon: 'Calculator',
      chapters: [
        {
          id: 'g4_math_mult_div',
          name: 'Multiplication & Division',
          description: 'Multiplication tables, multi-digit multiplication, and long division with remainders',
          subjectId: 'math',
          topics: [
            {
              id: 'g4_math_mult_tables',
              name: 'Multiplication Tables & Word Problems',
              description: 'Multiplying 2-digit numbers by 1-digit numbers and 10s',
              chapterId: 'g4_math_mult_div',
              concepts: [
                { id: 'g4_math_mult_10s', name: 'Multiplication by 10s and 100s', description: 'Multiplying numbers by multiples of 10 and 100', topicId: 'g4_math_mult_tables' },
                { id: 'g4_math_mult_2digit', name: '2-Digit Multiplication', description: 'Multiplying 2-digit numbers with regrouping', topicId: 'g4_math_mult_tables' },
              ],
            },
            {
              id: 'g4_math_div_basics',
              name: 'Division & Remainders',
              description: 'Sharing into equal groups and calculating remainders',
              chapterId: 'g4_math_mult_div',
              concepts: [
                { id: 'g4_math_div_sharing', name: 'Division as Equal Sharing', description: 'Dividing 2-digit numbers by single-digit divisors', topicId: 'g4_math_div_basics' },
                { id: 'g4_math_div_remainders', name: 'Finding Remainders', description: 'Understanding quotient and remainder relationships', topicId: 'g4_math_div_basics' },
              ],
            },
          ],
        },
        {
          id: 'g4_math_fractions',
          name: 'Fractions & Decimals',
          description: 'Understanding parts of a whole, numerators, denominators, and equivalent fractions',
          subjectId: 'math',
          topics: [
            {
              id: 'g4_math_fraction_basics',
              name: 'Understanding Fractions',
              description: 'Identifying numerators, denominators, and comparing fractions',
              chapterId: 'g4_math_fractions',
              concepts: [
                { id: 'g4_math_num_denom', name: 'Numerators & Denominators', description: 'Top and bottom numbers in fractional representations', topicId: 'g4_math_fraction_basics' },
                { id: 'g4_math_equiv_frac', name: 'Equivalent Fractions', description: 'Fractions that represent the same value (e.g. 1/2 = 2/4 = 4/8)', topicId: 'g4_math_fraction_basics' },
              ],
            },
          ],
        },
        {
          id: 'g4_math_geometry',
          name: 'Geometry & Measurement',
          description: '2D/3D shapes, perimeter of polygons, and unit conversions',
          subjectId: 'math',
          topics: [
            {
              id: 'g4_math_perimeter',
              name: 'Perimeter & Shapes',
              description: 'Calculating boundary lengths of squares, rectangles, and triangles',
              chapterId: 'g4_math_geometry',
              concepts: [
                { id: 'g4_math_perim_rect', name: 'Perimeter of Rectangles & Squares', description: 'P = 2 × (L + W) and P = 4 × S', topicId: 'g4_math_perimeter' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'english',
      name: 'English Grammar',
      code: 'english',
      description: 'Nouns, Pronouns, Verbs, Tenses, Punctuation & Sentence Structure',
      color: 'blue',
      icon: 'BookOpen',
      chapters: [
        {
          id: 'g4_eng_nouns',
          name: 'Nouns & Pronouns',
          description: 'Common & proper nouns, singular & plural rules, subject & object pronouns',
          subjectId: 'english',
          topics: [
            {
              id: 'g4_eng_types_nouns',
              name: 'Types of Nouns & Plurals',
              description: 'Identifying people, places, things, and plural ending rules',
              chapterId: 'g4_eng_nouns',
              concepts: [
                { id: 'g4_eng_common_proper', name: 'Common vs Proper Nouns', description: 'Capitalizing specific names of people, places, and holidays', topicId: 'g4_eng_types_nouns' },
                { id: 'g4_eng_plurals', name: 'Plural Noun Rules', description: 'Adding -s, -es, -ies, and irregular plurals (child/children)', topicId: 'g4_eng_types_nouns' },
              ],
            },
            {
              id: 'g4_eng_pronouns',
              name: 'Pronoun Usage',
              description: 'Replacing nouns with pronouns accurately',
              chapterId: 'g4_eng_nouns',
              concepts: [
                { id: 'g4_eng_subj_obj_pron', name: 'Subject & Object Pronouns', description: 'Using I, he, she, they vs me, him, her, them correctly', topicId: 'g4_eng_pronouns' },
              ],
            },
          ],
        },
        {
          id: 'g4_eng_verbs',
          name: 'Verbs & Tenses',
          description: 'Action verbs, simple present, simple past, and irregular verbs',
          subjectId: 'english',
          topics: [
            {
              id: 'g4_eng_tenses',
              name: 'Present, Past & Future Tenses',
              description: 'Identifying verb tenses and converting sentences',
              chapterId: 'g4_eng_verbs',
              concepts: [
                { id: 'g4_eng_past_tense', name: 'Regular & Irregular Past Tense', description: 'Forming past tense with -ed and irregular verbs (run/ran, catch/caught)', topicId: 'g4_eng_tenses' },
              ],
            },
          ],
        },
        {
          id: 'g4_eng_punctuation',
          name: 'Punctuation & Capitalization',
          description: 'Capital letters, periods, question marks, exclamation points, and commas',
          subjectId: 'english',
          topics: [
            {
              id: 'g4_eng_punc_rules',
              name: 'Sentence Punctuation',
              description: 'Fixing sentence capitalization and punctuation marks',
              chapterId: 'g4_eng_punctuation',
              concepts: [
                { id: 'g4_eng_cap_commas', name: 'Capitalization & End Marks', description: 'Starting sentences with capital letters and placing correct end punctuation', topicId: 'g4_eng_punc_rules' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export function getCurriculumByGrade(gradeStr?: string): Grade {
  if (gradeStr && (gradeStr.includes('4') || gradeStr.toLowerCase().includes('4th'))) {
    return CURRICULUM_GRADE_4;
  }
  return CURRICULUM_GRADE_10;
}

// Initial Student Masteries for Grade 10
export const SEED_MASTERIES_GRADE_10: ConceptMastery[] = [
  { conceptId: 'math_trig_ratios_basic', conceptName: 'Definitions of Six Ratios', topicId: 'math_trig_ratios', subjectId: 'math', score: 88, band: 'Mastered', totalAttempts: 18, correctAttempts: 16, lastPracticed: new Date().toISOString(), currentDifficultyTarget: 5, streak: 4 },
  { conceptId: 'math_trig_ident_pythagorean', conceptName: 'Pythagorean Identities', topicId: 'math_trig_identities', subjectId: 'math', score: 94, band: 'Mastered', totalAttempts: 22, correctAttempts: 21, lastPracticed: new Date().toISOString(), currentDifficultyTarget: 5, streak: 6 },
  { conceptId: 'math_trig_apps_elevation', conceptName: 'Angle of Elevation & Depression', topicId: 'math_trig_apps', subjectId: 'math', score: 72, band: 'Advanced', totalAttempts: 14, correctAttempts: 10, lastPracticed: new Date().toISOString(), currentDifficultyTarget: 4, streak: 2 },
  
  { conceptId: 'phys_elec_current_def', conceptName: 'Electric Current & Charge Flow', topicId: 'phys_elec_current', subjectId: 'physics', score: 78, band: 'Advanced', totalAttempts: 15, correctAttempts: 12, lastPracticed: new Date().toISOString(), currentDifficultyTarget: 4, streak: 3 },
  { conceptId: 'phys_elec_ohms_law', conceptName: 'Ohm’s Law (V = IR)', topicId: 'phys_elec_ohm', subjectId: 'physics', score: 48, band: 'Developing', totalAttempts: 16, correctAttempts: 8, lastPracticed: new Date().toISOString(), currentDifficultyTarget: 2, streak: 0 },
  { conceptId: 'phys_elec_circuits', conceptName: 'Resistance & Circuits', topicId: 'phys_elec_ohm', subjectId: 'physics', score: 48, band: 'Developing', totalAttempts: 12, correctAttempts: 6, lastPracticed: new Date().toISOString(), currentDifficultyTarget: 2, streak: 0 },
  { conceptId: 'phys_elec_power_calc', conceptName: 'Electric Power Calculations', topicId: 'phys_elec_power', subjectId: 'physics', score: 62, band: 'Intermediate', totalAttempts: 10, correctAttempts: 6, lastPracticed: new Date().toISOString(), currentDifficultyTarget: 3, streak: 1 },

  { conceptId: 'chem_rxn_balancing', conceptName: 'Balancing Chemical Equations', topicId: 'chem_rxn_types', subjectId: 'chemistry', score: 89, band: 'Mastered', totalAttempts: 20, correctAttempts: 18, lastPracticed: new Date().toISOString(), currentDifficultyTarget: 5, streak: 5 },
  { conceptId: 'chem_rxn_redox', conceptName: 'Oxidation & Reduction (Redox)', topicId: 'chem_rxn_types', subjectId: 'chemistry', score: 76, band: 'Advanced', totalAttempts: 12, correctAttempts: 9, lastPracticed: new Date().toISOString(), currentDifficultyTarget: 4, streak: 2 },
  { conceptId: 'chem_acid_ph_scale', conceptName: 'Acids & Bases (pH Scale)', topicId: 'chem_acid_ph', subjectId: 'chemistry', score: 89, band: 'Mastered', totalAttempts: 15, correctAttempts: 14, lastPracticed: new Date().toISOString(), currentDifficultyTarget: 5, streak: 4 },
  { conceptId: 'chem_acid_quantum', conceptName: 'Quantum Numbers & Dissociation', topicId: 'chem_acid_ph', subjectId: 'chemistry', score: 32, band: 'Beginner', totalAttempts: 10, correctAttempts: 3, lastPracticed: new Date().toISOString(), currentDifficultyTarget: 1, streak: 0 },
];

export const SEED_MASTERIES_GRADE_4: ConceptMastery[] = [
  { conceptId: 'g4_math_mult_10s', conceptName: 'Multiplication by 10s & 100s', topicId: 'g4_math_mult_tables', subjectId: 'math', score: 85, band: 'Mastered', totalAttempts: 16, correctAttempts: 14, lastPracticed: new Date().toISOString(), currentDifficultyTarget: 5, streak: 4 },
  { conceptId: 'g4_math_mult_2digit', conceptName: '2-Digit Multiplication', topicId: 'g4_math_mult_tables', subjectId: 'math', score: 72, band: 'Advanced', totalAttempts: 14, correctAttempts: 10, lastPracticed: new Date().toISOString(), currentDifficultyTarget: 4, streak: 2 },
  { conceptId: 'g4_math_div_sharing', conceptName: 'Division as Equal Sharing', topicId: 'g4_math_div_basics', subjectId: 'math', score: 65, band: 'Intermediate', totalAttempts: 12, correctAttempts: 8, lastPracticed: new Date().toISOString(), currentDifficultyTarget: 3, streak: 1 },
  { conceptId: 'g4_math_div_remainders', conceptName: 'Finding Remainders', topicId: 'g4_math_div_basics', subjectId: 'math', score: 45, band: 'Developing', totalAttempts: 15, correctAttempts: 7, lastPracticed: new Date().toISOString(), currentDifficultyTarget: 2, streak: 0 },
  { conceptId: 'g4_math_num_denom', conceptName: 'Numerators & Denominators', topicId: 'g4_math_fraction_basics', subjectId: 'math', score: 90, band: 'Mastered', totalAttempts: 20, correctAttempts: 18, lastPracticed: new Date().toISOString(), currentDifficultyTarget: 5, streak: 5 },
  { conceptId: 'g4_math_equiv_frac', conceptName: 'Equivalent Fractions', topicId: 'g4_math_fraction_basics', subjectId: 'math', score: 55, band: 'Developing', totalAttempts: 11, correctAttempts: 6, lastPracticed: new Date().toISOString(), currentDifficultyTarget: 2, streak: 0 },
  { conceptId: 'g4_math_perim_rect', conceptName: 'Perimeter of Rectangles', topicId: 'g4_math_perimeter', subjectId: 'math', score: 78, band: 'Advanced', totalAttempts: 13, correctAttempts: 10, lastPracticed: new Date().toISOString(), currentDifficultyTarget: 4, streak: 3 },

  { conceptId: 'g4_eng_common_proper', conceptName: 'Common vs Proper Nouns', topicId: 'g4_eng_types_nouns', subjectId: 'english', score: 88, band: 'Mastered', totalAttempts: 18, correctAttempts: 16, lastPracticed: new Date().toISOString(), currentDifficultyTarget: 5, streak: 4 },
  { conceptId: 'g4_eng_plurals', conceptName: 'Plural Noun Rules', topicId: 'g4_eng_types_nouns', subjectId: 'english', score: 70, band: 'Advanced', totalAttempts: 12, correctAttempts: 9, lastPracticed: new Date().toISOString(), currentDifficultyTarget: 4, streak: 2 },
  { conceptId: 'g4_eng_subj_obj_pron', conceptName: 'Subject & Object Pronouns', topicId: 'g4_eng_pronouns', subjectId: 'english', score: 40, band: 'Developing', totalAttempts: 10, correctAttempts: 4, lastPracticed: new Date().toISOString(), currentDifficultyTarget: 2, streak: 0 },
  { conceptId: 'g4_eng_past_tense', conceptName: 'Regular & Irregular Past Tense', topicId: 'g4_eng_tenses', subjectId: 'english', score: 50, band: 'Developing', totalAttempts: 12, correctAttempts: 6, lastPracticed: new Date().toISOString(), currentDifficultyTarget: 2, streak: 0 },
  { conceptId: 'g4_eng_cap_commas', conceptName: 'Capitalization & End Marks', topicId: 'g4_eng_punc_rules', subjectId: 'english', score: 82, band: 'Mastered', totalAttempts: 15, correctAttempts: 13, lastPracticed: new Date().toISOString(), currentDifficultyTarget: 5, streak: 3 },
];

export const SEED_MASTERIES: ConceptMastery[] = [
  ...SEED_MASTERIES_GRADE_10,
  ...SEED_MASTERIES_GRADE_4,
];

export const SEED_MISTAKES_GRADE_10: MistakeRecord[] = [
  {
    id: 'mistake_1',
    attemptId: 'att_seed_1',
    conceptId: 'chem_acid_quantum',
    conceptName: 'Quantum Numbers',
    topicId: 'chem_acid_ph',
    subjectId: 'chemistry',
    questionText: 'Which quantum number determines the orientation of an orbital in space?',
    studentAnswer: 'Principal quantum number (n)',
    correctAnswer: 'Magnetic quantum number (m_l)',
    category: 'Conceptual misunderstanding',
    explanation: 'The magnetic quantum number m_l specifies the spatial orientation of an orbital within a subshell.',
    hint: 'Think about orbital orientation vs energy level.',
    resolved: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mistake_2',
    attemptId: 'att_seed_2',
    conceptId: 'phys_elec_circuits',
    conceptName: 'Resistance & Circuits',
    topicId: 'phys_elec_ohm',
    subjectId: 'physics',
    questionText: 'Two resistors of 6 Ω and 12 Ω are connected in parallel across a 12 V battery. Calculate total current.',
    studentAnswer: '0.67 A',
    correctAnswer: '3.0 A',
    category: 'Formula misuse',
    explanation: 'Equivalent resistance in parallel is 1/Rp = 1/6 + 1/12 = 3/12 => Rp = 4 Ω. Current I = V/Rp = 12/4 = 3 A.',
    hint: 'Remember to invert 1/Rp to get Rp before applying I = V/R.',
    resolved: false,
    createdAt: new Date().toISOString(),
  },
];

export const SEED_MISTAKES_GRADE_4: MistakeRecord[] = [
  {
    id: 'g4_mistake_1',
    attemptId: 'att_seed_g4_1',
    conceptId: 'g4_eng_common_proper',
    conceptName: 'Common vs Proper Nouns',
    topicId: 'g4_eng_types_nouns',
    subjectId: 'english',
    questionText: 'Identify the proper noun in this sentence: "Every Friday, Lily visits the library in Chicago to borrow books."',
    studentAnswer: 'library',
    correctAnswer: 'Lily (or Chicago)',
    category: 'Conceptual misunderstanding',
    explanation: 'Proper nouns refer to specific names of people (Lily) or cities (Chicago) and must be capitalized. "Library" is a common noun because it refers to a general place.',
    hint: 'Look for words that name specific people or specific places.',
    resolved: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'g4_mistake_2',
    attemptId: 'att_seed_g4_2',
    conceptId: 'g4_math_div_remainders',
    conceptName: 'Finding Remainders',
    topicId: 'g4_math_div_basics',
    subjectId: 'math',
    questionText: 'A teacher has 29 pencils to share equally among 5 students. How many pencils will be left over?',
    studentAnswer: '5 pencils left',
    correctAnswer: '4 pencils left',
    category: 'Calculation error',
    explanation: 'Dividing 29 by 5 gives 5 with a remainder of 4 because 5 × 5 = 25, and 29 - 25 = 4 pencils left over.',
    hint: 'Subtract 5 × 5 from 29 to find what is left over.',
    resolved: false,
    createdAt: new Date().toISOString(),
  },
];

export interface DatabaseSchema {
  profile: UserProfile;
  masteries: ConceptMastery[];
  attempts: Attempt[];
  mistakes: MistakeRecord[];
  tests: Test[];
  studyPlans: StudyPlan[];
}

class PALDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadOrInitialize();
  }

  private loadOrInitialize(): DatabaseSchema {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure masteries contain grade 4 seed if missing
        const hasG4 = parsed.masteries?.some((m: ConceptMastery) => m.conceptId.startsWith('g4_') || m.subjectId === 'english');
        if (!hasG4 && parsed.masteries) {
          parsed.masteries.push(...SEED_MASTERIES_GRADE_4);
        }
        const hasG4Mistake = parsed.mistakes?.some((m: MistakeRecord) => m.conceptId.startsWith('g4_') || m.subjectId === 'english');
        if (!hasG4Mistake && parsed.mistakes) {
          parsed.mistakes.push(...SEED_MISTAKES_GRADE_4);
        }
        return parsed;
      } catch (e) {
        console.error('Failed to load pal_db.json, re-initializing...', e);
      }
    }

    const defaultData: DatabaseSchema = {
      profile: {
        id: 'user_1',
        name: 'Alex Johnson',
        email: 'alex@student.pal',
        grade: 'Grade 10',
        dailyStreak: 8,
        lastActiveDate: new Date().toISOString(),
        totalLearningTimeSeconds: 52200, // 14.5 hours
        targetExamDate: '2026-03-15',
        weeklyStudyHoursGoal: 15,
      },
      masteries: SEED_MASTERIES,
      attempts: [],
      mistakes: [
        ...SEED_MISTAKES_GRADE_10,
        ...SEED_MISTAKES_GRADE_4,
      ],
      tests: [],
      studyPlans: [],
    };

    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving database:', e);
    }
  }

  public getProfile(): UserProfile {
    return this.data.profile;
  }

  public updateProfile(updated: Partial<UserProfile>): UserProfile {
    this.data.profile = { ...this.data.profile, ...updated };
    this.saveData(this.data);
    return this.data.profile;
  }

  public getMasteries(gradeStr?: string): ConceptMastery[] {
    const targetGrade = gradeStr || this.data.profile.grade || 'Grade 10';
    const isGrade4 = targetGrade.includes('4') || targetGrade.toLowerCase().includes('4th');

    return this.data.masteries.filter((m) => {
      const itemIsG4 = m?.conceptId?.startsWith('g4_') || m?.subjectId === 'english';
      return isGrade4 ? itemIsG4 : !itemIsG4;
    });
  }

  public getMasteryByConcept(conceptId: string): ConceptMastery | undefined {
    return this.data.masteries.find((m) => m.conceptId === conceptId);
  }

  public saveMastery(mastery: ConceptMastery): void {
    const idx = this.data.masteries.findIndex((m) => m.conceptId === mastery.conceptId);
    if (idx >= 0) {
      this.data.masteries[idx] = mastery;
    } else {
      this.data.masteries.push(mastery);
    }
    this.saveData(this.data);
  }

  public addAttempt(attempt: Attempt): void {
    this.data.attempts.unshift(attempt);
    this.data.profile.totalLearningTimeSeconds += attempt.timeTakenSeconds;
    this.saveData(this.data);
  }

  public getAttempts(gradeStr?: string): Attempt[] {
    const targetGrade = gradeStr || this.data.profile.grade || 'Grade 10';
    const isGrade4 = targetGrade.includes('4') || targetGrade.toLowerCase().includes('4th');

    return this.data.attempts.filter((a) => {
      const itemIsG4 = a?.question?.subjectId === 'english' || a?.question?.conceptId?.startsWith('g4_');
      return isGrade4 ? itemIsG4 : !itemIsG4;
    });
  }

  public addMistake(mistake: MistakeRecord): void {
    this.data.mistakes.unshift(mistake);
    this.saveData(this.data);
  }

  public getMistakes(gradeStr?: string): MistakeRecord[] {
    const targetGrade = gradeStr || this.data.profile.grade || 'Grade 10';
    const isGrade4 = targetGrade.includes('4') || targetGrade.toLowerCase().includes('4th');

    return this.data.mistakes.filter((m) => {
      const itemIsG4 = m?.conceptId?.startsWith('g4_') || m?.subjectId === 'english';
      return isGrade4 ? itemIsG4 : !itemIsG4;
    });
  }

  public resolveMistake(mistakeId: string): void {
    const m = this.data.mistakes.find((x) => x.id === mistakeId);
    if (m) {
      m.resolved = true;
      this.saveData(this.data);
    }
  }

  public saveTest(test: Test): void {
    const idx = this.data.tests.findIndex((t) => t.id === test.id);
    if (idx >= 0) {
      this.data.tests[idx] = test;
    } else {
      this.data.tests.unshift(test);
    }
    this.saveData(this.data);
  }

  public getTest(testId: string): Test | undefined {
    return this.data.tests.find((t) => t.id === testId);
  }

  public getTests(): Test[] {
    return this.data.tests;
  }

  public saveStudyPlan(plan: StudyPlan): void {
    this.data.studyPlans.unshift(plan);
    this.saveData(this.data);
  }

  public getLatestStudyPlan(gradeStr?: string): StudyPlan | undefined {
    const targetGrade = gradeStr || this.data.profile.grade || 'Grade 10';
    const isGrade4 = targetGrade.includes('4') || targetGrade.toLowerCase().includes('4th');

    const found = this.data.studyPlans.find((p) => {
      if (!p) return false;
      const pIsG4 = p.gradeId === 'grade_4' || (Array.isArray(p.items) && p.items.some((i) => i?.subjectId === 'english' || (i?.conceptId && i.conceptId.startsWith('g4_'))));
      return isGrade4 ? pIsG4 : !pIsG4;
    });

    return found;
  }

  public toggleStudyPlanItem(planId: string, itemId: string): StudyPlan | undefined {
    const plan = this.data.studyPlans.find((p) => p.id === planId);
    if (plan) {
      const item = plan.items.find((i) => i.id === itemId);
      if (item) {
        item.completed = !item.completed;
        const completedCount = plan.items.filter((i) => i.completed).length;
        plan.completionPercentage = Math.round((completedCount / plan.items.length) * 100);
        this.saveData(this.data);
      }
    }
    return plan;
  }

  public clearData(name?: string, email?: string): void {
    this.data.attempts = [];
    this.data.tests = [];
    this.data.mistakes = [];
    this.data.studyPlans = [];
    this.data.profile.totalLearningTimeSeconds = 0;
    this.data.profile.dailyStreak = 0;
    this.data.profile.lastActiveDate = new Date().toISOString();
    if (name) this.data.profile.name = name;
    if (email) this.data.profile.email = email;

    // Reset masteries to zero/baseline practice state
    this.data.masteries = [
      ...SEED_MASTERIES_GRADE_10,
      ...SEED_MASTERIES_GRADE_4,
    ].map((m) => ({
      ...m,
      score: 0,
      band: 'Beginner' as const,
      totalAttempts: 0,
      correctAttempts: 0,
      streak: 0,
      lastPracticed: new Date().toISOString(),
    }));

    this.saveData(this.data);
  }
}

export const db = new PALDatabase();
