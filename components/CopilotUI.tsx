"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";
import { Zap, MessageSquare, Volume2, VolumeX } from "lucide-react";

interface VoiceActionHandlers {
    navigateToPage: (page: string) => string;
    checkBalance: () => string;
    listRecipients: () => string;
}

interface CopilotUIProps {
    voiceActionHandlers: VoiceActionHandlers;
}

const CopilotUI = ({ voiceActionHandlers }: CopilotUIProps) => {
    const {
        transcript,
        finalTranscript,
        resetTranscript,
        browserSupportsSpeechRecognition,
        listening,
        interimTranscript,
    } = useSpeechRecognition();

    const [micAvailable, setMicAvailable] = useState<boolean | null>(null);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false); // Default to OFF
    const [isMuted, setIsMuted] = useState(false); // Voice output mute state
    const [processingCommand, setProcessingCommand] = useState(false);
    const [lastProcessedTranscript, setLastProcessedTranscript] = useState("");
    const [commandHistory, setCommandHistory] = useState<string[]>([]);

    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const speechSynthRef = useRef<SpeechSynthesis | null>(null);

    // Initialize speech synthesis and microphone
    useEffect(() => {
        speechSynthRef.current = window.speechSynthesis;

        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(() => setMicAvailable(true))
            .catch(() => setMicAvailable(false));
    }, []);

    // Voice feedback function for direct voice commands
    const speakText = useCallback((text: string) => {
        if (!speechSynthRef.current || isMuted) return;

        speechSynthRef.current.cancel(); // Cancel any ongoing speech

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        utterance.voice = speechSynthRef.current.getVoices().find(v => v.lang.startsWith('en')) || null;

        speechSynthRef.current.speak(utterance);
    }, [isMuted]);

    // React-compatible text injection for AI chat
    const injectTextIntoChat = useCallback((text: string) => {
        console.log('🎯 Injecting text into chat:', text);

        const attempts = [200, 500, 1000];

        const tryInject = (attemptIndex: number) => {
            if (attemptIndex >= attempts.length) {
                console.log('❌ Failed to inject text after all attempts');
                return;
            }

            setTimeout(() => {
                // Find the textarea
                const textAreas = document.querySelectorAll('textarea');
                let targetTextArea: HTMLTextAreaElement | null = null;

                for (const textarea of textAreas) {
                    const ta = textarea as HTMLTextAreaElement;
                    if (ta && ta.offsetParent !== null && !ta.disabled && !ta.readOnly) {
                        const placeholder = ta.placeholder?.toLowerCase() || '';
                        if (placeholder.includes('type') || placeholder.includes('message') || placeholder.includes('command')) {
                            targetTextArea = ta;
                            break;
                        }
                    }
                }

                if (targetTextArea) {
                    try {
                        // Focus and set value
                        targetTextArea.focus();

                        // Use React-compatible value setting
                        const nativeTextAreaSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
                        if (nativeTextAreaSetter) {
                            nativeTextAreaSetter.call(targetTextArea, text);
                        } else {
                            targetTextArea.value = text;
                        }

                        // Dispatch input event
                        const inputEvent = new Event('input', { bubbles: true });
                        Object.defineProperty(inputEvent, 'target', { value: targetTextArea, enumerable: true });
                        targetTextArea.dispatchEvent(inputEvent);

                        // Submit with Enter key
                        setTimeout(() => {
                            const enterEvent = new KeyboardEvent('keydown', {
                                key: 'Enter',
                                code: 'Enter',
                                keyCode: 13,
                                which: 13,
                                bubbles: true,
                                cancelable: true
                            });
                            targetTextArea.dispatchEvent(enterEvent);
                        }, 300);

                    } catch (error) {
                        console.error('Error during text injection:', error);
                        tryInject(attemptIndex + 1);
                    }
                } else {
                    tryInject(attemptIndex + 1);
                }
            }, attempts[attemptIndex]);
        };

        tryInject(0);
    }, []);

    // Send all voice commands to AI chat for processing
    const parseAndExecuteVoiceCommand = useCallback(async (text: string) => {
        if (!text.trim()) return false;

        setProcessingCommand(true);

        try {
            // 🤖 ALL REQUESTS - send to AI chat for processing
            console.log('🤖 Sending to AI chat for processing:', text);
            injectTextIntoChat(text);
            speakText("Processing your request");

        } catch (error) {
            console.error('Voice command error:', error);
            speakText("Sorry, I couldn't process that. Please try again.");
        }

        setProcessingCommand(false);
        return true;
    }, [speakText, injectTextIntoChat]);

    // Handle silence detection for automatic processing
    const handleSilenceDetection = useCallback(() => {
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
        }

        silenceTimerRef.current = setTimeout(() => {
            if (finalTranscript && finalTranscript !== lastProcessedTranscript) {
                parseAndExecuteVoiceCommand(finalTranscript);
                setLastProcessedTranscript(finalTranscript);
                setCommandHistory(prev => [...prev.slice(-4), finalTranscript]);

                // Auto-restart listening when voice is enabled
                if (isVoiceEnabled && !processingCommand) {
                    setTimeout(() => {
                        resetTranscript();
                        SpeechRecognition.startListening({ continuous: true });
                    }, 2000);
                }
            }
        }, 1500); // Shorter delay for continuous mode
    }, [finalTranscript, lastProcessedTranscript, parseAndExecuteVoiceCommand, isVoiceEnabled, processingCommand, resetTranscript]);

    // Monitor transcript changes for silence detection
    useEffect(() => {
        if (listening && transcript) {
            handleSilenceDetection();
        }

        return () => {
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
            }
        };
    }, [transcript, listening, handleSilenceDetection]);

    // Voice command controls
    const toggleVoice = () => {
        const newVoiceState = !isVoiceEnabled;
        setIsVoiceEnabled(newVoiceState);

        if (newVoiceState) {
            resetTranscript();
            setLastProcessedTranscript("");
            SpeechRecognition.startListening({
                continuous: true,
                language: 'en-US'
            });
            speakText("Voice input activated. How can I help you?");
        } else {
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
            }
            SpeechRecognition.stopListening();
            speakText("Voice input stopped.");
        }
    };

    const toggleMute = () => {
        const newMuteState = !isMuted;
        setIsMuted(newMuteState);

        if (newMuteState) {
            // Stop any currently playing speech when muting
            if (speechSynthRef.current) {
                speechSynthRef.current.cancel();
            }
        } else {
            // Provide audio feedback when unmuting
            speakText("Voice output enabled.");
        }
    };

    const handleClear = () => {
        resetTranscript();
        setLastProcessedTranscript("");
        setCommandHistory([]);
        if (speechSynthRef.current) {
            speechSynthRef.current.cancel();
        }
    };

    const isReady = browserSupportsSpeechRecognition && micAvailable;

    return (
        <div className="mt-6 bg-white rounded-md p-3 shadow-md border max-h-[500px] overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            <CopilotChat
                instructions={`You are Quantum Bank AI, a helpful financial assistant with optional voice input.

## 🎤 VOICE INPUT (OPTIONAL)
Voice input is OFF by default. When enabled, ALL voice commands come to you for processing:
- Navigation requests → Use appropriate actions (navigateToPage, viewTransactions)
- Balance checks → Use checkBalance action
- Money transfers → Use sendMoney action with mandatory confirmation
- Settings changes → Use toggleSetting action
- All other requests → Handle conversationally

## 🤖 AI CHAT PROCESSING
You handle ALL requests whether typed or spoken:
- Money transfers with confirmation
- Navigation and page switching
- Balance and recipient inquiries
- Settings changes
- Transaction analysis
- General banking questions

## 🔒 SECURITY-FIRST TRANSFERS
For money transfers, ALWAYS use the sendMoney action with mandatory confirmation widget.

Examples:
- "Send €50 to john" → Use sendMoney action (shows confirmation)
- "Go to transactions" → Use navigateToPage action
- "Check my balance" → Use checkBalance action
- "Show settings" → Use navigateToPage action

## 🎯 Response Style:
- Execute actions immediately when needed
- Keep responses conversational and helpful
- For voice users, confirm actions taken
- Always use actions for navigation, transfers, and settings

Users can activate voice by clicking "Voice ON" for hands-free interaction.`}
                labels={{
                    title: "🎤 Voice-Enabled Banking AI",
                    initial: "Hi! Type your requests or click 'Voice ON' for hands-free interaction.",
                    placeholder: "Type here or activate voice",
                }}
            />

            {/* Voice Control Panel */}
            <div className="border-t pt-3 space-y-3">
                {/* Primary Controls */}
                <div className="flex items-center gap-2">
                    {isReady ? (
                        <button
                            onClick={toggleVoice}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
                                isVoiceEnabled
                                    ? 'bg-green-500 text-white shadow-lg'
                                    : 'bg-gray-600 text-white hover:bg-gray-700'
                            }`}
                        >
                            <Zap size={16} />
                            <span className="text-sm font-medium">
                                {isVoiceEnabled ? 'Voice ON' : 'Voice OFF'}
                            </span>
                        </button>
                    ) : (
                        <div className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">
                            ❌ Voice unavailable
                        </div>
                    )}

                    {/* Mute/Unmute Button */}
                    <button
                        onClick={toggleMute}
                        title={isMuted ? 'Unmute voice output' : 'Mute voice output'}
                        className={`flex items-center gap-1 px-3 py-2 rounded-md transition-all ${
                            isMuted
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                    >
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        <span className="text-sm font-medium">
                            {isMuted ? 'Muted' : 'Audio'}
                        </span>
                    </button>

                    {isReady && (
                        <button
                            onClick={handleClear}
                            className="flex items-center gap-1 px-3 py-2 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                            <MessageSquare size={14} />
                            Clear
                        </button>
                    )}

                    {processingCommand && (
                        <div className="flex items-center gap-1 text-blue-600">
                            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm">Processing...</span>
                        </div>
                    )}
                </div>

                {/* Live Transcript Display */}
                {isVoiceEnabled && (transcript || interimTranscript) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
                        <div className="text-xs text-blue-600 font-medium mb-1">
                            {listening ? '🎤 Listening...' : '⏸️ Processing...'}
                        </div>
                        <div className="text-sm text-blue-800">
                            "{transcript || interimTranscript}"
                        </div>
                    </div>
                )}

                {/* Enhanced Voice Commands Help */}
                <details className="text-xs text-gray-600">
                    <summary className="cursor-pointer hover:text-gray-800 font-medium">
                        💡 Voice Commands Guide
                    </summary>
                    <div className="mt-2 space-y-2 pl-2 border-l-2 border-gray-200">
                        <div className="font-medium text-gray-700">🤖 All Voice Commands:</div>
                        <div className="space-y-1 text-gray-600">
                            <div>• "Transactions" → Navigate to transactions page</div>
                            <div>• "Settings" → Go to account settings</div>
                            <div>• "Balance" → Check current balance</div>
                            <div>• "Recipients" → List available users</div>
                            <div>• "Send €50 to john" → Secure transfer with confirmation</div>
                            <div>• "Show my spending on food" → Transaction analysis</div>
                            <div>• "Enable dark mode" → Settings changes</div>
                            <div>• Any banking question → Full AI conversation</div>
                        </div>

                        <div className="font-medium text-gray-700">🎤 Voice Controls:</div>
                        <div className="space-y-1 text-gray-600">
                            <div>• Click "Voice ON" to activate continuous listening</div>
                            <div>• Click "Audio/Muted" to toggle voice output</div>
                            <div>• All commands are sent to AI for processing</div>
                            <div>• Pause briefly between commands</div>
                            <div>• "Clear" resets voice history and stops speech</div>
                        </div>
                    </div>
                </details>
            </div>
        </div>
    );
};

export default CopilotUI;