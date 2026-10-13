import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  HelpCircle,
  Square,
  Sparkles,
  AlertCircle,
  Clock,
  RotateCcw,
  Radio,
  AudioWaveform,
  Headphones,
  Zap,
} from 'lucide-react';
import { ChatMessage, InterviewConfig, InterviewSession } from '../types/interview';
import { apiGenerateTTS, apiRequestHint, apiSubmitTurn } from '../services/api';
import { saveActiveSessionDraft } from '../utils/storage';

interface InterviewRoomProps {
  session: InterviewSession;
  onConcludeInterview: (updatedMessages: ChatMessage[], durationSeconds: number) => void;
  onAbortInterview: () => void;
}

export const InterviewRoom: React.FC<InterviewRoomProps> = ({
  session,
  onConcludeInterview,
  onAbortInterview,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(session.messages);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState<number>(session.currentQuestionNumber);
  const [isFollowUp, setIsFollowUp] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio Output State (AI Speaking)
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(true); // Enabled by default so interviewer speaks!
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [audioAutoplayBlocked, setAudioAutoplayBlocked] = useState<boolean>(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Microphone / Speech Recognition State (Candidate Listening)
  const [isListening, setIsListening] = useState<boolean>(false);
  const [micPermissionDenied, setMicPermissionDenied] = useState<boolean>(false);
  const [autoListenMode, setAutoListenMode] = useState<boolean>(true); // Hands-free auto-arm
  const [autoSendOnSilence, setAutoSendOnSilence] = useState<boolean>(true); // Auto send after 2s silence
  const [silenceCountdownMs, setSilenceCountdownMs] = useState<number | null>(null);
  const [micVolume, setMicVolume] = useState<number>(0); // 0 to 100 for visual wave

  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const silenceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const latestTextRef = useRef<string>('');
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Practice Mode Hint State
  const [hintText, setHintText] = useState<string | null>(null);
  const [isLoadingHint, setIsLoadingHint] = useState<boolean>(false);

  // Timer State
  const totalSeconds = session.config.durationMinutes * 60;
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(session.durationSecondsTaken || 0);
  const [showEndModal, setShowEndModal] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, hintText, interimTranscript, silenceCountdownMs]);

  // Keep latestTextRef in sync
  useEffect(() => {
    latestTextRef.current = (inputText + ' ' + interimTranscript).trim();
  }, [inputText, interimTranscript]);

  // Timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Persist session draft
  useEffect(() => {
    saveActiveSessionDraft({
      ...session,
      messages,
      currentQuestionNumber,
      durationSecondsTaken: elapsedSeconds,
    });
  }, [messages, currentQuestionNumber, elapsedSeconds, session]);

  // ------------------------------------------------------------------
  // SMART SILENCE DETECTION (Auto-send after 2 seconds of silence)
  // ------------------------------------------------------------------
  const cancelSilenceTimer = () => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (silenceIntervalRef.current) {
      clearInterval(silenceIntervalRef.current);
      silenceIntervalRef.current = null;
    }
    setSilenceCountdownMs(null);
  };

  const startSilenceTimer = (textToSubmit: string) => {
    cancelSilenceTimer();
    if (!autoSendOnSilence || isLoading) return;
    if (textToSubmit.trim().length < 8) return; // Must have sufficient words to avoid accidental whispers

    const DURATION = 2000; // Exactly 2 continuous seconds of silence
    const startTime = Date.now();
    setSilenceCountdownMs(DURATION);

    silenceIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, DURATION - elapsed);
      setSilenceCountdownMs(remaining);
      if (remaining <= 0) {
        if (silenceIntervalRef.current) {
          clearInterval(silenceIntervalRef.current);
          silenceIntervalRef.current = null;
        }
      }
    }, 100);

    silenceTimeoutRef.current = setTimeout(() => {
      cancelSilenceTimer();
      const current = latestTextRef.current.trim();
      if (current.length >= 8 && !isLoading) {
        handleSendMessage(current);
      }
    }, DURATION);
  };

  // ------------------------------------------------------------------
  // INTERVIEWER AUDIO SYNTHESIS & PLAYBACK (Speaks questions out loud)
  // ------------------------------------------------------------------
  const playInterviewerAudio = async (text: string) => {
    if (!ttsEnabled) return;

    // Stop any existing playback
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setIsAiSpeaking(true);

    try {
      // First attempt realistic Gemini TTS
      const cleanText = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/###/g, '');
      const ttsData = await apiGenerateTTS(cleanText, 'Kore');

      const audio = new Audio(`data:${ttsData.mimeType};base64,${ttsData.audioBase64}`);
      audioPlayerRef.current = audio;

      audio.onended = () => {
        setIsAiSpeaking(false);
        // As soon as AI finishes speaking, immediately arm mic and listen!
        if (autoListenMode) {
          setTimeout(() => {
            startListening();
          }, 250);
        }
      };

      audio.onerror = () => {
        fallbackToWebSpeech(cleanText);
      };

      try {
        await audio.play();
        setAudioAutoplayBlocked(false);
      } catch (playErr: any) {
        if (playErr.name === 'NotAllowedError') {
          console.warn('Autoplay prevented by browser policy until user interacts.');
          setAudioAutoplayBlocked(true);
        } else {
          fallbackToWebSpeech(cleanText);
        }
      }
    } catch (err) {
      console.warn('Gemini TTS fallback to browser speech synthesis:', err);
      fallbackToWebSpeech(text);
    }
  };

  const fallbackToWebSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setIsAiSpeaking(false);
      return;
    }

    try {
      const cleanText = text.replace(/\*\*/g, '').replace(/\*/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        setIsAiSpeaking(false);
        if (autoListenMode) {
          setTimeout(() => {
            startListening();
          }, 250);
        }
      };
      utterance.onerror = () => {
        setIsAiSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setIsAiSpeaking(false);
    }
  };

  // Play audio when a new interviewer message arrives
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender === 'interviewer') {
        playInterviewerAudio(lastMsg.text);
      }
    }
  }, [messages.length]);

  // ------------------------------------------------------------------
  // LIVE AUDIO TRANSCRIPTION & MICROPHONE (Listens to candidate)
  // ------------------------------------------------------------------
  const startMicAudioVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setMicVolume(normalized);
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err) {
      console.warn('Mic visualizer could not be started:', err);
    }
  };

  const stopMicAudioVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setMicVolume(0);
  };

  const startListening = async () => {
    // If AI is speaking, pause AI
    if (isAiSpeaking && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsAiSpeaking(false);
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Step 1: Explicitly request microphone stream to trigger browser prompt
    try {
      if (!mediaStreamRef.current) {
        await startMicAudioVisualizer();
      }
      setMicPermissionDenied(false);
    } catch (err: any) {
      console.warn('Microphone permission error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicPermissionDenied(true);
      }
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage('Speech recognition is not supported in this browser. Please type your answers.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setMicPermissionDenied(false);
      };

      recognition.onresult = (event: any) => {
        // User spoke, so cancel any existing silence timeout!
        cancelSilenceTimer();

        let finalChunk = '';
        let interimChunk = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += transcript + ' ';
          } else {
            interimChunk += transcript;
          }
        }

        let nextBaseText = inputText;
        if (finalChunk) {
          const separator = nextBaseText && !nextBaseText.endsWith(' ') ? ' ' : '';
          nextBaseText = nextBaseText + separator + finalChunk.trim();
          setInputText(nextBaseText);
          setInterimTranscript('');
        } else {
          setInterimTranscript(interimChunk);
        }

        const combined = (nextBaseText + ' ' + interimChunk).trim();
        latestTextRef.current = combined;

        // If user has spoken substantial content, start the 2-second silence countdown!
        if (combined.length >= 8) {
          startSilenceTimer(combined);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error event:', event.error);
        if (event.error === 'not-allowed') {
          setMicPermissionDenied(true);
        }
        setIsListening(false);
        stopMicAudioVisualizer();
      };

      recognition.onend = () => {
        setIsListening(false);
        stopMicAudioVisualizer();

        // If the speech recognition naturally ended and candidate has answer ready
        const current = latestTextRef.current.trim();
        if (autoSendOnSilence && current.length >= 8 && !isLoading) {
          handleSendMessage(current);
        } else if (autoListenMode && !isLoading && !isAiSpeaking) {
          // Keep listening loop active
          setTimeout(() => {
            if (autoListenMode && !isLoading && !isAiSpeaking && !isListening) {
              startListening();
            }
          }, 300);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Failed to start speech recognition:', err);
      setIsListening(false);
      stopMicAudioVisualizer();
    }
  };

  const stopListening = () => {
    cancelSilenceTimer();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
    if (interimTranscript) {
      setInputText((prev) => {
        const separator = prev && !prev.endsWith(' ') ? ' ' : '';
        return prev + separator + interimTranscript;
      });
      setInterimTranscript('');
    }
    setIsListening(false);
    stopMicAudioVisualizer();
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cancelSilenceTimer();
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      stopListening();
    };
  }, []);

  // ------------------------------------------------------------------
  // TURN SUBMISSION (Send Answer)
  // ------------------------------------------------------------------
  const handleSendMessage = async (overrideAnswer?: string) => {
    cancelSilenceTimer();

    let finalAnswer = (overrideAnswer !== undefined ? overrideAnswer : (inputText + ' ' + interimTranscript)).trim();
    if (!finalAnswer || isLoading) return;

    // Stop listening before sending
    stopListening();

    setInputText('');
    setInterimTranscript('');
    latestTextRef.current = '';
    setHintText(null);
    setErrorMessage(null);

    const userMessage: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'candidate',
      text: finalAnswer,
      timestamp: new Date().toISOString(),
      questionIndex: currentQuestionNumber,
      isFollowUp,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const timeRemaining = Math.max(0, totalSeconds - elapsedSeconds);
      const res = await apiSubmitTurn(
        session.config,
        newMessages,
        finalAnswer,
        currentQuestionNumber,
        isFollowUp,
        timeRemaining
      );

      const aiMessage: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'interviewer',
        text: res.message,
        timestamp: new Date().toISOString(),
        questionIndex: res.nextQuestionNumber,
        isFollowUp: res.isFollowUp,
      };

      const updatedHistory = [...newMessages, aiMessage];
      setMessages(updatedHistory);
      setIsFollowUp(res.isFollowUp);
      setCurrentQuestionNumber(res.nextQuestionNumber);

      if (res.isInterviewComplete) {
        setTimeout(() => {
          onConcludeInterview(updatedHistory, elapsedSeconds);
        }, 1500);
      }
    } catch (err: any) {
      console.error('Failed to submit answer:', err);
      setErrorMessage(err.message || 'Network issue encountered. You can retry sending your response.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRequestHint = async () => {
    if (session.config.mode !== 'practice' || isLoadingHint) return;
    setIsLoadingHint(true);
    setHintText(null);

    try {
      const lastInterviewerMsg = [...messages].reverse().find((m) => m.sender === 'interviewer');
      const questionText = lastInterviewerMsg?.text || session.config.subject;
      const res = await apiRequestHint(session.config, questionText);
      setHintText(res.hint);
    } catch (err) {
      setHintText('Consider core architectural invariants and runtime complexity trade-offs.');
    } finally {
      setIsLoadingHint(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const secondsLeft = Math.max(0, totalSeconds - elapsedSeconds);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-neutral-950">
      {/* Top Session Ribbon */}
      <div className="border-b border-neutral-800 bg-neutral-900/90 px-4 sm:px-6 py-2.5 shrink-0">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-3">
          {/* Metadata & Audio Status */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-indigo-500/50 bg-neutral-800 shrink-0">
                <img
                  src="/src/assets/images/interviewer_avatar_1791880648580.jpg"
                  alt="AI Interviewer"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              {isAiSpeaking && (
                <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 border border-neutral-950">
                  <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="font-semibold text-white">{session.config.subject}</span>
                <span aria-hidden="true">·</span>
                <span className="capitalize">{session.config.difficulty}</span>
                <span aria-hidden="true">·</span>
                <span className="text-indigo-400 font-medium capitalize">{session.config.mode} mode</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                <span>{session.config.jobRole ? `Role: ${session.config.jobRole}` : 'General Candidate'}</span>
                {isAiSpeaking && (
                  <span className="text-indigo-400 font-medium flex items-center gap-1">
                    <AudioWaveform className="h-3 w-3 animate-pulse" />
                    <span>Speaking question out loud...</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Controls & Metrics */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Auto-Send on 2s Silence Toggle */}
            <button
              onClick={() => {
                cancelSilenceTimer();
                setAutoSendOnSilence(!autoSendOnSilence);
              }}
              title={autoSendOnSilence ? 'Auto-send on 2s silence is ON' : 'Auto-send on silence is OFF (manual send only)'}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors ${
                autoSendOnSilence
                  ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
              <span>Auto-Send (2s) {autoSendOnSilence ? 'ON' : 'OFF'}</span>
            </button>

            {/* AI Speaker Voice Toggle */}
            <button
              onClick={() => {
                if (ttsEnabled) {
                  if (audioPlayerRef.current) audioPlayerRef.current.pause();
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  setIsAiSpeaking(false);
                }
                setTtsEnabled(!ttsEnabled);
              }}
              title={ttsEnabled ? 'Mute AI voice output' : 'Enable AI voice speaking'}
              className={`p-2 rounded-lg border transition-colors ${
                ttsEnabled
                  ? 'border-indigo-500/50 bg-indigo-600/20 text-indigo-300'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            {/* Question Progress */}
            <div className="text-right">
              <div className="text-[11px] text-neutral-400">Progress</div>
              <div className="text-xs font-bold font-mono text-white tabular-nums">
                Q{Math.min(currentQuestionNumber, session.config.questionCount)} of {session.config.questionCount}
                {isFollowUp && <span className="ml-1 text-indigo-400 font-sans font-normal">(Follow-up)</span>}
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1 text-xs">
              <Clock className="h-3.5 w-3.5 text-neutral-400" />
              <span className={`font-mono tabular-nums font-semibold ${secondsLeft < 120 ? 'text-rose-400' : 'text-neutral-200'}`}>
                {formatTime(secondsLeft)}
              </span>
            </div>

            {/* End Button */}
            <button
              onClick={() => setShowEndModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
            >
              <Square className="h-3 w-3 fill-current" />
              <span className="hidden sm:inline">Conclude</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {messages.map((msg, index) => {
            const isAI = msg.sender === 'interviewer';
            const isLatestAiMessage = isAI && index === messages.length - 1;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="h-9 w-9 rounded-full overflow-hidden border border-neutral-700 bg-neutral-800 shrink-0 mt-1">
                    <img
                      src="/src/assets/images/interviewer_avatar_1791880648580.jpg"
                      alt="Interviewer"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 space-y-2 text-sm leading-relaxed ${
                    isAI
                      ? 'border border-neutral-800 bg-neutral-900/90 text-neutral-100 shadow-sm'
                      : 'border border-indigo-500/40 bg-indigo-950/40 text-neutral-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[11px] text-neutral-400 border-b border-neutral-800/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-300">
                        {isAI ? 'Interviewer' : 'You (Candidate)'}
                      </span>
                      {isAI && isLatestAiMessage && isAiSpeaking && (
                        <span className="text-[10px] text-indigo-400 font-medium animate-pulse flex items-center gap-1">
                          <Radio className="h-3 w-3" />
                          <span>Speaking out loud</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isAI && (
                        <button
                          onClick={() => playInterviewerAudio(msg.text)}
                          title="Replay question audio through speakers"
                          className="hover:text-indigo-400 transition-colors p-0.5 rounded"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <span className="font-mono tabular-nums">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="whitespace-pre-wrap leading-relaxed text-[13.5px] sm:text-sm">
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 sm:gap-4 items-start">
              <div className="h-9 w-9 rounded-full overflow-hidden border border-neutral-700 bg-neutral-800 shrink-0 mt-1">
                <img
                  src="/src/assets/images/interviewer_avatar_1791880648580.jpg"
                  alt="Interviewer"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-4 text-xs text-neutral-400 flex items-center gap-2.5">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>Analyzing response & preparing next question...</span>
              </div>
            </div>
          )}

          {/* Practice Mode Hint */}
          {hintText && (
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-4 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-indigo-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Coach Hint (Practice Mode)</span>
                </span>
                <button onClick={() => setHintText(null)} className="text-neutral-400 hover:text-white text-[11px]">
                  Dismiss
                </button>
              </div>
              <p className="text-neutral-200 leading-relaxed">{hintText}</p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-950/20 p-4 text-xs text-rose-300 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
              <button onClick={() => handleSendMessage()} className="inline-flex items-center gap-1 text-xs font-semibold underline hover:text-white">
                <RotateCcw className="h-3 w-3" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Microphone Permission Help Banner */}
          {micPermissionDenied && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-4 text-xs text-amber-200 space-y-3 shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>Microphone Permission Needed for Voice Answers</span>
                </div>
                <button
                  onClick={() => setMicPermissionDenied(false)}
                  className="text-neutral-400 hover:text-white text-[11px]"
                >
                  Dismiss
                </button>
              </div>

              <div className="text-[12px] text-neutral-300 space-y-1 leading-relaxed pl-6">
                <div>Your browser blocked microphone access for this page. To enable voice answers:</div>
                <div className="font-medium text-white">
                  1. Click the <strong>lock 🔒</strong> or <strong>camera/mic icon</strong> in your browser's address bar.
                </div>
                <div className="font-medium text-white">
                  2. Set <strong>Microphone</strong> to <strong>Allow</strong>.
                </div>
                <div className="font-medium text-white">
                  3. Click the button below to start dictating your answer.
                </div>
              </div>

              <div className="flex items-center gap-3 pl-6 pt-1">
                <button
                  type="button"
                  onClick={startListening}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                >
                  <Mic className="h-3.5 w-3.5" />
                  <span>Try Microphone Again</span>
                </button>
                <span className="text-[11px] text-neutral-400">
                  (You can also type your answers in the box below)
                </span>
              </div>
            </div>
          )}

          {/* Browser Autoplay Blocked Banner */}
          {audioAutoplayBlocked && (
            <div className="rounded-xl border border-indigo-500/40 bg-indigo-950/40 p-3.5 text-xs text-indigo-200 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>Interviewer voice is ready! Click to enable speaker playback.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAudioAutoplayBlocked(false);
                  const lastMsg = [...messages].reverse().find((m) => m.sender === 'interviewer');
                  if (lastMsg) playInterviewerAudio(lastMsg.text);
                }}
                className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shrink-0"
              >
                Play Audio Now
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Answer Input Dock with Live Audio Transcribing & Waveform */}
      <div className="border-t border-neutral-800 bg-neutral-900/90 p-4 shrink-0">
        <div className="mx-auto max-w-4xl space-y-2">
          {/* Audio Visualizer & Silence Auto-Submit Countdown Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400 px-1">
            <div className="flex items-center gap-2.5">
              {isListening ? (
                <div className="flex items-center gap-2 text-rose-400 font-semibold">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                  </span>
                  <span>Listening... Speak your answer</span>

                  {/* Real-time Sound Wave Bars based on actual mic volume */}
                  <div className="flex items-center gap-0.5 ml-2 h-4">
                    {[1, 2, 3, 4, 5, 6].map((bar) => {
                      const heightPx = Math.max(4, Math.min(16, (micVolume * (bar % 2 === 0 ? 1.2 : 0.8)) / 6));
                      return (
                        <div
                          key={bar}
                          className="w-1 bg-rose-500 rounded-full transition-all duration-75"
                          style={{ height: `${heightPx}px` }}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : isAiSpeaking ? (
                <div className="flex items-center gap-2 text-indigo-400 font-medium">
                  <Volume2 className="h-3.5 w-3.5 animate-pulse" />
                  <span>Interviewer is reading the question through your speakers...</span>
                </div>
              ) : (
                <span className="text-[11px] text-neutral-400">
                  Ready. Click Dictate Voice or type your response below.
                </span>
              )}
            </div>

            {/* 2-Second Silence Auto-Send Notification Indicator */}
            {silenceCountdownMs !== null && silenceCountdownMs > 0 && (
              <div className="flex items-center gap-2 rounded-full bg-emerald-950/80 border border-emerald-500/50 px-3 py-1 text-xs text-emerald-300 animate-pulse shadow-sm">
                <Zap className="h-3 w-3 text-emerald-400" />
                <span>
                  Silence detected: sending in <strong>{(silenceCountdownMs / 1000).toFixed(1)}s</strong>...
                </span>
                <button
                  type="button"
                  onClick={cancelSilenceTimer}
                  className="ml-1 text-[11px] underline text-neutral-300 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            )}

            {session.config.mode === 'practice' && (
              <button
                type="button"
                onClick={handleRequestHint}
                disabled={isLoadingHint || isLoading}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>{isLoadingHint ? 'Generating Hint...' : 'Request Hint'}</span>
              </button>
            )}
          </div>

          {/* Textarea Dock with Interim Live Audio Text */}
          <div className="relative rounded-xl border border-neutral-700 bg-neutral-950 p-2.5 focus-within:border-indigo-500 transition-colors shadow-inner">
            <textarea
              ref={textareaRef}
              rows={3}
              value={inputText}
              onChange={(e) => {
                cancelSilenceTimer();
                setInputText(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder={
                isListening
                  ? 'Listening to you... Speak your answer naturally. When you finish speaking and pause for 2s, it will automatically submit.'
                  : 'Type or speak your answer here... (Auto-sends after 2s of silence, or press Enter)'
              }
              className="w-full resize-none bg-transparent px-2 py-1 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none"
            />

            {/* Interim live speech stream pill if currently speaking */}
            {interimTranscript && (
              <div className="mx-2 mb-2 px-2.5 py-1 rounded bg-neutral-900 border border-indigo-500/30 text-xs text-indigo-300 flex items-center gap-2">
                <span className="font-mono text-[10px] text-neutral-400 uppercase">Live voice stream:</span>
                <span className="italic">{interimTranscript}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-neutral-850 px-1">
              <div className="flex items-center gap-2.5">
                {/* Live Microphone Toggle */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shadow-sm ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-neutral-850 text-neutral-300 hover:text-white hover:bg-neutral-800 border border-neutral-750'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-3.5 w-3.5 text-white" />
                      <span>Stop Mic</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Dictate Voice</span>
                    </>
                  )}
                </button>

                {/* Speaker Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    if (ttsEnabled && audioPlayerRef.current) {
                      audioPlayerRef.current.pause();
                      setIsAiSpeaking(false);
                    }
                    setTtsEnabled(!ttsEnabled);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-colors ${
                    ttsEnabled
                      ? 'border-indigo-500/40 text-indigo-300 bg-indigo-950/30'
                      : 'border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {ttsEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                  <span>Speaker {ttsEnabled ? 'On' : 'Muted'}</span>
                </button>

                <span className="text-[11px] text-neutral-400 hidden md:inline">
                  {autoSendOnSilence ? 'Auto-sends 2s after you stop speaking' : 'Press Enter to send'}
                </span>
              </div>

              {/* Submit Answer */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={(!inputText.trim() && !interimTranscript.trim()) || isLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 transition-colors shadow-sm"
              >
                <span>Send Answer</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Concluding Early */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Conclude Interview Now?</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              You have answered {messages.filter((m) => m.sender === 'candidate').length} questions so far. Concluding will finish the session and generate your objective evaluation report based on your responses up to this point.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setShowEndModal(false)}
                className="rounded-lg bg-neutral-800 hover:bg-neutral-750 px-4 py-2 text-xs font-medium text-neutral-300"
              >
                Continue Interview
              </button>
              <button
                onClick={() => {
                  stopListening();
                  setShowEndModal(false);
                  onConcludeInterview(messages, elapsedSeconds);
                }}
                className="rounded-lg bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-sm"
              >
                Conclude & Evaluate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
