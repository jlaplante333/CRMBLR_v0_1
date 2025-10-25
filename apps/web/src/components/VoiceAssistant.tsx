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
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
        setAvatarState('listening');
      };
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          console.log('Final transcript:', finalTranscript);
          setTranscript(finalTranscript);
          if (onTranscript) onTranscript(finalTranscript);
          processVoiceCommand(finalTranscript);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setAvatarState('idle');
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
        setAvatarState('idle');
      };
      
      recognitionRef.current = recognition;
    }
  }, [onTranscript]);

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
        
        // Auto-greet user with cute voice
        speak("Meow! Hello there! I'm your cute cat assistant! How can I help you today?");
      });

      room.on(RoomEvent.Disconnected, () => {
        console.log('Disconnected from LiveKit room');
        setIsConnected(false);
        setIsListening(false);
        setConnectionStatus('disconnected');
        setAvatarState('idle');
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
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsConnected(false);
    setIsListening(false);
    setConnectionStatus('disconnected');
    setTranscript('');
    setAvatarState('idle');
  };

  // Start listening
  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setAvatarState('listening');
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setAvatarState('idle');
    }
  };

  // Text-to-Speech function with cute voice
  const speak = (text: string, onEnd?: () => void) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8; // Slower, cuter pace
      utterance.pitch = 1.2; // Higher pitch for cuteness
      utterance.volume = 0.9;
      
      // Try to use a cute voice
      const voices = window.speechSynthesis.getVoices();
      const cuteVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Microsoft') ||
        voice.name.includes('Samantha') ||
        voice.name.includes('Karen')
      );
      
      if (cuteVoice) {
        utterance.voice = cuteVoice;
      }
      
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

  // Process voice commands with cute responses
  const processVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    // Generate cute response
    let response = "Meow! I heard you say ";
    
    if (lowerCommand.includes('jonathan') || lowerCommand.includes('find jonathan')) {
      response = "Purr-fect! Let me find Jonathan for you right meow! 🐱";
      if (onCommand) onCommand('find jonathan');
    } else if (lowerCommand.includes('contact')) {
      response = "Meow! I'll help you with contacts. Opening the contacts page for you! 🐾";
      if (onCommand) onCommand('show contacts');
    } else if (lowerCommand.includes('donation')) {
      response = "Purr! I'll show you the donations. Let me open that for you! 💰";
      if (onCommand) onCommand('show donations');
    } else if (lowerCommand.includes('calendar') || lowerCommand.includes('meeting')) {
      response = "Meow! I'll open the calendar for you right away! 📅";
      if (onCommand) onCommand('show calendar');
    } else if (lowerCommand.includes('report')) {
      response = "Purr-fect! I'll generate a report for you! 📊";
      if (onCommand) onCommand('generate report');
    } else if (lowerCommand.includes('hello') || lowerCommand.includes('hi')) {
      response = "Meow! Hello there! How can this cute cat help you today? 🐱";
    } else if (lowerCommand.includes('thank')) {
      response = "Purr! You're so welcome! I'm happy to help! 🐾";
    } else {
      response = "Meow! I heard you say: " + command + ". Let me help you with that! 🐱";
    }
    
    // Speak the cute response
    speak(response);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Cute Cat Avatar Component
  const CuteCatAvatar = () => {
    return (
      <div className="relative w-32 h-32 mx-auto mb-6">
        {/* Cat Head */}
        <div className={`relative w-32 h-32 rounded-full transition-all duration-500 ${
          avatarState === 'listening' ? 'bg-gradient-to-br from-orange-300 to-orange-500 shadow-lg shadow-orange-200' :
          avatarState === 'speaking' ? 'bg-gradient-to-br from-blue-300 to-purple-500 shadow-lg shadow-blue-200' :
          avatarState === 'thinking' ? 'bg-gradient-to-br from-yellow-300 to-orange-500 shadow-lg shadow-yellow-200' :
          'bg-gradient-to-br from-orange-200 to-orange-400'
        }`}>
          
          {/* Cat Ears */}
          <div className="absolute -top-2 left-4 w-6 h-8 bg-orange-400 rounded-t-full transform rotate-12"></div>
          <div className="absolute -top-2 right-4 w-6 h-8 bg-orange-400 rounded-t-full transform -rotate-12"></div>
          
          {/* Inner Ears */}
          <div className="absolute -top-1 left-5 w-3 h-4 bg-pink-300 rounded-t-full transform rotate-12"></div>
          <div className="absolute -top-1 right-5 w-3 h-4 bg-pink-300 rounded-t-full transform -rotate-12"></div>

          {/* Cat Eyes */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
            <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
              avatarState === 'listening' ? 'bg-green-600 animate-pulse' :
              avatarState === 'speaking' ? 'bg-blue-600 animate-bounce' :
              avatarState === 'thinking' ? 'bg-yellow-600 animate-spin' :
              'bg-green-700'
            }`}>
              <div className="w-2 h-2 bg-white rounded-full absolute top-1 left-1"></div>
            </div>
            <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
              avatarState === 'listening' ? 'bg-green-600 animate-pulse' :
              avatarState === 'speaking' ? 'bg-blue-600 animate-bounce' :
              avatarState === 'thinking' ? 'bg-yellow-600 animate-spin' :
              'bg-green-700'
            }`}>
              <div className="w-2 h-2 bg-white rounded-full absolute top-1 left-1"></div>
            </div>
          </div>

          {/* Cat Nose */}
          <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-pink-400 rounded-full"></div>

          {/* Cat Mouth */}
          <div className="absolute top-14 left-1/2 transform -translate-x-1/2">
            {avatarState === 'listening' ? (
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-black rounded-full"></div>
                <div className="w-1 h-1 bg-black rounded-full"></div>
              </div>
            ) : avatarState === 'speaking' ? (
              <div className="w-6 h-3 bg-pink-300 rounded-full animate-pulse"></div>
            ) : avatarState === 'thinking' ? (
              <div className="w-4 h-1 bg-pink-400 rounded-full animate-pulse"></div>
            ) : (
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-black rounded-full"></div>
                <div className="w-1 h-1 bg-black rounded-full"></div>
              </div>
            )}
          </div>

          {/* Cat Whiskers */}
          <div className="absolute top-10 left-2 w-8 h-0.5 bg-gray-600 rounded-full"></div>
          <div className="absolute top-10 right-2 w-8 h-0.5 bg-gray-600 rounded-full"></div>
          <div className="absolute top-12 left-1 w-6 h-0.5 bg-gray-600 rounded-full"></div>
          <div className="absolute top-12 right-1 w-6 h-0.5 bg-gray-600 rounded-full"></div>

          {/* Microphone Icon for Listening */}
          {avatarState === 'listening' && (
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                <span className="text-white text-sm">🎤</span>
              </div>
            </div>
          )}

          {/* Sound Waves for Speaking */}
          {avatarState === 'speaking' && (
            <>
              <div className="absolute -right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-10 bg-blue-300 rounded-full animate-pulse"></div>
              </div>
              <div className="absolute -right-5 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-8 bg-blue-200 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <div className="absolute -right-7 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-6 bg-blue-100 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </>
          )}

          {/* Thinking Animation */}
          {avatarState === 'thinking' && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Status Ring */}
        <div className={`absolute inset-0 rounded-full border-4 transition-all duration-500 ${
          avatarState === 'listening' ? 'border-green-300 animate-ping' :
          avatarState === 'speaking' ? 'border-blue-300 animate-ping' :
          avatarState === 'thinking' ? 'border-yellow-300 animate-ping' :
          'border-orange-200'
        }`}></div>
      </div>
    );
  };

  return (
    <div className="voice-assistant-container bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 rounded-2xl p-6 shadow-xl border border-orange-200 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1">🐱 Cute Cat Assistant</h3>
        <p className="text-sm text-gray-600">Tokyo Voice AI Hackathon</p>
      </div>

      {/* Cute Cat Avatar */}
      <CuteCatAvatar />

      {/* Status Display */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
          avatarState === 'listening' ? 'bg-green-100 text-green-800' :
          avatarState === 'speaking' ? 'bg-blue-100 text-blue-800' :
          avatarState === 'thinking' ? 'bg-yellow-100 text-yellow-800' :
          'bg-orange-100 text-orange-800'
        }`}>
          {avatarState === 'listening' && (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              Listening... Speak now! 🎤
            </>
          )}
          {avatarState === 'speaking' && (
            <>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
              Cat is speaking... Please wait 🐱
            </>
          )}
          {avatarState === 'thinking' && (
            <>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse mr-2"></div>
              Connecting... 🐾
            </>
          )}
          {avatarState === 'idle' && (
            <>
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
              Ready to connect 🐱
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
            className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🐱 Connect Cute Cat Assistant
          </button>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={disconnectFromRoom}
              className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Disconnect
            </button>
            
            {!isListening && (
              <button
                onClick={startListening}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                🎤 Listen
              </button>
            )}
            
            {isListening && (
              <button
                onClick={stopListening}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Stop Listening
              </button>
            )}
            
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
        <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
          <h4 className="text-sm font-semibold text-orange-900 mb-2">How to use:</h4>
          <ul className="text-sm text-orange-800 space-y-1">
            <li>• Click "Connect Cute Cat Assistant" to start</li>
            <li>• Click "Listen" to start voice recognition</li>
            <li>• Say "Find Jonathan" to search for contacts</li>
            <li>• Say "Show contacts" to view all contacts</li>
            <li>• Watch the cute cat - it shows who's talking!</li>
          </ul>
        </div>
      )}
    </div>
  );
}