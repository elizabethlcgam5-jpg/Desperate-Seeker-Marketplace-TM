import { Mic, MicOff } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MicButtonProps {
  onResult: (transcript: string) => void;
  title?: string;
  className?: string;
}

export function MicButton({ onResult, title = "Dictate", className }: MicButtonProps) {
  const { isSupported, isListening, toggle } = useSpeechRecognition({ onResult });

  if (!isSupported) return null;

  return (
    <button
      type="button"
      aria-label={isListening ? "Stop dictation" : title}
      title={isListening ? "Listening… tap to stop" : title}
      onClick={() => {
        if (!isListening) toast.info("Listening… speak now.");
        toggle();
      }}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors shrink-0",
        isListening
          ? "border-red-300 bg-red-500 text-white animate-pulse"
          : "border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#0B3954] hover:bg-[#D4AF37]/20",
        className,
      )}
    >
      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </button>
  );
}
