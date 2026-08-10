# PAL — Progressive Assisted Learning

**PAL (Progressive Assisted Learning)** is a full-stack AI-assisted adaptive learning platform designed to provide personalized learning experiences for students. It combines adaptive assessment, AI-generated questions and explanations, concept mastery tracking, mistake analysis, analytics, and personalized study planning into a single learning system.

## Video Demo

`PAL-demo.mp4`

## Key Features

- **Adaptive Learning Engine:** Adjusts concept selection, difficulty, and question types based on student performance.
- **AI-Generated Questions:** Dynamically generates questions using the Google Gemini API.
- **Multiple Question Types:** Supports MCQs, numerical problems, fill-in-the-blanks, conceptual reasoning, graph-based, assertion/reasoning, case-based, and multi-step questions.
- **Concept Mastery Tracking:** Maintains individual mastery scores for concepts across different learning levels.
- **Mistake Tracker:** Records incorrect attempts and identifies recurring learning issues.
- **AI Explanations & Hints:** Provides explanations, hints, and solutions for incorrect answers.
- **Topic-Wise Tests:** Allows students to configure tests by topic, difficulty, question type, number of questions, and time limit.
- **Adaptive Tests:** Dynamically adjusts question difficulty according to student performance.
- **Personalized Analytics:** Tracks accuracy, mastery, difficulty-wise performance, question-type performance, and learning trends.
- **Personalized Study Plans:** Generates weekly plans based on weak concepts, performance, mistakes, and revision requirements.
- **Weekly Tests:** Generates assessments based on recently studied topics and learning history.
- **Persistent Learning History:** Stores attempts, generated questions, test results, mastery, mistakes, learning sessions, and study plans.
- **Responsive UI:** Designed for desktop, tablet, and mobile devices.

## System Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                 React Client Application                │
│  Dashboard | Curriculum | Learning | Tests | Analytics  │
│                    Study Plans                          │
└──────────────────────────┬──────────────────────────────┘
                           │
                           │ REST API
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 Express Backend Server                  │
│                                                         │
│  API Routes | Business Logic | Analytics Engine        │
│  Adaptive Learning Engine | AI Integration              │
└───────────────┬───────────────────────┬─────────────────┘
                │                       │
                ▼                       ▼
┌────────────────────────┐   ┌────────────────────────────┐
│    Google Gemini API   │   │     PAL Data Persistence   │
│                        │   │                            │
│ Question Generation    │   │ User Profiles              │
│ Explanations           │   │ Test Attempts              │
│ Hints & Solutions      │   │ Concept Mastery             │
│ Study Plans            │   │ Mistake History             │
│ Test Generation        │   │ Learning Sessions           │
└────────────────────────┘   └────────────────────────────┘
```

## Database Schema

PAL uses persistent data to maintain the student's learning history.

Core entities include:

- `User`
- `Grade`
- `Subject`
- `Chapter`
- `Topic`
- `Concept`
- `ConceptMastery`
- `Attempt`
- `GeneratedQuestion`
- `Mistake`
- `LearningSession`
- `Test`
- `TestQuestion`
- `TestResult`
- `StudyPlan`
- `StudyPlanItem`
- `AIRequestLog`

The curriculum follows the hierarchy:

```text
Grade
  │
  └── Subject
        │
        └── Chapter
              │
              └── Topic
                    │
                    └── Concept
```

## Tech Stack

### Frontend

- **Language:** TypeScript
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Data Visualization:** Recharts

### Backend

- **Language:** TypeScript
- **Runtime:** Node.js
- **Framework:** Express.js
- **API:** REST
- **Database:** PostgreSQL
- **ORM:** Prisma

### AI

- **AI Provider:** Google Gemini API
- **SDK:** `@google/genai`
- **Validation:** Zod
- **Capabilities:** Question generation, explanations, hints, solutions, study plans, and test generation

## Supported Learning

The platform supports:

- **Grade 4**
  - Mathematics
  - English Grammar

- **Grade 10**
  - Mathematics
  - Physics
  - Chemistry

The curriculum is stored as configurable data so additional grades, subjects, chapters, topics, and concepts can be added later.

## Learning Flow

```text
Student selects Grade
        ↓
Selects Subject
        ↓
Selects Chapter
        ↓
Selects Topic
        ↓
PAL retrieves current mastery
        ↓
Adaptive Engine selects:
Concept + Difficulty + Question Type
        ↓
AI generates question
        ↓
Question is validated
        ↓
Student answers
        ↓
Answer is evaluated
        ↓
