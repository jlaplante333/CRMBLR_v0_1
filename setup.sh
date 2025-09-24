#!/bin/bash

# CRMblr Setup Script
# This script sets up the CRMblr development environment

set -e  # Exit on any error

echo "🚀 Setting up CRMblr development environment..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first:"
    echo "   npm install -g pnpm"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "📦 Installing dependencies..."
pnpm install

echo "🐳 Starting Docker services..."
docker-compose up -d

echo "⏳ Waiting for database to be ready..."
sleep 10

echo "🗄️ Running database migrations..."
pnpm db:migrate

echo "🌱 Seeding database with demo data..."
pnpm seed:demo

echo "✅ Setup complete!"
echo ""
echo "🎉 CRMblr is ready to use!"
echo ""
echo "📋 Demo Login Credentials:"
echo ""
echo "🏢 MAKE Literary Productions (makelit):"
echo "   Owner: owner@makelit.org / Demo!Make"
echo "   Admin: admin@makelit.org / Demo!Make"
echo "   Editor: editor@makelit.org / Demo!Make"
echo "   Viewer: viewer@makelit.org / Demo!Make"
echo ""
echo "🏢 1in6 (oneinsix):"
echo "   Owner: owner@oneinsix.org / Demo!One6"
echo "   Admin: admin@oneinsix.org / Demo!One6"
echo "   Editor: editor@oneinsix.org / Demo!One6"
echo "   Viewer: viewer@oneinsix.org / Demo!One6"
echo ""
echo "🏢 Fallen Fruit (fallenfruit):"
echo "   Owner: owner@fallenfruit.org / Demo!Fruit"
echo "   Admin: admin@fallenfruit.org / Demo!Fruit"
echo "   Editor: editor@fallenfruit.org / Demo!Fruit"
echo "   Viewer: viewer@fallenfruit.org / Demo!Fruit"
echo ""
echo "🏢 Homeboy Industries (homeboy):"
echo "   Owner: owner@homeboy.org / Demo!Homeboy"
echo "   Admin: admin@homeboy.org / Demo!Homeboy"
echo "   Editor: editor@homeboy.org / Demo!Homeboy"
echo "   Viewer: viewer@homeboy.org / Demo!Homeboy"
echo ""
echo "🌐 Start the development server:"
echo "   pnpm dev"
echo ""
echo "🔗 Access the application at:"
echo "   http://localhost:3000"
echo ""
echo "🗄️ Database Studio:"
echo "   pnpm db:studio"
echo ""
echo "🧹 To clear demo data:"
echo "   pnpm seed:clear"
echo ""
echo "Happy coding! 🎉"