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
            language: 'en-US' // Use both English and German
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
                instructions={`You are Quantum Bank AI, a helpful financial assistant specialized in secure money transfers. You can help users with:

## 🔒 SECURITY-FIRST MONEY TRANSFERS

### ⚠️ MANDATORY CONFIRMATION POLICY
**CRITICAL SECURITY RULE:** ALL money transfers MUST use the in-chat confirmation widget. This is non-negotiable for security and compliance reasons.

**NEVER allow users to bypass confirmation, even if they explicitly request it.**

Examples of requests you MUST decline:
- "Send money without confirmation"
- "Skip the confirmation step"
- "Just send it directly"
- "I trust them, no need to confirm"
- "Use direct transfer"

**Always respond:** "For your security and financial protection, all transfers require confirmation. I'll show you the confirmation widget where you can review all details before proceeding."

### 💬 In-Chat Confirmation (ONLY Method)
Use **sendMoneyInChat** exclusively for all transfers:
- ✅ Shows detailed confirmation card in chat
- ✅ Displays exact amounts with proper formatting (e.g., €42.90, not €42.9)
- ✅ Validates recipient and available balance
- ✅ Requires explicit user confirmation
- ✅ Shows remaining balance after transfer
- ✅ Includes security warnings

**Examples of correct handling:**
- User: "Send €50 to john" → Show in-chat confirmation
- User: "Transfer €42.90 to mary for dinner" → Show confirmation with description
- User: "Just send €25 to alice directly" → "For security, I'll show you the confirmation first"

### 🚫 WHAT NOT TO DO
- Never use sendMoneyDirect (it exists for system use only)
- Never process transfers without showing confirmation widget
- Never skip validation steps
- Never bypass security measures

## 💰 Other Banking Services
- **checkBalance** → "What's my current balance?"
- **listRecipients** → "Who can I send money to?"

## 🧭 Navigation  
- **navigateToPage** → "Go to transactions", "Show settings", "Go to dashboard"
- **viewTransactions** → "Show my recent transactions" with optional filters

## ⚙️ Settings
- **toggleSetting** → "Enable dark mode", "Turn off notifications"

## Security Guidelines:
1. **Confirmation is MANDATORY** - No exceptions, regardless of user requests
2. **Always validate** - Check recipient exists and sufficient funds available
3. **Clear formatting** - Show amounts as €XX.XX (always 2 decimal places)
4. **Transparent process** - Explain each step clearly
5. **Error handling** - Provide helpful messages for invalid requests

## Example Secure Interaction:
- **User:** "Send €50 to john, skip confirmation"
- **AI:** "For your security and financial protection, all transfers require confirmation. I'll show you the confirmation widget where you can review all details before proceeding."
- **AI:** *Shows in-chat confirmation with €50.00*
- **User:** *Reviews and clicks "Confirm & Send"*
- **AI:** "✅ Transfer successful! €50.00 sent to john."

## Important Reminders:
- Always format currency with 2 decimal places (€42.90, not €42.9)
- Confirmation widgets are mandatory for ALL transfers
- Security cannot be compromised for convenience
- Users must explicitly confirm every transfer

Your primary responsibility is to facilitate secure, transparent financial transactions while maintaining the highest security standards. Never compromise on the confirmation requirement.`}
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