'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function VoiceTestPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
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

  // Connect to voice and start greeting
  const connectToVoice = () => {
    setIsConnected(true);
    speak("How are you today? What would you like me to do, sir?");
    setHasGreeted(true);
  };

  // Disconnect from voice
  const disconnectFromVoice = () => {
    setIsConnected(false);
    stopSpeaking();
    setTranscript('');
    setHasGreeted(false);
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

  // Simulate voice command processing
  const sendVoiceCommand = (command: string) => {
    setTranscript(`You said: "${command}"`);
    const response = getConversationalResponse(command);
    speak(response);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎤 V-CRM Voice Test
          </h1>
          <p className="text-gray-600">
            Test the LiveKit voice assistant functionality
          </p>
        </div>

        {/* Voice Status */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-lg font-medium">
            {isConnected ? 'Voice Connected' : 'Voice Disconnected'}
          </span>
          {isSpeaking && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-600">Speaking...</span>
            </div>
          )}
        </div>

        {/* Mic Button */}
        <div className="text-center mb-8">
          {!isConnected ? (
            <button
              onClick={connectToVoice}
              className="w-24 h-24 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-4xl"
            >
              🎤
            </button>
          ) : (
            <button
              onClick={disconnectFromVoice}
              className="w-24 h-24 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-4xl"
            >
              🔇
            </button>
          )}
        </div>

        {/* Control Buttons */}
        {isConnected && (
          <div className="flex justify-center space-x-4 mb-8">
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Stop Speaking
              </button>
            )}
            <button
              onClick={() => speak("How are you today? What would you like me to do, sir?")}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Repeat Greeting
            </button>
          </div>
        )}

        {/* Transcript Display */}
        {transcript && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Voice Transcript</h3>
            <p className="text-gray-700">{transcript}</p>
          </div>
        )}

        {/* Test Commands */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 text-center">Test Commands</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => sendVoiceCommand('show me contact Jonathan')}
              className="p-4 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
            >
              👤 Find Jonathan
            </button>
            <button
              onClick={() => sendVoiceCommand('create new contact')}
              className="p-4 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
            >
              📞 New Contact
            </button>
            <button
              onClick={() => sendVoiceCommand('show donations')}
              className="p-4 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors"
            >
              💰 Donations
            </button>
            <button
              onClick={() => sendVoiceCommand('schedule meeting')}
              className="p-4 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors"
            >
              📅 Calendar
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Instructions:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Click the microphone button to connect</li>
            <li>2. The voice assistant will greet you</li>
            <li>3. Try the test commands or speak naturally</li>
            <li>4. The assistant will respond with voice and actions</li>
          </ol>
        </div>

        {/* Links */}
        <div className="mt-6 text-center space-x-4">
          <a
            href="/"
            className="inline-block px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Home
          </a>
          <a
            href="/login"
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to CRM
          </a>
        </div>
      </div>
    </div>
  );
}