import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import { LIVEKIT_CONFIG } from '@/lib/livekit-config';

export async function POST(request: NextRequest) {
  try {
    const { roomName, participantName, participantIdentity } = await request.json();

    if (!roomName || !participantName || !participantIdentity) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Create access token
    const token = new AccessToken(LIVEKIT_CONFIG.apiKey, LIVEKIT_CONFIG.apiSecret, {
      identity: participantIdentity,
      name: participantName,
      ttl: '1h',
    });

    // Grant permissions
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    // Add metadata
    token.metadata = JSON.stringify({
      participantName,
      participantIdentity,
      role: 'participant',
    });

    const jwt = await token.toJwt();

    return NextResponse.json({ token: jwt });
  } catch (error) {
    console.error('Error generating LiveKit token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
