# StoryForge AI 🖋️✨
> **"Turn a Simple Idea Into a Complete Story."**
> Create original stories with AI by choosing your idea, genre, tone, and storytelling style powered by Google Gemini.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%20%2B%20TypeScript-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![Google Gemini API](https://img.shields.io/badge/AI-Google%20Gemini%202.5%20%2F%201.5-4285F4.svg?style=flat&logo=google)](https://aistudio.google.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?style=flat&logo=docker)](Dockerfile)
[![Render](https://img.shields.io/badge/Render-Deploy%20Ready-46E3B7.svg?style=flat&logo=render)](render.yaml)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF.svg?style=flat&logo=githubactions)](.github/workflows/ci.yml)

---

## 📖 Project Overview

**StoryForge AI** is a professional AI story generation web application designed to transform a brief premise into an expansive, polished, multi-chapter fiction narrative. Rather than merely expanding sentences like a generic chatbot, StoryForge AI executes a structured prompt-engineering pipeline:

```
USER INPUT
    ↓
INPUT ANALYSIS
    ↓
STORY BLUEPRINT (Premise, Theme, Conflict, 5-Act Plot Arc)
    ↓
CHARACTER DEVELOPMENT (Psychological motivations, fears, goals, arcs)
    ↓
PLOT DEVELOPMENT
    ↓
FULL STORY GENERATION (Paragraphs, dialogue, pacing, scene transitions)
    ↓
AI QUALITY CHECK (Plot consistency, character consistency, genre alignment)
    ↓
FINAL STORY & INTERACTIVE STUDIO (Read, Edit, Improve, Continue, Export)
```

---

## ✨ Key Features

1. **AI Story Generation**:
   - Converts short prompts into full-length, detailed, original stories with rich prose and natural dialogue.
2. **Genre Intelligence**:
   - Deep narrative conventions for 16 primary genres (*Fantasy, Mystery, Thriller, Horror, Romance, Science Fiction, Adventure, Comedy, Drama, Historical, Crime, Superhero, Slice of Life, Psychological, Action, Educational*) plus **Custom Genre** specification.
3. **Character Development & Bible**:
   - Automatically builds detailed character profiles complete with age, role, psychological motivation, concrete goal, fatal flaw, deepest fear, interpersonal dynamics, and character arc.
4. **Classic 5-Act Story Structure**:
   - Introduction, Rising Action, Climax, Falling Action, and Resolution aligned with the user's selected ending preference.
5. **Story Settings & Length Targets**:
   - Short (800–1,200 words), Medium (1,500–2,500 words), Long (3,000–5,000 words), Very Long (5,000+ words).
6. **Multi-Tone & Style Selectors**:
   - 12 story tones (*Suspenseful, Dark, Emotional, Funny, Romantic, etc.*).
   - 9 writing styles (*Cinematic, Literary, Descriptive, Conversational, Fast-paced, Detailed, Simple, Professional, Children's*) + **Custom Style**.
7. **Target Audience Adaptation**:
   - Children, Teenagers, Young Adults, Adults, General Audience.
8. **Ending Customization**:
   - Happy Ending, Sad Ending, Tragic Ending, Open Ending, Twist Ending, Unexpected Ending, AI Decides.
9. **Advanced Story Controls**:
   - Collapsible controls for number of characters, setting, time period, location, complexity, dialogue amount, description level, plot twist requirement, and moral message.
10. **Interactive Reading Studio**:
    - Typography controls, font size adjustments (A-, A, A+), font family switch (Serif, Sans, Classic), and reading themes (*Dark, Cozy Sepia, Clean Paper, Midnight*).
11. **Comprehensive Story Actions**:
    - **Regenerate**: Generate a new variation using the same parameters.
    - **Improve Story**: Direct Gemini to enhance *Plot*, *Characters*, *Dialogue*, *Descriptions*, or *Pacing*.
    - **Continue Story →**: Continue narrative seamlessly with plot twist or custom prompt.
    - **Rewrite**: Change genre, tone, ending, or writing style with instant regeneration.
    - **Shorten**: Condense the narrative for punchier pacing.
    - **Expand**: Deepen scene transitions, world-building, and dialogue.
    - **Copy**: One-click clipboard copy.
    - **Download**: Instant export as `.txt` or printable, book-styled `.pdf`.
12. **Multi-Chapter Generator**:
    - Expand into a multi-chapter serialized novel while maintaining character and plot continuity.
13. **In-Place Story Editor**:
    - Direct text editing with live word count + contextual in-place paragraph refinement without regenerating the entire story.
14. **AI Story Quality Check**:
    - Displays mandatory quality checks:
      - `✓ Plot consistency`
      - `✓ Character consistency`
      - `✓ Genre alignment`
      - `✓ Story structure`
15. **Full-Fidelity Demo Mode**:
    - Explore the complete application without requiring an API key using the rich pre-computed *Carlyle Library Mystery ("The Whispering Archives")*.

---

## 🏛️ Architecture & Project Structure

```
ComicCraft AI / StoryForge AI
├── backend/
│   ├── main.py               # FastAPI application & REST endpoints
│   ├── gemini_service.py     # Gemini API integration with model fallbacks
│   ├── prompt_engine.py      # System prompts & genre intelligence rules
│   ├── schemas.py            # Pydantic data models & request/response schemas
│   ├── story_generator.py    # Pipeline coordinator (Analysis -> Blueprint -> Draft -> Check)
│   ├── quality_checker.py    # Multi-dimensional narrative quality evaluator
│   ├── demo_data.py          # Pre-computed rich demo story & multi-chapter data
│   └── requirements.txt      # Python dependencies
├── src/
│   ├── components/
│   │   ├── Navbar.tsx                   # Top navigation with status & demo button
│   │   ├── LandingPage.tsx              # SaaS landing page with 6 feature cards
│   │   ├── StoryCreationPage.tsx        # Story creation studio & customization
│   │   ├── StoryResultPage.tsx          # Reader, Blueprint, Characters, Quality & Editor
│   │   ├── GenerationProgressModal.tsx  # 6-stage animated pipeline indicator
│   │   └── Modals/
│   │       ├── ImproveStoryModal.tsx    # Focus improvement modal
│   │       ├── ContinueStoryModal.tsx   # Continuation & plot twist modal
│   │       ├── RewriteStoryModal.tsx    # Genre/tone/style rewrite modal
│   │       ├── ChapterGenerateModal.tsx # Next chapter generator modal
│   │       └── ApiKeyModal.tsx          # Gemini API Key setup & connection test
│   ├── services/
│   │   └── api.ts             # API client connecting frontend to FastAPI backend
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces & types
│   ├── utils/
│   │   └── export.ts          # TXT, JSON, and PDF book manuscript export
│   ├── App.tsx                # Main App state coordinator
│   ├── main.tsx               # React DOM entrypoint
│   └── index.css              # Tailored typography, reader themes, & animations
├── generate_story.py          # Standalone CLI tool for terminal-based generation
├── index.html                 # HTML template with Google Fonts (Cinzel, Lora, Outfit, Inter)
├── tailwind.config.js         # Custom palette, typography, and glow effects
├── package.json               # Node.js dependencies & scripts
└── README.md                  # Comprehensive project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python**: 3.9+ (Python 3.11–3.13 recommended)
- **Node.js**: 18+ (Node.js 20 or 22 recommended)
- **Google Gemini API Key** (optional if using Demo Mode, get one at [Google AI Studio](https://aistudio.google.com/app/apikey))

---

### 2. Environment Setup

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API Key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=8000
HOST=127.0.0.1
```

> **Security Note:** The `GEMINI_API_KEY` is strictly accessed by the backend and is **never** bundled or exposed in frontend code.

---

### 3. Backend Installation & Startup

Open a terminal and navigate to the project directory:

```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Start the FastAPI backend server
python backend/main.py
```

The backend server will start at:
- **API Server:** `http://127.0.0.1:8000`
- **Swagger Documentation:** `http://127.0.0.1:8000/docs`
- **Health Check:** `http://127.0.0.1:8000/api/health`

---

### 4. Frontend Installation & Startup

In a second terminal:

```bash
# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

### 5. Running via the Standalone CLI

You can also generate complete stories directly from your terminal:

```bash
# Run with demo mode
python generate_story.py --demo

# Run with custom idea and Gemini API key
python generate_story.py --idea "A young clockmaker discovers a gear that turns backward in time." --genre "Fantasy" --style "Literary" --output "clockmaker_story.txt"
```

---

### 6. Production Deployment with Docker & Render

StoryForge AI is containerized as a unified multi-stage Docker build and ready for one-click deployment on Render.

#### Quick Deploy on Render:
1. Push this repository to GitHub or GitLab.
2. In [Render Dashboard](https://dashboard.render.com), click **New +** -> **Blueprint**.
3. Connect your repository. Render automatically reads [`render.yaml`](render.yaml).
4. Enter your `GEMINI_API_KEY` secret when prompted, and click **Apply**.

#### Local Docker Testing:
```bash
# Build the production image
docker build -t storyforge-ai .

# Run container locally
docker run -p 8000:8000 -e GEMINI_API_KEY="your-api-key" storyforge-ai
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for full deployment instructions, GitHub Actions CI/CD pipeline breakdown, and automated webhook deploy hook configuration.


---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and Gemini configuration status |
| `GET` | `/api/demo` | Retrieve pre-computed sample mystery story |
| `POST` | `/api/settings/verify-key` | Test connection for user-supplied Gemini API key |
| `POST` | `/api/story/analyze` | Step 1: Analyze story idea for premise & conflict |
| `POST` | `/api/story/generate` | Full 6-step AI generation pipeline |
| `POST` | `/api/story/improve` | Improve draft focusing on Plot, Characters, Dialogue, etc. |
| `POST` | `/api/story/continue` | Continue narrative preserving character and plot continuity |
| `POST` | `/api/story/rewrite` | Rewrite story with modified genre, tone, style, or ending |
| `POST` | `/api/story/shorten` | Condense narrative for punchier pacing |
| `POST` | `/api/story/expand` | Expand descriptions, dialogue, and atmospheric depth |
| `POST` | `/api/story/chapter` | Generate subsequent chapters with continuity |
| `POST` | `/api/story/check` | Analyze story quality across 6 craft dimensions |
| `POST` | `/api/story/edit-section` | In-place section modification without full story regeneration |

---

## 🌟 Demo Mode

StoryForge AI is 100% usable without an API key through its built-in **Demo Mode**:
- **Premise:** *"A student discovers a hidden room beneath his college library."*
- **Genre:** Mystery
- **Story:** *"The Whispering Archives"* (Complete 2-chapter mystery with characters Julian Hayes, Dr. Eleanor Vance, and Silas Reed).
- **Quality Check:** Evaluated and scored across plot coherence, character consistency, genre fidelity, and structure.

---

## 📄 License
MIT License. Built for advanced storytelling and AI engineering demonstrations.
