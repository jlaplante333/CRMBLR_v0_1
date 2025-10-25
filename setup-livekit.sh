#!/bin/bash

# LiveKit Environment Setup Script
# Run this script to set up LiveKit environment variables

echo "🎤 Setting up LiveKit environment variables..."

# Create .env.local file in the web app directory
cat > apps/web/.env.local << EOF
# LiveKit Configuration
LIVEKIT_URL=wss://jonathan-s23kluo9.livekit.cloud
LIVEKIT_API_KEY=APIkPombJcC7uX2
LIVEKIT_API_SECRET=rKVu2gSmeFxD8MAnKiMyvLNTZAreDQXCJ9qhant45q5

# Next.js Public Environment Variables (for client-side)
NEXT_PUBLIC_LIVEKIT_URL=wss://jonathan-s23kluo9.livekit.cloud
NEXT_PUBLIC_LIVEKIT_API_KEY=APIkPombJcC7uX2
EOF

echo "✅ LiveKit environment variables set up successfully!"
echo "📁 Created: apps/web/.env.local"
echo ""
echo "🚀 You can now restart your development server to use LiveKit:"
echo "   cd apps/web && npm run dev"
echo ""
echo "🎤 The voice assistant will now connect to your LiveKit cloud instance!"
