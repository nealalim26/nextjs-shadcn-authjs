#!/bin/bash

# Next.js Auth.js Environment Setup Script
echo "🚀 Setting up environment variables for Next.js Auth.js..."

# Check if .env.local already exists
if [ -f ".env" ]; then
    echo "⚠️  .env already exists. Backing up to .env.backup"
    cp .env .env.backup
fi

# Generate a random secret key
SECRET_KEY=$(openssl rand -base64 32)

# Create .env.local file
cat > .env << EOF
AUTH_URL="http://localhost:3000"
AUTH_SECRET="${SECRET_KEY}"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
NEXT_PUBLIC_PROJECT_NAME=neal
EOF

echo "✅ Environment file created: .env"
echo ""
echo "🔧 Running post-setup commands..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi

# Install with legacy peer deps (for compatibility)
echo "📦 Installing with legacy peer deps..."
npm install --legacy-peer-deps
if [ $? -ne 0 ]; then
    echo "❌ npm install --legacy-peer-deps failed"
    exit 1
fi

# Run linting
echo "🔍 Running linter..."
npm run lint
if [ $? -ne 0 ]; then
    echo "⚠️  Linting issues found, but continuing..."
fi

# Run formatting
echo "✨ Running formatter..."
npm run format
if [ $? -ne 0 ]; then
    echo "❌ npm run format failed"
    exit 1
fi

# Run build
echo "🏗️  Running build..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ npm run build failed"
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Update the OAuth provider credentials in .env"
echo "2. For GitHub: Go to https://github.com/settings/developers"
echo "3. For Google: Go to https://console.cloud.google.com/"
echo "4. Set callback URLs to: http://localhost:3000/api/auth/callback/{provider} (replace {provider} with the actual provider)"
echo ""
echo "🔐 Demo credentials will work with:"
echo "   Email: nealalim26@lebryne.com"
echo "   Password: admin"
echo ""
echo "🚀 Run 'npm run dev' to start the development server"
