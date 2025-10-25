'use client';

import React, { useState, useEffect, useRef } from 'react';

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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Text-to-Speech function
  const speak = (text: string, onEnd?: () => void) => {
    if ('speechSynthesis' in window) {
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
    }, 2000);
    return () => clearTimeout(timer);
  }, [hasGreeted]);

  // Simplified connection function (mock for now)
  const connectToRoom = async () => {
    console.log('Connecting to voice room...');
    setIsConnected(true);
    setIsMuted(false);
    
    // Simulate connection
    setTimeout(() => {
      if (onCommand) {
        onCommand('connected');
      }
    }, 1000);
  };

  // Simplified mute toggle
  const toggleMute = () => {
    setIsMuted(!isMuted);
    console.log('Mute toggled:', !isMuted);
  };

  // Simplified disconnect
  const disconnectFromRoom = () => {
    console.log('Disconnecting from voice room...');
    setIsConnected(false);
    setIsMuted(true);
    setTranscript('');
  };

  // Mock voice command processing
  const sendVoiceCommand = async (command: string) => {
    console.log('Processing voice command:', command);
    const response = getConversationalResponse(command);
    speak(response, () => {
      if (onCommand) {
        onCommand(command);
      }
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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
    </div>
  );
}