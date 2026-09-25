# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Cache dependencies
COPY package*.json ./
RUN npm ci

# Copy frontend source and build static bundle
COPY . .
RUN npm run build

# Stage 2: Python backend serving both API and static frontend
FROM python:3.11-slim
WORKDIR /app

# Prevent Python from writing .pyc and buffer output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HOST=0.0.0.0 \
    PORT=8000 \
    ENV=production

# Install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Create a non-root system user and group for security
RUN groupadd -r appuser && useradd -r -g appuser -d /app -s /sbin/nologin -c "StoryForge Application User" appuser

# Copy backend source code and helper scripts with proper ownership
COPY --chown=appuser:appuser backend/ ./backend/
COPY --chown=appuser:appuser generate_story.py ./

# Copy built frontend assets from Stage 1
COPY --chown=appuser:appuser --from=frontend-builder /app/dist ./dist

# Set permissions for /app
RUN chown -R appuser:appuser /app

# Run as non-root user
USER appuser

EXPOSE 8000

CMD ["python", "backend/main.py"]
