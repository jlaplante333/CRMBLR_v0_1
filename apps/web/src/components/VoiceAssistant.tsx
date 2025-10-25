'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Room, RoomEvent, RemoteParticipant, LocalParticipant } from 'livekit-client';
import { LiveKitRoom, VideoConference, GridLayout, ParticipantTile, ControlBar, useTracks } from '@livekit/components-react';
import '@livekit/components-styles';

interface VoiceAssistantProps {
  tenantId: string;
  userId: string;
  onTranscript?: (text: string) => void;
  onCommand?: (command: string) => void;
}

export function VoiceAssistant({ tenantId, userId, onTranscript, onCommand }: VoiceAssistantProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [transcript, setTranscript] = useState<string>('');
  const [room, setRoom] = useState<Room | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Text-to-Speech function
  const speak = (text: string, onEnd?: () => void) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };
      utterance.onerror = () => setIsSpeaking(false);
      
      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Generate conversational response
  const getConversationalResponse = (command: string): string => {
    const responses = [
      "Yes, let's look at that!",
      "Absolutely! I'll help you with that.",
      "Great idea! Let me take you there.",
      "Perfect! Opening that for you now.",
      "Excellent! I'll navigate to that page.",
      "Sure thing! Let's check that out.",
      "Of course! I'll show you that right away.",
      "Wonderful! Let me help you with that."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Auto-greet when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasGreeted) {
        speak("Hello! How are you? What would you like to do today?");
        setHasGreeted(true);
      }
    }, 2000); // Wait 2 seconds after component mounts

    return () => clearTimeout(timer);
  }, [hasGreeted]);

  const connectToRoom = async () => {
    try {
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          videoSimulcastLayers: [
            { resolution: VideoQuality.HIGH, encoding: { maxBitrate: 2000000 } },
            { resolution: VideoQuality.MEDIUM, encoding: { maxBitrate: 1000000 } },
            { resolution: VideoQuality.LOW, encoding: { maxBitrate: 500000 } },
          ],
        },
      });

      // Set up event listeners
      newRoom.on(RoomEvent.Connected, () => {
        console.log('Connected to LiveKit room');
        setIsConnected(true);
      });

      newRoom.on(RoomEvent.Disconnected, () => {
        console.log('Disconnected from LiveKit room');
        setIsConnected(false);
      });

      newRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        console.log('Track subscribed:', track.kind);
      });

      // Connect to room
      const token = await getLiveKitToken(tenantId, userId);
      await newRoom.connect('wss://jonathan-s23kluo9.livekit.cloud', token);
      
      setRoom(newRoom);
    } catch (error) {
      console.error('Failed to connect to LiveKit room:', error);
    }
  };

  const disconnectFromRoom = async () => {
    if (room) {
      await room.disconnect();
      setRoom(null);
      setIsConnected(false);
    }
  };

  const toggleMute = async () => {
    if (room) {
      if (isMuted) {
        await room.localParticipant.enableCameraAndMicrophone();
        setIsMuted(false);
      } else {
        await room.localParticipant.setMicrophoneEnabled(false);
        setIsMuted(true);
      }
    }
  };

  const sendVoiceCommand = async (command: string) => {
    if (room && room.localParticipant) {
      // Send command as data message
      await room.localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify({
          type: 'voice_command',
          command,
          timestamp: Date.now(),
          userId,
          tenantId
        }))
      );
    }
    
    // Provide conversational response
    const response = getConversationalResponse(command);
    speak(response, () => {
      // After speaking, trigger the command processing
      if (onCommand) {
        onCommand(command);
      }
    });
  };

  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

  return (
    <div className="voice-assistant-container">
      <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-md">
        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm font-medium">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          {isSpeaking && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-600">Speaking...</span>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex space-x-2">
          {!isConnected ? (
            <button
              onClick={connectToRoom}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Connect Voice
            </button>
          ) : (
            <>
              <button
                onClick={toggleMute}
                className={`px-4 py-2 rounded-md transition-colors ${
                  isMuted 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
              <button
                onClick={disconnectFromRoom}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Disconnect
              </button>
            </>
          )}
          
          {/* Stop Speaking Button */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              Stop Speaking
            </button>
          )}
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="flex-1 p-3 bg-gray-100 rounded-md">
            <p className="text-sm text-gray-700">{transcript}</p>
          </div>
        )}
      </div>

      {/* Voice Commands Help */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Voice Commands</h3>
        <div className="text-xs text-blue-800 space-y-1">
          <p>• "Create new contact" - Add a new contact</p>
          <p>• "Show donations" - View donation records</p>
          <p>• "Schedule meeting" - Open calendar</p>
          <p>• "Generate report" - Create analytics report</p>
          <p>• "Search contacts" - Find contacts</p>
        </div>
      </div>
    </div>
  );
}

// Helper function to get LiveKit token
async function getLiveKitToken(tenantId: string, userId: string): Promise<string> {
  try {
    const response = await fetch('/api/livekit/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tenantId,
        userId,
        roomName: `crm-${tenantId}`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get LiveKit token');
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error getting LiveKit token:', error);
    throw error;
  }
}
