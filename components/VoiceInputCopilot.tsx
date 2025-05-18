"use client";

import React, { useEffect } from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

const VoiceInputCopilot = () => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      console.log("🗣 Voice Input:", transcript);
      // Hier könntest du das Transcript an CopilotKit weitergeben
      // resetTranscript(); // optional, damit nicht mehrfach gesendet wird
    }
  }, [transcript]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Dein Browser unterstützt keine Spracherkennung.</span>;
  }

  return (
    <div className="border rounded-md p-2 bg-white shadow-md space-y-2">
      <CopilotChat
        instructions="You are assisting the user in managing their finances."
        labels={{ title: "Quantum Voice Copilot", initial: "Wie kann ich helfen?" }}
      />
      <div className="flex gap-2">
        <button
          onClick={() => SpeechRecognition.startListening({ continuous: true })}
          className="bg-green-600 text-white px-3 py-1 rounded-md"
        >
          🎙 Start
        </button>
        <button
          onClick={SpeechRecognition.stopListening}
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
    </div>
  );
};

export default VoiceInputCopilot;