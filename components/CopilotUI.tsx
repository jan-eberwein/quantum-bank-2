"use client";

import React, { useEffect, useState, useCallback } from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";

const CopilotUI = () => {
    const {
        transcript,
        finalTranscript,
        resetTranscript,
        browserSupportsSpeechRecognition,
        listening,
    } = useSpeechRecognition();

    const [micAvailable, setMicAvailable] = useState<boolean | null>(null);
    const [accumulatedText, setAccumulatedText] = useState<string>('');

    // ✅ Check microphone access
    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(() => setMicAvailable(true))
            .catch(() => setMicAvailable(false));
    }, []);

    // Function to inject text into CopilotChat input - simplified and more reliable
    const injectTextIntoChat = useCallback((text: string) => {
        // Try multiple times with different delays to ensure DOM is ready
        const attempts = [100, 300, 500, 1000];

        const tryInject = (attemptIndex: number) => {
            if (attemptIndex >= attempts.length) {
                console.warn('❌ Could not find chat input after all attempts');
                return;
            }

            setTimeout(() => {
                // Simplified selector approach - focus on most common CopilotKit patterns
                const selectors = [
                    'textarea[placeholder*="Message"]',
                    'textarea[placeholder*="message"]',
                    'textarea',
                    'input[type="text"]'
                ];

                let textArea: HTMLTextAreaElement | HTMLInputElement | null = null;

                for (const selector of selectors) {
                    textArea = document.querySelector(selector) as HTMLTextAreaElement | HTMLInputElement;
                    if (textArea && textArea.offsetParent !== null) { // Check if element is visible
                        break;
                    }
                }

                if (textArea) {
                    try {
                        // Simple and reliable injection
                        textArea.focus();
                        textArea.value = text;

                        // Trigger React events
                        const inputEvent = new Event('input', { bubbles: true });
                        const changeEvent = new Event('change', { bubbles: true });

                        textArea.dispatchEvent(inputEvent);
                        textArea.dispatchEvent(changeEvent);

                        // Move cursor to end
                        textArea.setSelectionRange(text.length, text.length);

                        console.log('✅ Voice text injected successfully:', text);
                    } catch (error) {
                        console.error('❌ Error injecting text:', error);
                        // Try next attempt
                        tryInject(attemptIndex + 1);
                    }
                } else {
                    // Try again with next delay
                    tryInject(attemptIndex + 1);
                }
            }, attempts[attemptIndex]);
        };

        tryInject(0);
    }, []);

    // ✅ Handle voice input - clean and simple
    useEffect(() => {
        if (finalTranscript && finalTranscript.trim()) {
            const cleanText = finalTranscript.trim();

            // Accumulate text from multiple voice segments
            const newAccumulated = accumulatedText ?
                `${accumulatedText} ${cleanText}` : cleanText;

            setAccumulatedText(newAccumulated);

            // Inject into chat input
            injectTextIntoChat(newAccumulated);

            // Reset transcript for next segment
            resetTranscript();
        }
    }, [finalTranscript, resetTranscript, injectTextIntoChat, accumulatedText]);

    const handleStartListening = () => {
        setAccumulatedText(''); // Reset for new session
        SpeechRecognition.startListening({
            continuous: true,
            language: 'en-US'
        });
    };

    const handleStopListening = () => {
        SpeechRecognition.stopListening();
    };

    const handleClear = () => {
        resetTranscript();
        setAccumulatedText('');
    };

    const isReady = browserSupportsSpeechRecognition && micAvailable;

    return (
        <div className="mt-6 bg-white rounded-md p-3 shadow-md border max-h-[500px] overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            <CopilotChat
                instructions="You are a helpful AI assistant that supports the user in financial questions, transactions, and visualizations."
                labels={{
                    title: "Quantum Bank AI",
                    initial: "Hi! How can I assist you today?",
                    placeholder: "Send money securely, check balance, or navigate...",
                }}
            />

            {isReady ? (
                <div className="flex gap-2 text-sm items-center">
                    <button
                        onClick={handleStartListening}
                        disabled={listening}
                        className={`px-3 py-1 rounded-md transition-colors ${
                            listening
                                ? 'bg-green-500 text-white animate-pulse'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                        {listening ? '🎙 Listening...' : '🎙 Voice'}
                    </button>

                    <button
                        onClick={handleStopListening}
                        disabled={!listening}
                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                        🛑 Stop
                    </button>

                    <button
                        onClick={handleClear}
                        className="bg-gray-400 text-white px-3 py-1 rounded-md hover:bg-gray-500 transition-colors"
                    >
                        ♻ Clear
                    </button>

                    {listening && transcript && (
                        <span className="text-xs text-gray-600 ml-2">
              "{transcript}"
            </span>
                    )}
                </div>
            ) : micAvailable === false ? (
                <div className="text-xs text-red-500 bg-red-50 p-2 rounded">
                    ❌ Microphone access denied
                </div>
            ) : (
                <div className="text-xs text-red-500 bg-red-50 p-2 rounded">
                    ❌ Speech recognition not supported
                </div>
            )}
        </div>
    );
};

export default CopilotUI;