# 🚀 Deployment Guide: StoryForge AI on Render & GitHub Actions

This guide explains how to deploy **StoryForge AI** (FastAPI backend + React Vite frontend) into production using **Docker**, **Render**, and automated **GitHub Actions CI/CD**.

---

## 🏗️ Architecture Overview

StoryForge AI is containerized as a unified, production-ready multi-stage Docker application:

```
┌────────────────────────────────────────────────────────┐
│ Stage 1: node:20-alpine (frontend-builder)             │
│   • npm ci                                             │
│   • npm run build (tsc + vite) -> /app/dist            │
└───────────────────────────┬────────────────────────────┘
                            │ Built static assets
┌───────────────────────────▼────────────────────────────┐
│ Stage 2: python:3.11-slim (Production Service)          │
│   • FastAPI + Uvicorn server                           │
│   • Dynamic $PORT binding (Render compatible)          │
│   • Non-root security user (`appuser`)                 │
│   • Static file serving + SPA fallback routing         │
│   • Health check endpoint: `/api/health`               │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Option 1: Deploy with Render Blueprint (Recommended)

Render Blueprints allow zero-configuration deployments using the [`render.yaml`](file:///C:/Users/sudhar/Documents/ComicCraft_AI/render.yaml) specification in the root of the repository.

### Step 1: Push Repository to GitHub or GitLab
Push your project code including `render.yaml`, `Dockerfile`, and `.github/workflows/` to your Git provider.

### Step 2: Create Blueprint on Render
1. Navigate to the [Render Dashboard](https://dashboard.render.com).
2. Click **New +** in the top navigation and select **Blueprint**.
3. Connect your Git repository.
4. Render will detect `render.yaml` and configure the `storyforge-ai` web service.

### Step 3: Configure Environment Secrets
When prompted by Render:
- **`GEMINI_API_KEY`**: Paste your Google Gemini API key (from [Google AI Studio](https://aistudio.google.com)).
- Click **Apply**.

Render will trigger the multi-stage Docker build and provide a live URL (e.g., `https://storyforge-ai.onrender.com`).

---

## 🛠️ Option 2: Manual Web Service Deployment on Render

If you prefer to configure the service manually:

1. In [Render Dashboard](https://dashboard.render.com), click **New +** -> **Web Service**.
2. Connect your Git repository.
3. Configure the service settings:
   - **Name**: `storyforge-ai`
   - **Region**: Choose the closest region (e.g., Oregon, Frankfurt).
   - **Branch**: `main` (or `master`).
### Mode A: Docker Runtime (Recommended)
1. Set **Runtime**: `Docker`
2. Set **Dockerfile Path**: `./Dockerfile`
3. Set **Health Check Path**: `/api/health`
4. Set Environment Variables:
   - `GEMINI_API_KEY`: Your Gemini API key
   - `IMAGE_PROVIDER`: `pollinations`
   - `ENV`: `production`

### Mode B: Native Python Runtime
1. Set **Runtime**: `Python`
2. Set **Build Command**: `./build.sh` (or `pip install -r requirements.txt`)
3. Set **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Set **Health Check Path**: `/api/health`
5. Set Environment Variables:
   - `GEMINI_API_KEY`: Your Gemini API key
   - `IMAGE_PROVIDER`: `pollinations`
   - `ENV`: `production`
6. Click **Create Web Service**.

---

## 🔄 Automated CI/CD with GitHub Actions

The repository includes two automated workflows:

### 1. Continuous Integration (`.github/workflows/ci.yml`)
Triggers on every `push` and `pull_request` targeting `main` or `master`:
- **`backend-ci`**:
  - Sets up Python 3.11 with pip caching.
  - Installs production dependencies and test packages.
  - Runs **Ruff** code formatting and lint verification (`ruff check .`).
  - Runs **Pytest** test suite with coverage tracking (`pytest --cov=backend`).
  - Uploads `coverage.xml` test report.
- **`frontend-ci`**:
  - Sets up Node.js 20 with npm caching.
  - Installs clean dependencies via `npm ci`.
  - Runs TypeScript type checking (`tsc --noEmit`).
  - Runs Vitest unit tests (`npm test`).
  - Builds the production bundle (`vite build`).
  - Uploads `dist/` build artifact.
- **`security-scan`**:
  - Audits production npm dependencies (`npm audit --omit=dev --audit-level=high`).
  - Scans Python dependencies with **pip-audit** against PyPI vulnerability advisories.

### 2. Automatic Continuous Deployment (`.github/workflows/render-deploy.yml`)
Automatically triggers Render to deploy whenever the `CI` workflow completes successfully on `main` or `master`.

#### Enabling the Deploy Hook:
1. In your Render Dashboard, open your `storyforge-ai` service.
2. Go to **Settings** and scroll to **Deploy Hook**.
3. Copy the webhook URL (e.g., `https://api.render.com/deploy/srv-xxxxxx?key=yyyyyy`).
4. In your GitHub repository:
   - Go to **Settings** -> **Secrets and variables** -> **Actions**.
   - Click **New repository secret**.
   - Name: `RENDER_DEPLOY_HOOK_URL`
   - Value: Paste the copied Render deploy hook URL.
   - Click **Add secret**.

Once configured, any push that passes CI will immediately trigger a deployment to Render!

---

## 🐳 Local Docker Testing

To test the multi-stage Docker build locally before deploying:

```bash
# 1. Build the production Docker container
docker build -t storyforge-ai .

# 2. Run the container
docker run -p 8000:8000 -e GEMINI_API_KEY="your_api_key_here" -e ENV=production storyforge-ai

# 3. Verify health endpoint
curl http://localhost:8000/api/health
```

Access the complete application in your browser at `http://localhost:8000`.

---

## 🔍 Verification & Health Checks

After deployment, verify that your service is healthy:

- **Health Check Endpoint**:
  ```bash
  curl https://<your-render-subdomain>.onrender.com/api/health
  ```
  Expected Response:
  ```json
  {
    "status": "online",
    "service": "StoryForge AI",
    "gemini_api_configured": true,
    "demo_mode_available": true,
    "version": "1.0.0"
  }
  ```

- **Interactive API Docs**: `https://<your-render-subdomain>.onrender.com/docs`
- **Application Web UI**: `https://<your-render-subdomain>.onrender.com/`

> **Note on Render Free Tier:**
> On the free tier, services spin down after 15 minutes of inactivity. The initial request might take 30–50 seconds to wake up the service.
