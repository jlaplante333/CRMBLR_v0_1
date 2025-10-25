'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Room, RoomEvent, RemoteParticipant, LocalParticipant, Track } from 'livekit-client';
import { LIVEKIT_CLIENT_CONFIG } from '@/lib/livekit-config';

interface VoiceAssistantProps {
  tenantId: string;
  userId: string;
  onTranscript?: (text: string) => void;
  onCommand?: (command: string) => void;
}

export function VoiceAssistant({ tenantId, userId, onTranscript, onCommand }: VoiceAssistantProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [error, setError] = useState<string>('');
  const [avatarState, setAvatarState] = useState<'idle' | 'listening' | 'speaking' | 'thinking'>('idle');
  
  const roomRef = useRef<Room | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Generate LiveKit token
  const generateToken = async (): Promise<string> => {
    try {
      const response = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName: `voice-crm-${tenantId}`,
          participantName: userId,
          participantIdentity: userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate token');
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('Error generating token:', error);
      throw error;
    }
  };

  // Connect to LiveKit room
  const connectToRoom = async () => {
    try {
      setConnectionStatus('connecting');
      setError('');
      setAvatarState('thinking');

      const token = await generateToken();
      
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          videoSimulcastLayers: [],
        },
      });

      roomRef.current = room;

      // Set up event listeners
      room.on(RoomEvent.Connected, async () => {
        console.log('Connected to LiveKit room');
        setIsConnected(true);
        setConnectionStatus('connected');
        
        // Enable microphone
        await room.localParticipant.enableCameraAndMicrophone(false, true);
        setIsListening(true);
        setAvatarState('listening');
        
        // Auto-greet user
        speak("Hello! I'm your voice assistant. How can I help you today?");
      });

      room.on(RoomEvent.Disconnected, () => {
        console.log('Disconnected from LiveKit room');
        setIsConnected(false);
        setIsListening(false);
        setConnectionStatus('disconnected');
        setAvatarState('idle');
      });

      room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant?: RemoteParticipant) => {
        try {
          const data = JSON.parse(new TextDecoder().decode(payload));
          
          if (data.type === 'transcript') {
            const transcriptText = data.text;
            setTranscript(transcriptText);
            if (onTranscript) onTranscript(transcriptText);
            
            // Process the command
            processVoiceCommand(transcriptText);
          }
        } catch (error) {
          console.error('Error processing data:', error);
        }
      });

      // Connect to room
      await room.connect(LIVEKIT_CLIENT_CONFIG.url, token);
      
    } catch (error) {
      console.error('Error connecting to LiveKit:', error);
      setError(error instanceof Error ? error.message : 'Connection failed');
      setConnectionStatus('disconnected');
      setAvatarState('idle');
    }
  };

  // Disconnect from room
  const disconnectFromRoom = async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    setIsConnected(false);
    setIsListening(false);
    setConnectionStatus('disconnected');
    setTranscript('');
    setAvatarState('idle');
  };

  // Text-to-Speech function
  const speak = (text: string, onEnd?: () => void) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        setAvatarState('speaking');
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setAvatarState(isListening ? 'listening' : 'idle');
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setAvatarState(isListening ? 'listening' : 'idle');
      };
      
      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setAvatarState(isListening ? 'listening' : 'idle');
    }
  };

  // Process voice commands
  const processVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    // Generate response
    let response = "I understand you want to ";
    
    if (lowerCommand.includes('jonathan') || lowerCommand.includes('find jonathan')) {
      response = "Yes! Let me find Jonathan for you right now.";
      if (onCommand) onCommand('find jonathan');
    } else if (lowerCommand.includes('contact')) {
      response = "I'll help you with contacts. Let me open the contacts page.";
      if (onCommand) onCommand('show contacts');
    } else if (lowerCommand.includes('donation')) {
      response = "I'll show you the donations. Let me open that for you.";
      if (onCommand) onCommand('show donations');
    } else if (lowerCommand.includes('calendar') || lowerCommand.includes('meeting')) {
      response = "I'll open the calendar for you.";
      if (onCommand) onCommand('show calendar');
    } else if (lowerCommand.includes('report')) {
      response = "I'll generate a report for you.";
      if (onCommand) onCommand('generate report');
    } else {
      response = "I heard you say: " + command + ". Let me help you with that.";
    }
    
    // Speak the response
    speak(response);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Cute Avatar Component
  const CuteAvatar = () => {
    return (
      <div className="relative w-24 h-24 mx-auto mb-4">
        {/* Avatar Container */}
        <div className={`relative w-24 h-24 rounded-full transition-all duration-500 ${
          avatarState === 'listening' ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-200' :
          avatarState === 'speaking' ? 'bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg shadow-blue-200' :
          avatarState === 'thinking' ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-200' :
          'bg-gradient-to-br from-gray-300 to-gray-400'
        }`}>
          
          {/* Eyes */}
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
              avatarState === 'listening' ? 'bg-white animate-pulse' :
              avatarState === 'speaking' ? 'bg-white animate-bounce' :
              avatarState === 'thinking' ? 'bg-white animate-spin' :
              'bg-gray-600'
            }`}></div>
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
              avatarState === 'listening' ? 'bg-white animate-pulse' :
              avatarState === 'speaking' ? 'bg-white animate-bounce' :
              avatarState === 'thinking' ? 'bg-white animate-spin' :
              'bg-gray-600'
            }`}></div>
          </div>

          {/* Mouth */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            {avatarState === 'listening' ? (
              <div className="w-6 h-3 border-2 border-white rounded-full animate-pulse"></div>
            ) : avatarState === 'speaking' ? (
              <div className="w-6 h-3 bg-white rounded-full animate-pulse"></div>
            ) : avatarState === 'thinking' ? (
              <div className="w-4 h-1 bg-white rounded-full animate-pulse"></div>
            ) : (
              <div className="w-4 h-1 bg-gray-600 rounded-full"></div>
            )}
          </div>

          {/* Microphone Icon */}
          {avatarState === 'listening' && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-white text-xs">🎤</span>
              </div>
            </div>
          )}

          {/* Sound Waves for Speaking */}
          {avatarState === 'speaking' && (
            <>
              <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-8 bg-blue-300 rounded-full animate-pulse"></div>
              </div>
              <div className="absolute -right-4 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-6 bg-blue-200 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <div className="absolute -right-6 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-4 bg-blue-100 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </>
          )}

          {/* Thinking Animation */}
          {avatarState === 'thinking' && (
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-yellow-300 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-yellow-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-yellow-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Status Ring */}
        <div className={`absolute inset-0 rounded-full border-4 transition-all duration-500 ${
          avatarState === 'listening' ? 'border-green-300 animate-ping' :
          avatarState === 'speaking' ? 'border-blue-300 animate-ping' :
          avatarState === 'thinking' ? 'border-yellow-300 animate-ping' :
          'border-gray-200'
        }`}></div>
      </div>
    );
  };

  return (
    <div className="voice-assistant-container bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl p-6 shadow-xl border border-purple-200 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1">🎤 Voice Assistant</h3>
        <p className="text-sm text-gray-600">Tokyo Voice AI Hackathon</p>
      </div>

      {/* Cute Avatar */}
      <CuteAvatar />

      {/* Status Display */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
          avatarState === 'listening' ? 'bg-green-100 text-green-800' :
          avatarState === 'speaking' ? 'bg-blue-100 text-blue-800' :
          avatarState === 'thinking' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {avatarState === 'listening' && (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              Listening... Speak now!
            </>
          )}
          {avatarState === 'speaking' && (
            <>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
              AI is speaking... Please wait
            </>
          )}
          {avatarState === 'thinking' && (
            <>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse mr-2"></div>
              Connecting...
            </>
          )}
          {avatarState === 'idle' && (
            <>
              <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
              Ready to connect
            </>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Controls */}
      <div className="space-y-3 mb-6">
        {!isConnected ? (
          <button
            onClick={connectToRoom}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🎤 Connect Voice Assistant
          </button>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={disconnectFromRoom}
              className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Disconnect
            </button>
            
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                Stop Speaking
              </button>
            )}
          </div>
        )}
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">You said:</h4>
          <p className="text-gray-900 italic">"{transcript}"</p>
        </div>
      )}

      {/* Quick Commands */}
      {isConnected && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => {
              const command = "Find Jonathan";
              setTranscript(command);
              processVoiceCommand(command);
            }}
            className="p-3 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
          >
            👤 Find Jonathan
          </button>
          <button
            onClick={() => {
              const command = "Show contacts";
              setTranscript(command);
              processVoiceCommand(command);
            }}
            className="p-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
          >
            📋 All Contacts
          </button>
          <button
            onClick={() => {
              const command = "Show donations";
              setTranscript(command);
              processVoiceCommand(command);
            }}
            className="p-3 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
          >
            💰 Donations
          </button>
          <button
            onClick={() => {
              const command = "Show calendar";
              setTranscript(command);
              processVoiceCommand(command);
            }}
            className="p-3 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
          >
            📅 Calendar
          </button>
        </div>
      )}

      {/* Instructions */}
      {!isConnected && (
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">How to use:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Click "Connect Voice Assistant" to start</li>
            <li>• Say "Find Jonathan" to search for contacts</li>
            <li>• Say "Show contacts" to view all contacts</li>
            <li>• Say "Show donations" to view donations</li>
            <li>• Watch the avatar - it shows who's talking!</li>
          </ul>
        </div>
      )}
    </div>
  );
}