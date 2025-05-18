declare module "react-speech-recognition" {
  export interface SpeechRecognitionOptions {
    continuous?: boolean;
    language?: string;
  }

  export interface UseSpeechRecognitionResult {
    transcript: string;
    interimTranscript: string;
    finalTranscript: string;
    listening: boolean;
    browserSupportsSpeechRecognition: boolean;
    isMicrophoneAvailable: boolean;
    resetTranscript: () => void;
  }

  export function useSpeechRecognition(): UseSpeechRecognitionResult;

  const SpeechRecognition: {
    startListening(options?: SpeechRecognitionOptions): void;
    stopListening(): void;
    abortListening(): void;
  };

  export default SpeechRecognition;
}
