// components/CopilotUI.tsx
"use client";

import React, { useEffect, useState } from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotChat } from "@copilotkit/react-core";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useEnhancedCopilotActions } from "@/lib/copilot-actions"; // Changed from useCustomVoiceActions

const CopilotUI = () => {
  const {
    transcript,
    finalTranscript,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEnhancedCopilotActions(); // Changed from useCustomVoiceActions to useEnhancedCopilotActions

  const [micAvailable, setMicAvailable] = useState<boolean | null>(null);
  const { appendMessage } = useCopilotChat();

  // ✅ Mikrofon-Zugriff erfragen
  useEffect(() => {
    navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => setMicAvailable(true))
        .catch(() => setMicAvailable(false));
  }, []);

  // ✅ Wenn finalTranscript vorhanden → automatisch an Copilot senden
  useEffect(() => {
    if (finalTranscript) {
      appendMessage({ role: "user", content: finalTranscript });
      resetTranscript();
    }
  }, [finalTranscript, appendMessage, resetTranscript]);

  const isReady = browserSupportsSpeechRecognition && micAvailable;

  return (
      <div className="mt-6 bg-white rounded-md p-3 shadow-md border max-h-[500px] overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        <CopilotChat
            instructions="You are a helpful AI assistant that supports the user in financial questions, transactions, and visualizations."
            labels={{
              title: "Quantum Copilot",
              initial: "Was möchtest du wissen?",
            }}
        />

        {isReady ? (
            <>
              <div className="flex gap-2 text-sm">
                <button
                    onClick={() =>
                        SpeechRecognition.startListening({ continuous: true })
                    }
                    className="bg-blue-600 text-white px-3 py-1 rounded-md"
                >
                  🎙 Start
                </button>
                <button
                    onClick={() => {
                      SpeechRecognition.stopListening();
                      // Trigger den aktuellen Text ins CopilotKit-Feld einfügen
                      const input = document.querySelector(
                          "textarea"
                      ) as HTMLTextAreaElement;
                      if (input && transcript) {
                        input.value = transcript;
                        input.dispatchEvent(new Event("input", { bubbles: true }));
                        input.form?.dispatchEvent(
                            new Event("submit", { bubbles: true })
                        );
                      }
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded-md"
                >
                  🛑 Stop
                </button>
                <button
                    onClick={resetTranscript}
                    className="bg-gray-400 text-white px-3 py-1 rounded-md"
                >
                  ♻ Reset
                </button>
              </div>
              <p className="text-xs text-gray-500">Transkript: {transcript}</p>
            </>
        ) : micAvailable === false ? (
            <p className="text-xs text-red-500">
              Zugriff auf Mikrofon wurde verweigert.
            </p>
        ) : (
            <p className="text-xs text-red-500">
              Dein Browser unterstützt keine Spracherkennung.
            </p>
        )}
      </div>
  );
};

export default CopilotUI;