Attempt is stored
        ↓
Concept mastery is updated
        ↓
Difficulty is recalculated
        ↓
Explanation / Hint shown if required
        ↓
Next question is selected
```

## Adaptive Learning

PAL maintains a mastery score between **0 and 100** for each concept.

| Mastery Score | Level |
|---|---|
| 0–30 | Beginner |
| 31–50 | Developing |
| 51–70 | Intermediate |
| 71–85 | Advanced |
| 86–100 | Mastered |

The adaptive engine considers:

- Recent accuracy
- Historical accuracy
- Question difficulty
- Response time
- Number of attempts
- Question type
- Recent mistakes
- Recency of practice

The AI does not directly control mastery or difficulty. These calculations remain part of the deterministic adaptive learning engine.

## Test Modes

PAL supports:

- **Standard Topic Test:** Balanced questions based on the selected topic and difficulty.
- **Adaptive Topic Test:** Difficulty changes according to student performance.
- **Weak Area Test:** Focuses on currently weak concepts.
- **Revision Test:** Focuses on concepts associated with previous mistakes.
- **Weekly Test:** Generates an assessment based on topics studied during the week.

Tests can be configured using:

- Number of questions
- Difficulty
- Question types
- Time limit
- Standard or adaptive mode

Test questions and test-related data are stored so completed tests can be reviewed later.

## AI Question Generation

Questions are dynamically generated using the Gemini API.

Each generated question can contain:

- Grade
- Subject
- Chapter
- Topic
- Concept
- Question type
- Difficulty
- Question text
- Options where applicable
- Correct answer
- Explanation
- Hint
- Solution
- Estimated solving time
- Generation metadata

Generated questions are validated before being presented to students.

```text
AI Generation
      ↓
Schema Validation
      ↓
Curriculum Validation
      ↓
Difficulty Validation
      ↓
Answer Validation
      ↓
Numerical Validation
      ↓
Accept / Regenerate / Reject
```

Structured responses are validated using Zod to prevent invalid AI-generated content from entering the learning system.

## Analytics

The dashboard provides insights into:

- Overall mastery
- Questions attempted
- Accuracy
- Learning progress
- Subject-wise mastery
- Strong concepts
- Weak concepts
- Recently improved concepts
- Concepts requiring revision
- Difficulty-wise performance
- Question-type performance
- Accuracy trends
- Mastery trends
- Test score trends
- Learning time
- Questions attempted over time

Analytics are based on persistent student activity rather than hardcoded or simulated metrics.

## Mistake Tracking

Incorrect answers are recorded and associated with the relevant student, question, concept, topic, and attempt.

PAL can categorize mistakes as:

- Conceptual misunderstanding
- Formula misuse
- Calculation error
- Unit error
- Logical reasoning error
- Misreading
- Careless mistake
- Unknown

The mistake history is used to identify recurring weaknesses and improve future recommendations.

## Personalized Study Plans

PAL generates weekly study plans based on the student's actual learning history.

The planning engine can consider:

- Available study time
- Available days
- Learning goals
- Selected subjects
- Exam date, where applicable
- Preferred intensity
- Weak concepts
- Current mastery
- Recent tests
- Mistakes
- Unfinished topics
- Revision requirements

The plan prioritizes areas that require additional practice or revision.

## Security

Security measures include:

- Secure authentication
- Password hashing
- Protected routes
- Input validation
- Rate limiting
- Secure headers
- CORS configuration
- Environment variables
- Server-side AI API calls

Sensitive credentials such as database credentials, authentication secrets, and Gemini API keys must remain server-side.

## Prerequisites

Before running PAL locally, ensure the following are installed:

- Git
- Node.js
- PostgreSQL
- npm

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/pal.git
cd pal
```

### 2. Install Dependencies

```bash
npm install
```

If the project uses separate frontend and backend directories:

```bash
cd frontend
npm install

cd ../backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file for the backend:

```env
DATABASE_URL=your_postgresql_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

Do not commit `.env` files or API keys to the repository.

### 4. Configure the Database

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Generate the Prisma client:

```bash
npx prisma generate
```

### 5. Start the Backend

```bash
npm run dev
```

### 6. Start the Frontend

In a separate terminal:

```bash
npm run dev
```

The application will be available at the local Vite development URL shown in the terminal.

## Project Structure

```text
PAL/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   └── ...
│
├── backend/
│   ├── routes/
│   ├── services/
│   ├── adaptive/
│   ├── ai/
│   ├── analytics/
│   └── ...
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── .env
└── README.md
```
