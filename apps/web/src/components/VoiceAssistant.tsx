'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Room, RoomEvent, RemoteParticipant, LocalParticipant, Track, TrackPublication, AudioTrack } from 'livekit-client';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const roomRef = useRef<Room | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Generate LiveKit token
  const generateToken = async (): Promise<string> => {
    try {
      console.log('🔑 Generating LiveKit token...');
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
        throw new Error(`Failed to generate token: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ LiveKit token generated successfully');
      return data.token;
    } catch (error) {
      console.error('❌ Error generating LiveKit token:', error);
      throw error;
    }
  };

  // Connect to LiveKit room
  const connectToRoom = async () => {
    try {
      console.log('🚀 Connecting to LiveKit room...');
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
        console.log('✅ Connected to LiveKit room!');
        setIsConnected(true);
        setConnectionStatus('connected');
        
        // Enable microphone and start listening
        await room.localParticipant.enableCameraAndMicrophone(false, true);
        console.log('🎤 Microphone enabled - LISTENING TO YOUR VOICE!');
        
        setIsListening(true);
        setAvatarState('listening');
        
        // Set up audio level monitoring
        setupAudioLevelMonitoring();
        
        // Auto-greet user
        speak("Meow! Hello! I'm connected to LiveKit and listening to your voice! Say something!");
      });

      room.on(RoomEvent.Disconnected, () => {
        console.log('❌ Disconnected from LiveKit room');
        setIsConnected(false);
        setIsListening(false);
        setConnectionStatus('disconnected');
        setAvatarState('idle');
        cleanupAudioMonitoring();
      });

      room.on(RoomEvent.TrackSubscribed, (track: Track, publication: TrackPublication, participant: RemoteParticipant) => {
        console.log('🎵 Track subscribed:', track.kind);
        if (track.kind === Track.Kind.Audio) {
          const audioTrack = track as AudioTrack;
          const audioElement = audioTrack.attach();
          audioElement.play();
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, (track: Track, publication: TrackPublication, participant: RemoteParticipant) => {
        console.log('🔇 Track unsubscribed:', track.kind);
        track.detach();
      });

      room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant?: RemoteParticipant) => {
        try {
          const data = JSON.parse(new TextDecoder().decode(payload));
          console.log('📨 Data received from LiveKit:', data);
          
          if (data.type === 'transcript') {
            const transcriptText = data.text;
            console.log('🎯 LiveKit transcript:', transcriptText);
            setTranscript(transcriptText);
            if (onTranscript) onTranscript(transcriptText);
            
            // Process the command
            processVoiceCommand(transcriptText);
          } else if (data.type === 'response') {
            console.log('🤖 LiveKit response:', data.text);
            speak(data.text);
          }
        } catch (error) {
          console.error('❌ Error processing LiveKit data:', error);
        }
      });

      // Connect to room
      console.log('🔌 Connecting to LiveKit URL:', LIVEKIT_CLIENT_CONFIG.url);
      await room.connect(LIVEKIT_CLIENT_CONFIG.url, token);
      
    } catch (error) {
      console.error('❌ Error connecting to LiveKit:', error);
      setError(error instanceof Error ? error.message : 'Connection failed');
      setConnectionStatus('disconnected');
      setAvatarState('idle');
    }
  };

  // Set up audio level monitoring for visual feedback
  const setupAudioLevelMonitoring = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      const audioContext = audioContextRef.current;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      // Get microphone stream
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const source = audioContext.createMediaStreamSource(stream);
          source.connect(analyser);
          
          // Monitor audio levels
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          
          const updateAudioLevel = () => {
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
            setAudioLevel(average);
            
            if (isListening) {
              animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
            }
          };
          
          updateAudioLevel();
        })
        .catch(error => {
          console.error('❌ Error accessing microphone:', error);
        });
    } catch (error) {
      console.error('❌ Error setting up audio monitoring:', error);
    }
  };

  // Cleanup audio monitoring
  const cleanupAudioMonitoring = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  };

  // Disconnect from room
  const disconnectFromRoom = async () => {
    console.log('🔌 Disconnecting from LiveKit...');
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    cleanupAudioMonitoring();
    setIsConnected(false);
    setIsListening(false);
    setIsProcessing(false);
    setConnectionStatus('disconnected');
    setTranscript('');
    setAvatarState('idle');
  };

  // Send data to LiveKit room
  const sendToLiveKit = (data: any) => {
    if (roomRef.current && roomRef.current.localParticipant) {
      const payload = new TextEncoder().encode(JSON.stringify(data));
      roomRef.current.localParticipant.publishData(payload, { reliable: true });
      console.log('📤 Sent to LiveKit:', data);
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
        setIsProcessing(false);
        console.log('🗣️ Speaking:', text);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setAvatarState(isListening ? 'listening' : 'idle');
        if (onEnd) onEnd();
        console.log('✅ Finished speaking');
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setAvatarState(isListening ? 'listening' : 'idle');
        setIsProcessing(false);
        console.error('❌ Speech synthesis error');
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

  // Process voice commands with immediate navigation
  const processVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    console.log('🎯 Processing LiveKit command:', lowerCommand);
    
    setIsProcessing(true);
    setAvatarState('thinking');
    
    // Generate cute response and navigate
    let response = "Meow! I heard you say ";
    let navigationUrl = '';
    
    if (lowerCommand.includes('jonathan') || lowerCommand.includes('find jonathan')) {
      response = "Purr-fect! Let me find Jonathan for you right meow! 🐱";
      navigationUrl = `/t/${tenantId}/contacts?search=Jonathan`;
      if (onCommand) onCommand('find jonathan');
    } else if (lowerCommand.includes('show') && lowerCommand.includes('contact')) {
      response = "Meow! I'll help you with contacts. Opening the contacts page for you! 🐾";
      navigationUrl = `/t/${tenantId}/contacts`;
      if (onCommand) onCommand('show contacts');
    } else if (lowerCommand.includes('donation')) {
      response = "Purr! I'll show you the donations. Let me open that for you! 💰";
      navigationUrl = `/t/${tenantId}/donations`;
      if (onCommand) onCommand('show donations');
    } else if (lowerCommand.includes('calendar') || lowerCommand.includes('meeting')) {
      response = "Meow! I'll open the calendar for you right away! 📅";
      navigationUrl = `/t/${tenantId}/calendar`;
      if (onCommand) onCommand('show calendar');
    } else if (lowerCommand.includes('report')) {
      response = "Purr-fect! I'll generate a report for you! 📊";
      navigationUrl = `/t/${tenantId}/reports`;
      if (onCommand) onCommand('generate report');
    } else if (lowerCommand.includes('hello') || lowerCommand.includes('hi')) {
      response = "Meow! Hello there! How can this cute cat help you today? 🐱";
    } else if (lowerCommand.includes('thank')) {
      response = "Purr! You're so welcome! I'm happy to help! 🐾";
    } else {
      response = "Meow! I heard you say: " + command + ". Let me help you with that! 🐱";
    }
    
    // Send response back to LiveKit
    sendToLiveKit({
      type: 'response',
      text: response,
      timestamp: Date.now(),
    });
    
    // Speak the response
    speak(response, () => {
      // Navigate after speaking
      if (navigationUrl) {
        console.log('🚀 Navigating to:', navigationUrl);
        window.location.href = navigationUrl;
      }
      setIsProcessing(false);
      setAvatarState(isListening ? 'listening' : 'idle');
    });
  };

  // Simulate voice input for testing
  const simulateVoiceInput = (text: string) => {
    console.log('🎤 Simulating voice input:', text);
    setTranscript(text);
    processVoiceCommand(text);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
      cleanupAudioMonitoring();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Cute Cat Avatar Component with audio level visualization
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

          {/* LiveKit Microphone Icon for Listening */}
          {avatarState === 'listening' && (
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                <span className="text-white text-sm">🎤</span>
              </div>
            </div>
          )}

          {/* Audio Level Visualization */}
          {avatarState === 'listening' && audioLevel > 0 && (
            <div className="absolute -right-3 top-1/2 transform -translate-y-1/2">
              <div 
                className="w-2 bg-green-400 rounded-full animate-pulse"
                style={{ height: `${Math.min(audioLevel * 2, 40)}px` }}
              ></div>
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
        <h3 className="text-xl font-bold text-gray-900 mb-1">🐱 LiveKit Cat Assistant</h3>
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
              🎤 LIVEKIT LISTENING! Speak now!
            </>
          )}
          {avatarState === 'speaking' && (
            <>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
              🐱 Cat is speaking... Please wait
            </>
          )}
          {avatarState === 'thinking' && (
            <>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse mr-2"></div>
              🤔 Processing your command...
            </>
          )}
          {avatarState === 'idle' && (
            <>
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
              🐱 Ready to connect to LiveKit
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
            🎤 Connect to LiveKit
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
          <h4 className="text-sm font-semibold text-gray-700 mb-2">LiveKit heard:</h4>
          <p className="text-gray-900 italic">"{transcript}"</p>
        </div>
      )}

      {/* Quick Commands */}
      {isConnected && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => simulateVoiceInput("Find Jonathan")}
            className="p-3 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
          >
            👤 Find Jonathan
          </button>
          <button
            onClick={() => simulateVoiceInput("Show contacts")}
            className="p-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
          >
            📋 All Contacts
          </button>
          <button
            onClick={() => simulateVoiceInput("Show donations")}
            className="p-3 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
          >
            💰 Donations
          </button>
          <button
            onClick={() => simulateVoiceInput("Show calendar")}
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
            <li>• Click "Connect to LiveKit" to start</li>
            <li>• LiveKit will listen to your voice in real-time</li>
            <li>• Say "Find Jonathan" - LiveKit will process and respond!</li>
            <li>• Watch the audio level indicator when you speak</li>
            <li>• The cat shows LiveKit connection status!</li>
          </ul>
        </div>
      )}
    </div>
  );
}