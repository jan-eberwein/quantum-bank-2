"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";
import { Mic, MicOff, Volume2, VolumeX, Zap, MessageSquare } from "lucide-react";

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
    const [isHandsFreeMode, setIsHandsFreeMode] = useState(false);
    const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState(true);
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

    // Voice feedback function
    const speakText = useCallback((text: string) => {
        if (!voiceFeedbackEnabled || !speechSynthRef.current) return;

        speechSynthRef.current.cancel(); // Cancel any ongoing speech

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        utterance.voice = speechSynthRef.current.getVoices().find(v => v.lang.startsWith('en')) || null;

        speechSynthRef.current.speak(utterance);
    }, [voiceFeedbackEnabled]);

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

    // Smart voice command router - decides between direct action vs AI chat
    const parseAndExecuteVoiceCommand = useCallback(async (text: string) => {
        if (!text.trim()) return false;

        setProcessingCommand(true);
        const cleanText = text.trim().toLowerCase();

        try {
            // 🎯 DIRECT ACTION PATTERNS - for reliable simple commands
            const directActionPatterns = [
                // Navigation commands
                {
                    patterns: [
                        /^(go to|show|open|navigate to)\s*(transactions?|transaction)$/i,
                        /^transactions?$/i,
                        /^show\s*transactions?$/i
                    ],
                    action: () => {
                        const response = voiceActionHandlers.navigateToPage('transactions');
                        speakText(response);
                        return true;
                    }
                },
                {
                    patterns: [
                        /^(go to|show|open|navigate to)\s*settings?$/i,
                        /^settings?$/i,
                        /^account\s*settings?$/i
                    ],
                    action: () => {
                        const response = voiceActionHandlers.navigateToPage('settings');
                        speakText(response);
                        return true;
                    }
                },
                {
                    patterns: [
                        /^(go to|show|open|navigate to)\s*(dashboard|home|start)$/i,
                        /^(dashboard|home)$/i
                    ],
                    action: () => {
                        const response = voiceActionHandlers.navigateToPage('dashboard');
                        speakText(response);
                        return true;
                    }
                },
                // Balance commands
                {
                    patterns: [
                        /^(check|what('s)?|show)\s*(my\s*)?(balance|account\s*balance)$/i,
                        /^balance$/i,
                        /^how\s*much\s*money\s*do\s*i\s*have$/i
                    ],
                    action: () => {
                        const response = voiceActionHandlers.checkBalance();
                        speakText(response);
                        return true;
                    }
                },
                // Quick recipient list
                {
                    patterns: [
                        /^(who can i send money to|list recipients|show recipients)$/i,
                        /^recipients$/i
                    ],
                    action: () => {
                        const response = voiceActionHandlers.listRecipients();
                        speakText(response);
                        return true;
                    }
                }
            ];

            // Check for direct action patterns first
            for (const { patterns, action } of directActionPatterns) {
                if (patterns.some(pattern => pattern.test(cleanText))) {
                    console.log('✅ Direct action triggered for:', cleanText);
                    action();
                    setProcessingCommand(false);
                    return true;
                }
            }

            // 🤖 COMPLEX REQUESTS - send to AI chat for processing
            console.log('🤖 Sending to AI chat for processing:', text);
            injectTextIntoChat(text);
            speakText("Processing your request");

        } catch (error) {
            console.error('Voice command error:', error);
            speakText("Sorry, I couldn't process that. Please try again.");
        }

        setProcessingCommand(false);
        return true;
    }, [voiceActionHandlers, speakText, injectTextIntoChat]);

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

                // Auto-restart listening in hands-free mode
                if (isHandsFreeMode && !processingCommand) {
                    setTimeout(() => {
                        resetTranscript();
                        SpeechRecognition.startListening({ continuous: true });
                    }, 2000);
                }
            }
        }, isHandsFreeMode ? 1500 : 3000);
    }, [finalTranscript, lastProcessedTranscript, parseAndExecuteVoiceCommand, isHandsFreeMode, processingCommand, resetTranscript]);

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
    const handleStartListening = () => {
        resetTranscript();
        setLastProcessedTranscript("");
        SpeechRecognition.startListening({
            continuous: true,
            language: 'en-US'
        });

        if (voiceFeedbackEnabled) {
            speakText("Voice input activated. How can I help you?");
        }
    };

    const handleStopListening = () => {
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
        }
        SpeechRecognition.stopListening();

        if (voiceFeedbackEnabled) {
            speakText("Voice input stopped.");
        }
    };

    const toggleHandsFreeMode = () => {
        const newMode = !isHandsFreeMode;
        setIsHandsFreeMode(newMode);

        if (newMode) {
            speakText("Hands-free mode activated. I'll listen continuously and auto-execute commands.");
            handleStartListening();
        } else {
            speakText("Hands-free mode deactivated.");
            handleStopListening();
        }
    };

    const toggleVoiceFeedback = () => {
        const newSetting = !voiceFeedbackEnabled;
        setVoiceFeedbackEnabled(newSetting);

        if (newSetting) {
            speakText("Voice feedback enabled.");
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
                instructions={`You are Quantum Bank AI, a helpful financial assistant with seamless voice input integration.

## 🎤 SMART VOICE ROUTING
The voice system automatically handles simple commands directly:
- Navigation ("go to transactions") → Direct routing
- Balance checks ("check my balance") → Instant response  
- Quick lists ("show recipients") → Direct data

## 🤖 AI CHAT PROCESSING
You handle complex requests that need conversation:
- Money transfers with confirmation
- Detailed questions about transactions
- Settings changes
- Multi-step operations

## 🔒 SECURITY-FIRST TRANSFERS
For money transfers, ALWAYS use the sendMoney action with mandatory confirmation widget.

Examples:
- "Send €50 to john" → Use sendMoney action (shows confirmation)
- "Transfer money to alice for dinner" → Use sendMoney action 
- "I want to send €25" → Ask for recipient, then use sendMoney

## 🎯 Response Style:
- Execute actions immediately when needed
- Keep responses conversational and helpful
- For voice users, be concise but complete
- Confirm actions taken: "Sending €50 to john - please confirm in the widget"

Remember: You work together with the voice system. Simple commands are handled automatically, complex requests come to you.`}
                labels={{
                    title: "🎤 Smart Voice + AI Banking",
                    initial: "Hi! Use voice for quick commands ('go to transactions') or type complex requests.",
                    placeholder: "Type here or use voice commands...",
                }}
            />

            {/* Voice Control Panel */}
            <div className="border-t pt-3 space-y-3">
                {/* Primary Controls */}
                <div className="flex items-center gap-2">
                    {isReady ? (
                        <>
                            {!isHandsFreeMode ? (
                                <button
                                    onClick={listening ? handleStopListening : handleStartListening}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
                                        listening
                                            ? 'bg-red-500 text-white shadow-lg animate-pulse'
                                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                                    }`}
                                >
                                    {listening ? <MicOff size={16} /> : <Mic size={16} />}
                                    <span className="text-sm font-medium">
                                        {listening ? 'Stop' : 'Voice'}
                                    </span>
                                </button>
                            ) : null}

                            <button
                                onClick={toggleHandsFreeMode}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
                                    isHandsFreeMode
                                        ? 'bg-green-500 text-white shadow-lg'
                                        : 'bg-gray-600 text-white hover:bg-gray-700'
                                }`}
                            >
                                <Zap size={16} />
                                <span className="text-sm font-medium">
                                    {isHandsFreeMode ? 'Hands-Free ON' : 'Hands-Free'}
                                </span>
                            </button>
                        </>
                    ) : (
                        <div className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">
                            ❌ Voice unavailable
                        </div>
                    )}
                </div>

                {/* Secondary Controls */}
                {isReady && (
                    <div className="flex items-center gap-2 text-sm">
                        <button
                            onClick={toggleVoiceFeedback}
                            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                                voiceFeedbackEnabled
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-600'
                            }`}
                        >
                            {voiceFeedbackEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                            Audio
                        </button>

                        <button
                            onClick={handleClear}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                            <MessageSquare size={14} />
                            Clear
                        </button>

                        {processingCommand && (
                            <div className="flex items-center gap-1 text-blue-600">
                                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span>Processing...</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Live Transcript Display */}
                {(listening || isHandsFreeMode) && (transcript || interimTranscript) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
                        <div className="text-xs text-blue-600 font-medium mb-1">
                            {listening ? '🎤 Listening...' : '⏸️ Processing...'}
                        </div>
                        <div className="text-sm text-blue-800">
                            "{transcript || interimTranscript}"
                        </div>
                    </div>
                )}

                {/* Command History */}
                {commandHistory.length > 0 && (
                    <div className="bg-gray-50 rounded-md p-2">
                        <div className="text-xs text-gray-600 font-medium mb-1">Recent Commands:</div>
                        <div className="space-y-1">
                            {commandHistory.slice(-2).map((cmd, idx) => (
                                <div key={idx} className="text-xs text-gray-700 truncate">
                                    "_{cmd}_"
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Enhanced Voice Commands Help */}
                <details className="text-xs text-gray-600">
                    <summary className="cursor-pointer hover:text-gray-800 font-medium">
                        💡 Voice Commands Guide
                    </summary>
                    <div className="mt-2 space-y-2 pl-2 border-l-2 border-gray-200">
                        <div className="font-medium text-gray-700">🚀 Quick Commands (Instant):</div>
                        <div className="space-y-1 text-gray-600">
                            <div>• "Transactions" → Instant navigation</div>
                            <div>• "Settings" → Direct to settings</div>
                            <div>• "Balance" → Immediate balance check</div>
                            <div>• "Recipients" → Quick recipient list</div>
                        </div>

                        <div className="font-medium text-gray-700">🤖 AI Processing:</div>
                        <div className="space-y-1 text-gray-600">
                            <div>• "Send €50 to john" → Secure transfer with confirmation</div>
                            <div>• "Show my spending on food" → Detailed analysis</div>
                            <div>• "Enable dark mode" → Settings changes</div>
                            <div>• Complex questions → Full AI conversation</div>
                        </div>
                    </div>
                </details>
            </div>
        </div>
    );
};

export default CopilotUI;