// LiveKit Configuration
export const LIVEKIT_CONFIG = {
  url: 'wss://jonathan-s23kluo9.livekit.cloud',
  apiKey: 'APIkPombJcC7uX2',
  apiSecret: 'rKVu2gSmeFxD8MAnKiMyvLNTZAreDQXCJ9qhant45q5',
} as const;

// Environment variables for client-side
export const LIVEKIT_CLIENT_CONFIG = {
  url: process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://jonathan-s23kluo9.livekit.cloud',
  apiKey: process.env.NEXT_PUBLIC_LIVEKIT_API_KEY || 'APIkPombJcC7uX2',
} as const;
