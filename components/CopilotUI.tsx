"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";
import { Volume2, VolumeX, Zap, MessageSquare } from "lucide-react";

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
    const [aiResponseTTS, setAiResponseTTS] = useState(true); // TTS for AI responses
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
        if (!speechSynthRef.current) return;

        speechSynthRef.current.cancel(); // Cancel any ongoing speech

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        utterance.voice = speechSynthRef.current.getVoices().find(v => v.lang.startsWith('en')) || null;

        speechSynthRef.current.speak(utterance);
    }, []);

    // Text-to-speech for AI responses
    const speakAIResponse = useCallback((text: string) => {
        if (!aiResponseTTS || !speechSynthRef.current) return;

        // Clean up the text (remove markdown, etc.)
        const cleanText = text
            .replace(/[#*_`]/g, '') // Remove markdown
            .replace(/\n+/g, ' ') // Replace newlines with spaces
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();

        if (!cleanText) return;

        speechSynthRef.current.cancel(); // Cancel any ongoing speech

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.7; // Slightly quieter for AI responses
        utterance.voice = speechSynthRef.current.getVoices().find(v => v.lang.startsWith('en')) || null;

        speechSynthRef.current.speak(utterance);
    }, [aiResponseTTS]);

    // Monitor for new AI messages and read them aloud
    useEffect(() => {
        if (!aiResponseTTS) return;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node as Element;

                        // Look for new AI messages in CopilotKit chat
                        const aiMessages = element.querySelectorAll('[data-role="assistant"], .copilot-message, .ai-message');
                        aiMessages.forEach((message) => {
                            const textContent = message.textContent?.trim();
                            if (textContent && textContent.length > 0) {
                                // Small delay to ensure the message is fully rendered
                                setTimeout(() => speakAIResponse(textContent), 500);
                            }
                        });

                        // Also check if the node itself is an AI message
                        if (element.textContent &&
                            (element.getAttribute('data-role') === 'assistant' ||
                                element.classList.contains('copilot-message') ||
                                element.classList.contains('ai-message'))) {
                            setTimeout(() => speakAIResponse(element.textContent!), 500);
                        }
                    }
                });
            });
        });

        // Start observing the document for changes
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        return () => observer.disconnect();
    }, [aiResponseTTS, speakAIResponse]);

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

    const toggleAIResponseTTS = () => {
        const newSetting = !aiResponseTTS;
        setAiResponseTTS(newSetting);

        if (newSetting) {
            speakText("AI response audio enabled.");
        } else {
            speakText("AI response audio disabled.");
            // Cancel any ongoing speech
            if (speechSynthRef.current) {
                speechSynthRef.current.cancel();
            }
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
Voice input is OFF by default. When enabled:
- Simple commands → Handled directly (navigation, balance checks)
- Complex requests → Come to you for intelligent processing
- AI responses can be read aloud automatically

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

Users can activate voice by clicking "Voice ON" for hands-free interaction.`}
                labels={{
                    title: "🎤 Voice-Optional Banking AI",
                    initial: "Hi! Type your requests or click 'Voice ON' for hands-free interaction.",
                    placeholder: "Type here or activate voice for hands-free commands...",
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
                </div>

                {/* Secondary Controls */}
                {isReady && (
                    <div className="flex items-center gap-2 text-sm">
                        <button
                            onClick={toggleAIResponseTTS}
                            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                                aiResponseTTS
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-600'
                            }`}
                        >
                            {aiResponseTTS ? <Volume2 size={14} /> : <VolumeX size={14} />}
                            AI Audio
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

                        <div className="font-medium text-gray-700">🎤 Voice Controls:</div>
                        <div className="space-y-1 text-gray-600">
                            <div>• Click "Voice ON" to activate continuous listening</div>
                            <div>• Pause briefly between commands</div>
                            <div>• "AI Audio" reads AI responses aloud</div>
                        </div>
                    </div>
                </details>
            </div>
        </div>
    );
};

export default CopilotUI;