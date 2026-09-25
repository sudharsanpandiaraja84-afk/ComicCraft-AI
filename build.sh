#!/usr/bin/env bash
set -o errexit

echo "==> Starting StoryForge AI Render build process..."

# 1. Ensure Node.js is available via NVM if npm is not present
if ! command -v npm &> /dev/null; then
    if [ -s "$HOME/.nvm/nvm.sh" ]; then
        echo "==> Loading NVM..."
        export NVM_DIR="$HOME/.nvm"
        # shellcheck disable=SC1090
        \. "$NVM_DIR/nvm.sh"
        nvm install 20
        nvm use 20
    fi
fi

# 2. Build React frontend assets
if command -v npm &> /dev/null; then
    echo "==> Installing Node.js packages and building React frontend..."
    npm ci
    npm run build
else
    echo "==> Warning: npm not found in path, using pre-existing dist folder if available."
fi

# 3. Install Python dependencies
echo "==> Upgrading pip and installing Python dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt

echo "==> Build process completed successfully!"
