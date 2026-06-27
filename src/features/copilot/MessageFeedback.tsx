import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface MessageFeedbackProps {
  messageId: string;
  initialFeedback?: "up" | "down";
  onFeedback: (messageId: string, feedback: "up" | "down") => void;
}

export function MessageFeedback({ messageId, initialFeedback, onFeedback }: MessageFeedbackProps) {
  const [feedback, setFeedback] = useState<"up" | "down" | undefined>(initialFeedback);

  const handleRating = (rating: "up" | "down") => {
    setFeedback(rating);
    onFeedback(messageId, rating);
  };

  return (
    <div className="flex items-center gap-1 mt-1 text-muted-foreground">
      <button
        onClick={() => handleRating("up")}
        className={`p-1 rounded hover:bg-muted transition-colors ${
          feedback === "up" ? "text-[color:var(--success)]" : ""
        }`}
        title="Helpful"
      >
        <ThumbsUp className="h-3 w-3" />
      </button>
      <button
        onClick={() => handleRating("down")}
        className={`p-1 rounded hover:bg-muted transition-colors ${
          feedback === "down" ? "text-destructive" : ""
        }`}
        title="Not helpful"
      >
        <ThumbsDown className="h-3 w-3" />
      </button>
    </div>
  );
}
