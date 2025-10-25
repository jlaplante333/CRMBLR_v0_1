'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Room, RoomEvent, RemoteParticipant, LocalParticipant, Track, TrackPublication, AudioTrack } from 'livekit-client';
import { LIVEKIT_CLIENT_CONFIG } from '@/lib/livekit-config';
import { useRouter } from 'next/navigation';

// TypeScript declarations for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface VoiceAssistantProps {
  tenantId: string;
  userId: string;
  onTranscript?: (text: string) => void;
  onCommand?: (command: string) => void;
}

export function VoiceAssistant({ tenantId, userId, onTranscript, onCommand }: VoiceAssistantProps) {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [error, setError] = useState<string>('');
  const [avatarState, setAvatarState] = useState<'idle' | 'listening' | 'speaking' | 'thinking'>('idle');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAmbientMode, setIsAmbientMode] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isProcessingCommand, setIsProcessingCommand] = useState(false);
  const [hasIntroduced, setHasIntroduced] = useState(false); // Track if initial introduction has been given
  const lastProcessedCommand = useRef<string>(''); // Track last processed command to prevent duplicates
  const stopSpeakingRef = useRef<(() => void) | null>(null); // Reference to stop speaking function
  
  const roomRef = useRef<Room | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // High-quality TTS using OpenAI API
  const speakWithOpenAI = async (text: string, onEnd?: () => void) => {
    try {
      console.log('🎤 Using OpenAI TTS for high-quality voice...');
      
      const response = await fetch('/api/openai/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: 'nova', // Friendly, conversational voice
          model: 'tts-1'
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI TTS failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      setIsSpeaking(true);
      setAvatarState('speaking');
      
      // Store stop function for this audio
      stopSpeakingRef.current = () => {
        audio.pause();
        audio.currentTime = 0;
        URL.revokeObjectURL(audioUrl);
        setIsSpeaking(false);
        if (!isListening && !isProcessing && !isProcessingCommand) {
          setAvatarState('idle');
        }
        if (onEnd) onEnd();
      };
      
      audio.onended = () => {
        setIsSpeaking(false);
        if (!isListening && !isProcessing && !isProcessingCommand) {
          setAvatarState('idle');
        }
        URL.revokeObjectURL(audioUrl);
        stopSpeakingRef.current = null;
        if (onEnd) onEnd();
      };
      
      audio.onerror = (event) => {
        console.error('❌ OpenAI TTS audio error:', event);
        setIsSpeaking(false);
        if (!isListening && !isProcessing && !isProcessingCommand) {
          setAvatarState('idle');
        }
        // Fallback to browser TTS
        fallbackSpeak(text, onEnd);
      };
      
      await audio.play();
      
    } catch (error) {
      console.error('❌ OpenAI TTS error:', error);
      // Fallback to browser TTS
      fallbackSpeak(text, onEnd);
    }
  };

  // Fallback to browser TTS
  const fallbackSpeak = (text: string, onEnd?: () => void) => {
    console.log('🔄 Falling back to browser TTS...');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      utterance.volume = 0.9;

      const voices = window.speechSynthesis.getVoices();
      const friendlyVoice = voices.find(
        (voice) =>
          voice.lang === 'en-US' &&
          (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Samantha'))
      );
      if (friendlyVoice) {
        utterance.voice = friendlyVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setAvatarState('speaking');
      };
             utterance.onend = () => {
               setIsSpeaking(false);
               if (!isListening && !isProcessing && !isProcessingCommand) {
                 setAvatarState('idle');
               }
               if (onEnd) onEnd();
             };
      utterance.onerror = (event) => {
        console.error('❌ Speech synthesis error:', event);
        setIsSpeaking(false);
        if (!isListening && !isProcessing && !isProcessingCommand) {
          setAvatarState('idle');
        }
      };
      
      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Main speak function - tries OpenAI first, falls back to browser
  const speak = (text: string, onEnd?: () => void) => {
    // Stop speech recognition while speaking to prevent self-triggering
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      console.log('🔇 Stopped speech recognition while speaking');
    }
    
    speakWithOpenAI(text, () => {
      if (onEnd) onEnd();
      
      // Re-enable speech recognition after a delay to prevent self-triggering
      setTimeout(() => {
        if (isConnected && isAmbientMode && !isProcessingCommand) {
          console.log('🔄 Re-enabling speech recognition after speaking');
          startAmbientListening();
        }
      }, 2000); // 2 second delay to prevent self-triggering
    });
  };

  // Stop speaking function
  const stopSpeaking = () => {
    console.log('🔕 Stopping speech...');
    
    // Stop OpenAI TTS if playing
    if (stopSpeakingRef.current) {
      stopSpeakingRef.current();
      stopSpeakingRef.current = null;
    }
    
    // Stop browser TTS
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    setIsSpeaking(false);
    if (!isListening && !isProcessing && !isProcessingCommand) {
      setAvatarState('idle');
    }
  };

  // Process voice commands
  const processVoiceCommand = async (command: string) => {
    // Prevent duplicate processing with more robust check
    if (isProcessingCommand || isSpeaking || isProcessing) {
      console.log('🚫 Command already being processed, ignoring duplicate:', command);
      return;
    }
    
    // Prevent processing the same command multiple times
    const normalizedCommand = command.toLowerCase().trim();
    if (lastProcessedCommand.current === normalizedCommand) {
      console.log('🚫 Same command already processed recently, ignoring:', command);
      return;
    }
    
    // Additional validation - ensure it's a real command
    const commandWords = normalizedCommand.split(' ');
    if (commandWords.length < 2 && !normalizedCommand.includes('help') && !normalizedCommand.includes('stop')) {
      console.log('🚫 Command too short or not specific enough:', command);
      return;
    }
    
    // Check if this command was processed very recently (within 3 seconds)
    const now = Date.now();
    const lastProcessedTime = (lastProcessedCommand as any).timestamp || 0;
    if (now - lastProcessedTime < 3000) {
      console.log('🚫 Command processed too recently, ignoring:', command);
      return;
    }
    
    console.log('🎯 Processing command:', command);
    lastProcessedCommand.current = normalizedCommand;
    (lastProcessedCommand as any).timestamp = now;
    setIsProcessingCommand(true);
    setIsProcessing(true);
    setAvatarState('thinking');
    
    if (onTranscript) onTranscript(command);

    const lowerCommand = command.toLowerCase();
    console.log('🔍 Lower command:', lowerCommand);
    let responseText = "Perfect! Let me help you with that!";
    let navigateTo: string | null = null;

    // Enhanced command recognition
    if (lowerCommand.includes('stop') || lowerCommand.includes('stop talking') || lowerCommand.includes('shut up') || lowerCommand.includes('be quiet')) {
      stopSpeaking();
      setIsProcessingCommand(false);
      setIsProcessing(false);
      setAvatarState('idle');
      return; // Don't continue processing
    } else if (lowerCommand.includes('sales') || lowerCommand.includes('funnel') || lowerCommand.includes('pipeline')) {
      responseText = "Let me show you the sales pipeline!";
      navigateTo = `/t/${tenantId}/pipeline`;
    } else if (lowerCommand.includes('donations') || lowerCommand.includes('quarter') || lowerCommand.includes('revenue')) {
      responseText = "Perfect! Opening donations for this quarter!";
      navigateTo = `/t/${tenantId}/donations`;
    } else if (lowerCommand.includes('biggest donation') || lowerCommand.includes('biggest donor') || lowerCommand.includes('top donor') || lowerCommand.includes('largest donation') || lowerCommand.includes('biggest donor this quarter') || lowerCommand.includes('who is the biggest donor')) {
      // Check if we're on the donations page and can access the biggest donation info
      if (typeof window !== 'undefined' && (window as any).biggestDonationInfo) {
        const info = (window as any).biggestDonationInfo;
        if (lowerCommand.includes('quarter')) {
          responseText = `Alex Inc is the biggest donor this quarter with $${info.amount.toLocaleString()} donated on ${info.date}!`;
        } else {
          responseText = `The biggest donor is ${info.donor} with $${info.amount.toLocaleString()} donated on ${info.date}!`;
        }
      } else {
        responseText = "Perfect! Let me show you the donations page to find the biggest donor this quarter!";
        navigateTo = `/t/${tenantId}/donations`;
      }
    } else if (lowerCommand.includes('contacts') || lowerCommand.includes('people') || lowerCommand.includes('customers')) {
      responseText = "Opening your contacts!";
      navigateTo = `/t/${tenantId}/contacts`;
    } else if (lowerCommand.includes('calendar') || lowerCommand.includes('meeting') || lowerCommand.includes('schedule')) {
      responseText = "Let's check your calendar!";
      navigateTo = `/t/${tenantId}/calendar`;
    } else if (lowerCommand.includes('reports') || lowerCommand.includes('analytics') || lowerCommand.includes('data')) {
      responseText = "Perfect! Generating your reports!";
      navigateTo = `/t/${tenantId}/reports`;
    } else if (lowerCommand.includes('find') && lowerCommand.includes('jonathan')) {
      responseText = "Perfect! Let me find Jonathan for you!";
      navigateTo = `/t/${tenantId}/contacts?search=Jonathan`;
    } else if (lowerCommand.includes('find') && lowerCommand.includes('takua')) {
      responseText = "Finding Takua for you!";
      navigateTo = `/t/${tenantId}/contacts?search=Takua`;
    } else if (lowerCommand.includes('find') && lowerCommand.includes('hong')) {
      responseText = "Perfect! Let me find Hong for you!";
      navigateTo = `/t/${tenantId}/contacts?search=Hong`;
    } else if (lowerCommand.includes('find') && lowerCommand.includes('datz')) {
      responseText = "Finding Datz for you!";
      navigateTo = `/t/${tenantId}/contacts?search=Datz`;
    } else if (lowerCommand.includes('weather') || lowerCommand.includes('temperature') || lowerCommand.includes('climate') || 
               lowerCommand.includes('what\'s the weather') || lowerCommand.includes('how\'s the weather') || 
               lowerCommand.includes('weather like') || lowerCommand.includes('weather in tokyo') ||
               lowerCommand.includes('tokyo weather') || lowerCommand.includes('rain') || lowerCommand.includes('sunny') ||
               lowerCommand.includes('cloudy') || lowerCommand.includes('forecast')) {
      // Handle weather queries with OpenAI
      setIsProcessing(true);
      setAvatarState('thinking');
      
      try {
        const response = await fetch('/api/openai/weather', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: command
          }),
        });

        if (response.ok) {
          const data = await response.json();
          responseText = `${data.answer}`;
        } else {
          responseText = "I couldn't get the weather information right now. Please try again later!";
        }
      } catch (error) {
        console.error('Weather query error:', error);
        responseText = "I'm having trouble getting weather information. Please try again!";
      }
      
      speak(responseText, () => {
        setIsProcessing(false);
        setIsProcessingCommand(false);
        if (onCommand) onCommand(command);
        
        // Clear the last processed command after a delay
        setTimeout(() => {
          lastProcessedCommand.current = '';
        }, 3000);
      });
      return; // Don't continue with normal processing
    } else if (lowerCommand.includes('donation advice') || lowerCommand.includes('how to get donations') || lowerCommand.includes('donation strategy') || lowerCommand.includes('increase donations') || lowerCommand.includes('get donations up') || lowerCommand.includes('donation tips') || lowerCommand.includes('fundraising advice')) {
      // Handle donation advice queries with OpenAI
      setIsProcessing(true);
      setAvatarState('thinking');

      try {
        const response = await fetch('/api/openai/donation-advice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: command
          }),
        });

        if (response.ok) {
          const data = await response.json();
          responseText = `${data.answer}`;
        } else {
          responseText = "I couldn't get donation advice right now. Please try again later!";
        }
      } catch (error) {
        console.error('Donation advice query error:', error);
        responseText = "I'm having trouble getting donation advice. Please try again!";
      }

      speak(responseText, () => {
        setIsProcessing(false);
        setIsProcessingCommand(false);
        if (onCommand) onCommand(command);
        
        // Clear the last processed command after a delay
        setTimeout(() => {
          lastProcessedCommand.current = '';
        }, 3000);
      });
      return; // Don't continue with normal processing
    } else if (lowerCommand.startsWith('question') || lowerCommand.startsWith('ask') || lowerCommand.startsWith('what is') || lowerCommand.startsWith('how does') || lowerCommand.startsWith('explain') || lowerCommand.startsWith('tell me about')) {
      // Handle general questions with OpenAI
      setIsProcessing(true);
      setAvatarState('thinking');

      try {
        const response = await fetch('/api/openai/general-question', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: command
          }),
        });

        if (response.ok) {
          const data = await response.json();
          responseText = `${data.answer}`;
        } else {
          responseText = "I couldn't answer that question right now. Please try again later!";
        }
      } catch (error) {
        console.error('General question query error:', error);
        responseText = "I'm having trouble answering that question. Please try again!";
      }

      speak(responseText, () => {
        setIsProcessing(false);
        setIsProcessingCommand(false);
        if (onCommand) onCommand(command);
        
        // Clear the last processed command after a delay
        setTimeout(() => {
          lastProcessedCommand.current = '';
        }, 3000);
      });
      return; // Don't continue with normal processing
    } else if (lowerCommand.includes('help') || lowerCommand.includes('what can you do')) {
      responseText = "I can help you navigate to sales pipeline, donations, contacts, calendar, reports, find specific people like Jonathan, Takua, Hong, or Datz, tell you about the biggest donor this quarter, check the weather in Tokyo, get donation advice, answer any general question, or say 'stop' to stop me talking! Just say what you need!";
    } else {
      responseText = "I didn't quite catch that. Try saying 'sales pipeline', 'donations', 'contacts', 'find Jonathan', or ask a question starting with 'QUESTION'.";
    }

    speak(responseText, () => {
      setIsProcessing(false);
      setIsProcessingCommand(false);
      if (onCommand) onCommand(command);
      if (navigateTo) {
        // Navigate immediately after speaking
        setTimeout(() => {
          router.push(navigateTo);
        }, 500); // Small delay to ensure speech is complete
      }
      
      // Clear the last processed command after a delay to allow the same command again
      setTimeout(() => {
        lastProcessedCommand.current = '';
      }, 5000); // 5 second debounce
    });
  };

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

  // Set up audio level monitoring
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

  // Start ambient speech recognition
  const startAmbientListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('❌ Speech recognition not supported');
      setError('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 AMBIENT LISTENING STARTED - Always listening for commands!');
      setIsListening(true);
      setAvatarState('listening');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += result;
        } else {
          interimTranscript += result;
        }
      }

      if (interimTranscript) {
        setTranscript(interimTranscript);
      }

      if (finalTranscript) {
        console.log('🎯 AMBIENT COMMAND DETECTED:', finalTranscript);
        
        // Noise filtering - ignore very short or low-confidence commands
        const trimmedTranscript = finalTranscript.trim();
        if (trimmedTranscript.length < 5) { // Increased from 3 to 5 characters
          console.log('🚫 Ignoring very short command (likely noise):', trimmedTranscript);
          return;
        }
        
        // Check confidence if available
        const result = event.results[event.results.length - 1];
        if (result && result[0] && result[0].confidence < 0.8) { // Increased from 0.6 to 0.8
          console.log('🚫 Ignoring low-confidence command:', trimmedTranscript, 'confidence:', result[0].confidence);
          return;
        }
        
        // Additional noise filtering - ignore common noise patterns
        const lowerTranscript = trimmedTranscript.toLowerCase();
        const noisePatterns = [
          'uh', 'um', 'ah', 'eh', 'oh', 'mm', 'hmm', 'huh',
          'yeah', 'yes', 'no', 'ok', 'okay', 'right', 'sure',
          'hello', 'hi', 'hey', 'test', 'testing', 'mic', 'microphone'
        ];
        
        if (noisePatterns.includes(lowerTranscript)) {
          console.log('🚫 Ignoring common noise pattern:', trimmedTranscript);
          return;
        }
        
        // Ignore single words that are likely noise
        if (lowerTranscript.split(' ').length === 1 && lowerTranscript.length < 8) {
          console.log('🚫 Ignoring single word (likely noise):', trimmedTranscript);
          return;
        }
        
        setTranscript(finalTranscript);
        
        // Send transcript to LiveKit
        if (roomRef.current && roomRef.current.localParticipant) {
          const payload = new TextEncoder().encode(JSON.stringify({
            type: 'transcript',
            text: finalTranscript,
            timestamp: Date.now()
          }));
          roomRef.current.localParticipant.publishData(payload, { reliable: true });
          console.log('📤 Sent transcript to LiveKit:', finalTranscript);
        }
        
        // Only process if not already processing and not during initial introduction
        if (!isProcessingCommand && !isSpeaking && !isProcessing) {
          // Add a small delay to prevent immediate processing of ambient noise
          setTimeout(() => {
            if (!isProcessingCommand && !isSpeaking && !isProcessing) {
              processVoiceCommand(finalTranscript).catch(error => {
                console.error('Error processing voice command:', error);
                setIsProcessing(false);
                setIsProcessingCommand(false);
              });
            }
          }, 500); // 500ms delay to filter out quick ambient noise
        } else {
          console.log('🚫 Speech recognition detected command but already processing or speaking, ignoring:', finalTranscript);
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('❌ Speech recognition error:', event.error);
      
      if (event.error === 'no-speech') {
        console.log('🔇 No speech detected, continuing ambient listening...');
      } else if (event.error === 'network') {
        setError('Network error. Please check your connection.');
        speak("Network error. Please check your connection. 😿");
      } else if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access!');
        speak("Microphone access denied. Please allow microphone access! 😿");
        setIsAmbientMode(false);
      }
    };

    recognition.onend = () => {
      console.log('🔚 Speech recognition ended');
      setIsListening(false);
      if (!isProcessing && !isProcessingCommand) {
        setAvatarState('idle');
      }

      // Always restart recognition if still connected and in ambient mode
      // But add a longer delay to prevent rapid restarts
      if (isConnected && isAmbientMode) {
        setTimeout(() => {
          if (isConnected && isAmbientMode && !isProcessingCommand && !isSpeaking) {
            console.log('🔄 Restarting ambient listening...');
            recognition.start();
          }
        }, 2000); // Longer delay to prevent rapid restarts
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    console.log('🎤 Ambient listening initialized and started!');
  };

  // Stop ambient listening
  const stopAmbientListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsListening(false);
      setIsAmbientMode(false);
      if (!isProcessing) {
        setAvatarState('idle');
      }
      console.log('🛑 Ambient listening stopped');
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
        
        // Enable microphone
        await room.localParticipant.enableCameraAndMicrophone(false, true);
        console.log('🎤 Microphone enabled for LiveKit!');
        
        // Set up audio level monitoring
        setupAudioLevelMonitoring();
        
        // Start ambient listening
        startAmbientListening();
        
        // Auto-greet user with high-quality voice (only once)
        if (!hasIntroduced) {
          setHasIntroduced(true);
          speak("I'm connected to LiveKit and listening ambiently! Just say what you need - like 'show me sales funnel' or 'find Jonathan'!");
        }
      });

      room.on(RoomEvent.Disconnected, () => {
        console.log('❌ Disconnected from LiveKit room');
        setIsConnected(false);
        setIsListening(false);
        setConnectionStatus('disconnected');
        setAvatarState('idle');
        setHasIntroduced(false); // Reset introduction state on disconnect
        cleanupAudioMonitoring();
        stopAmbientListening();
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
            
            // Only process if not already processing (prevent duplicate responses)
            if (!isProcessingCommand && !isSpeaking && !isProcessing) {
              processVoiceCommand(transcriptText).catch(error => {
                console.error('Error processing voice command:', error);
                setIsProcessing(false);
                setIsProcessingCommand(false);
              });
            } else {
              console.log('🚫 LiveKit received transcript but already processing, ignoring:', transcriptText);
            }
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

  // Disconnect from room
  const disconnectFromRoom = async () => {
    console.log('🔌 Disconnecting from LiveKit...');
    
    stopAmbientListening();
    cleanupAudioMonitoring();
    
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    setIsConnected(false);
    setIsListening(false);
    setIsProcessing(false);
    setIsProcessingCommand(false);
    setConnectionStatus('disconnected');
    setTranscript('');
    setAvatarState('idle');
    setHasIntroduced(false); // Reset introduction state on disconnect
  };

  // Toggle ambient mode
  const toggleAmbientMode = () => {
    if (isAmbientMode) {
      stopAmbientListening();
      speak("I've stopped listening. Click the button to start ambient listening again!");
    } else {
      setIsAmbientMode(true);
      startAmbientListening();
      speak("I'm now listening ambiently! Just say what you need - like 'show me sales funnel' or 'find Jonathan'!");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAmbientListening();
      cleanupAudioMonitoring();
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Periodic check to ensure speech recognition is running
  useEffect(() => {
    if (isConnected && isAmbientMode && !isProcessingCommand) {
      const checkInterval = setInterval(() => {
        if (isConnected && isAmbientMode && !isProcessingCommand && !isListening && !isSpeaking) {
          console.log('🔄 Periodic check: Restarting speech recognition...');
          startAmbientListening();
        }
      }, 5000); // Check every 5 seconds

      return () => clearInterval(checkInterval);
    }
  }, [isConnected, isAmbientMode, isProcessingCommand, isListening, isSpeaking]);

  // Cute Cat Avatar Component with audio level visualization
  const CuteCatAvatar = () => {
    return (
      <div className="relative w-32 h-32 mx-auto mb-6">
        {/* Cat Head */}
        <div className={`relative w-32 h-32 rounded-full transition-all duration-500 ${
          avatarState === 'listening' ? 'bg-gradient-to-br from-orange-300 to-orange-500 shadow-lg shadow-orange-200' :
          avatarState === 'speaking' ? 'bg-gradient-to-br from-blue-300 to-blue-500 shadow-lg shadow-blue-200' :
          avatarState === 'thinking' ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-lg shadow-yellow-200' :
          'bg-gradient-to-br from-gray-300 to-gray-500 shadow-lg shadow-gray-200'
        }`}>
          {/* Ears */}
          <div className="absolute -top-2 left-6 w-8 h-8 bg-orange-400 rounded-tl-full rounded-tr-full transform -rotate-12"></div>
          <div className="absolute -top-2 right-6 w-8 h-8 bg-orange-400 rounded-tl-full rounded-tr-full transform rotate-12"></div>
          
          {/* Inner Ears */}
          <div className="absolute top-0 left-7 w-4 h-4 bg-pink-300 rounded-full transform -rotate-12"></div>
          <div className="absolute top-0 right-7 w-4 h-4 bg-pink-300 rounded-full transform rotate-12"></div>

          {/* Eyes */}
          <div className="absolute top-8 left-8 w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
              avatarState === 'listening' ? 'bg-green-500 animate-pulse' :
              avatarState === 'speaking' ? 'bg-blue-500 animate-bounce' :
              avatarState === 'thinking' ? 'bg-yellow-500 animate-spin' :
              'bg-gray-600'
            }`}></div>
          </div>
          <div className="absolute top-8 right-8 w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
              avatarState === 'listening' ? 'bg-green-500 animate-pulse' :
              avatarState === 'speaking' ? 'bg-blue-500 animate-bounce' :
              avatarState === 'thinking' ? 'bg-yellow-500 animate-spin' :
              'bg-gray-600'
            }`}></div>
          </div>

          {/* Nose */}
          <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-4 h-3 bg-pink-500 rounded-full"></div>
          
          {/* Mouth */}
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-8 h-4 border-b-2 border-gray-600 rounded-b-full"></div>

          {/* Whiskers */}
          <div className="absolute top-14 left-2 w-8 h-0.5 bg-gray-600 transform -rotate-12"></div>
          <div className="absolute top-16 left-2 w-8 h-0.5 bg-gray-600 transform rotate-12"></div>
          <div className="absolute top-14 right-2 w-8 h-0.5 bg-gray-600 transform rotate-12"></div>
          <div className="absolute top-16 right-2 w-8 h-0.5 bg-gray-600 transform -rotate-12"></div>
        </div>

        {/* Audio Level Visualization */}
        {isConnected && isListening && audioLevel > 0 && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-1">
              <div 
                className="w-2 bg-green-400 rounded-full animate-bounce" 
                style={{ height: `${Math.max(16, audioLevel / 4)}px` }}
              ></div>
              <div 
                className="w-2 bg-green-400 rounded-full animate-bounce" 
                style={{ height: `${Math.max(24, audioLevel / 3)}px`, animationDelay: '0.1s' }}
              ></div>
              <div 
                className="w-2 bg-green-400 rounded-full animate-bounce" 
                style={{ height: `${Math.max(16, audioLevel / 4)}px`, animationDelay: '0.2s' }}
              ></div>
            </div>
          </div>
        )}

        {/* Speaking Animation */}
        {avatarState === 'speaking' && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-1">
              <div className="w-2 h-4 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-6 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-4 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
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
    );
  };

  return (
    <div className="voice-assistant-container bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 rounded-2xl p-6 shadow-xl border border-orange-200 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1">LiveKit + OpenAI TTS Assistant</h3>
        <p className="text-sm text-gray-600">High-Quality Voice • Always Listening</p>
      </div>

      {/* Cute Cat Avatar */}
      <CuteCatAvatar />

      {/* Status Display */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
          avatarState === 'listening' ? 'bg-green-100 text-green-800' :
          avatarState === 'speaking' ? 'bg-blue-100 text-blue-800' :
          avatarState === 'thinking' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {avatarState === 'listening' && 'LiveKit Listening - Say Something!'}
          {avatarState === 'speaking' && 'OpenAI TTS Speaking...'}
          {avatarState === 'thinking' && 'Processing Your Command...'}
          {avatarState === 'idle' && 'Idle - Click to Connect'}
        </div>
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-inner">
          <p className="text-sm text-gray-700 italic">"{transcript}"</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Control Buttons */}
      <div className="space-y-3">
        {!isConnected ? (
          <button
            onClick={connectToRoom}
            className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full font-medium transition-all duration-300 hover:from-orange-600 hover:to-pink-600 shadow-lg hover:shadow-xl"
          >
            Connect LiveKit + Start Ambient Listening
          </button>
        ) : (
          <>
            <button
              onClick={toggleAmbientMode}
              className={`w-full px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                isAmbientMode 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isAmbientMode ? 'Stop Ambient Listening' : 'Start Ambient Listening'}
            </button>
            
            <button
              onClick={disconnectFromRoom}
              className="w-full px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-full font-medium transition-all duration-300"
            >
              🔌 Disconnect from LiveKit
            </button>
          </>
        )}

        {isSpeaking && (
          <button
            onClick={() => {
              if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
                setAvatarState('idle');
              }
            }}
            className="w-full px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full font-medium transition-all duration-300"
          >
            Stop Speaking
          </button>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-6 space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">LiveKit + OpenAI TTS Features:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Real-time LiveKit WebRTC connection</li>
            <li>• High-quality OpenAI TTS voices</li>
            <li>• Ambient listening with speech recognition</li>
            <li>• Audio level visualization</li>
            <li>• Fallback to browser TTS if needed</li>
          </ul>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="text-sm font-semibold text-green-900 mb-2">Voice Commands:</h4>
          <ul className="text-xs text-green-800 space-y-1">
            <li>• "Show me sales pipeline" or "pipeline"</li>
            <li>• "Donations this quarter" or "revenue"</li>
            <li>• "Biggest donor this quarter"</li>
            <li>• "Find Jonathan" or "contacts"</li>
            <li>• "Calendar" or "meetings"</li>
            <li>• "Reports" or "analytics"</li>
            <li>• "What's the weather like in Tokyo?"</li>
            <li>• "How's the weather?" or "Weather forecast"</li>
            <li>• "What would you suggest to get donations up?"</li>
            <li>• "Donation advice" or "Fundraising tips"</li>
            <li>• "QUESTION: What is artificial intelligence?"</li>
            <li>• "QUESTION: How does machine learning work?"</li>
            <li>• "Stop" or "Stop talking"</li>
            <li>• "Find Takua", "Find Hong", "Find Datz"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}