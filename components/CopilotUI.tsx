"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";
import { Mic, MicOff, Volume2, VolumeX, Zap, MessageSquare } from "lucide-react";

const CopilotUI = () => {
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

    // React-compatible text injection that properly updates component state
    const injectTextIntoChat = useCallback((text: string) => {
        console.log('🎯 Attempting to inject text:', text);

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
                            console.log('✅ Found chat textarea:', ta);
                            break;
                        }
                    }
                }

                if (targetTextArea) {
                    try {
                        // Focus first
                        targetTextArea.focus();

                        // Get React's internal instance to update state properly
                        const reactFiber = (targetTextArea as any)._reactInternalFiber ||
                            (targetTextArea as any)._reactInternalInstance ||
                            Object.keys(targetTextArea).find(key => key.startsWith('__reactInternalInstance')) ||
                            Object.keys(targetTextArea).find(key => key.startsWith('__reactFiber'));

                        // Method 1: Use React's value setter
                        const nativeTextAreaSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
                        if (nativeTextAreaSetter) {
                            nativeTextAreaSetter.call(targetTextArea, text);
                        } else {
                            targetTextArea.value = text;
                        }

                        // Method 2: Create proper React synthetic event
                        const inputEvent = new Event('input', { bubbles: true });
                        Object.defineProperty(inputEvent, 'target', { value: targetTextArea, enumerable: true });
                        Object.defineProperty(inputEvent, 'currentTarget', { value: targetTextArea, enumerable: true });

                        // Dispatch multiple events to ensure React catches it
                        targetTextArea.dispatchEvent(inputEvent);

                        // Also try change event
                        const changeEvent = new Event('change', { bubbles: true });
                        Object.defineProperty(changeEvent, 'target', { value: targetTextArea, enumerable: true });
                        targetTextArea.dispatchEvent(changeEvent);

                        console.log('✅ Text set with React-compatible events');

                        // Wait a bit for React to process, then submit
                        setTimeout(() => {
                            // Method 1: Try keyboard Enter (most reliable for forms)
                            const enterKeyDown = new KeyboardEvent('keydown', {
                                key: 'Enter',
                                code: 'Enter',
                                keyCode: 13,
                                which: 13,
                                bubbles: true,
                                cancelable: true
                            });

                            const enterKeyPress = new KeyboardEvent('keypress', {
                                key: 'Enter',
                                code: 'Enter',
                                keyCode: 13,
                                which: 13,
                                bubbles: true,
                                cancelable: true
                            });

                            console.log('⌨️ Sending Enter key events');
                            targetTextArea.dispatchEvent(enterKeyDown);
                            targetTextArea.dispatchEvent(enterKeyPress);

                            // Method 2: Also try clicking submit button as backup
                            setTimeout(() => {
                                const buttons = document.querySelectorAll('button');
                                for (const button of buttons) {
                                    const btn = button as HTMLButtonElement;
                                    const buttonText = btn.textContent?.toLowerCase() || '';
                                    const buttonHTML = btn.innerHTML?.toLowerCase() || '';

                                    if (!btn.disabled &&
                                        (btn.type === 'submit' ||
                                            buttonText.includes('send') ||
                                            buttonHTML.includes('arrow') ||
                                            buttonHTML.includes('svg'))) {
                                        console.log('🖱️ Clicking submit button as backup');
                                        btn.click();
                                        break;
                                    }
                                }
                            }, 100);

                        }, 500); // Wait longer for React to process the input

                    } catch (error) {
                        console.error('❌ Error during text injection:', error);
                        tryInject(attemptIndex + 1);
                    }
                } else {
                    console.log(`❌ No suitable textarea found, attempt ${attemptIndex + 1}/${attempts.length}`);
                    tryInject(attemptIndex + 1);
                }
            }, attempts[attemptIndex]);
        };

        tryInject(0);
    }, []);

    // Submit ALL voice input directly to chat without filtering
    const parseAndExecuteVoiceCommand = useCallback(async (text: string) => {
        if (text.trim()) {
            setProcessingCommand(true);

            try {
                // Submit ANY voice input directly to chat
                injectTextIntoChat(text.trim());
                speakText(`Processing: ${text}`);
                console.log('✅ Voice input submitted directly:', text);

            } catch (error) {
                console.error('Voice input error:', error);
                const errorMsg = "Sorry, I couldn't process that. Please try again.";
                speakText(errorMsg);
            }

            setProcessingCommand(false);
            return true;
        }

        return false;
    }, [speakText, injectTextIntoChat]);

    // Handle silence detection for automatic processing
    const handleSilenceDetection = useCallback(() => {
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
        }

        silenceTimerRef.current = setTimeout(() => {
            if (finalTranscript && finalTranscript !== lastProcessedTranscript) {
                // Submit ALL voice input directly to chat
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
        }, isHandsFreeMode ? 1500 : 3000); // Shorter delay in hands-free mode
    }, [finalTranscript, lastProcessedTranscript, parseAndExecuteVoiceCommand, isHandsFreeMode, processingCommand, injectTextIntoChat, speakText, resetTranscript]);

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

## 🎤 CRITICAL: USE ACTIONS, DON'T GIVE INSTRUCTIONS

### MANDATORY ACTION USAGE:
When users ask for navigation, you MUST use the "navigateToPage" action. DO NOT provide route instructions.

**Navigation Requests - USE navigateToPage ACTION:**
- "show me transactions" → CALL navigateToPage with page: "transactions"
- "go to transactions" → CALL navigateToPage with page: "transactions"  
- "show settings" → CALL navigateToPage with page: "settings"
- "go to dashboard" → CALL navigateToPage with page: "dashboard"

**Balance Requests - USE checkBalance ACTION:**
- "check my balance" → CALL checkBalance action

**Transfer Requests - USE sendMoney ACTION:**
- "send €50 to john" → CALL sendMoney action

**Settings - USE toggleSetting ACTION:**
- "enable dark mode" → CALL toggleSetting action

### 🚫 NEVER DO THIS:
- Don't say "Please navigate to..." 
- Don't provide route instructions like "/transactions"
- Don't explain how to navigate manually

### ✅ ALWAYS DO THIS:
- Execute the appropriate action immediately
- Confirm what action was taken
- Let the action handle the actual work

### 🔒 SECURITY-FIRST TRANSFERS
ALL money transfers require confirmation via in-chat widget.

### 🎯 Response Style:
- Execute actions immediately
- Keep responses short and action-focused
- Confirm what you're doing: "Navigating to transactions..." then use the action

You are a DO-ER, not an instructor. Use the available actions to fulfill requests directly.`}
                labels={{
                    title: "🎤 Action-Powered Banking AI",
                    initial: "Hi! I'll execute actions for you. Try 'show me my transactions' or 'check my balance'.",
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

                {/* Voice Commands Help */}
                <details className="text-xs text-gray-600">
                    <summary className="cursor-pointer hover:text-gray-800 font-medium">
                        💡 Voice Input
                    </summary>
                    <div className="mt-2 space-y-1 pl-2 border-l-2 border-gray-200">
                        <div>• Speak naturally - all input goes to AI chat</div>
                        <div>• "Send €50 to john" - Money transfers</div>
                        <div>• "Check my balance" - Account info</div>
                        <div>• "Go to transactions" - Navigation</div>
                        <div>• "Enable dark mode" - Settings</div>
                        <div>• Or any other banking question!</div>
                    </div>
                </details>
            </div>
        </div>
    );
};

export default CopilotUI;