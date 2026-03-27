"use client";

interface EmotionOverlayProps {
  emotion: { id: string; label: string; emoji: string };
}

export function EmotionOverlay({ emotion }: EmotionOverlayProps) {
  return (
    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-pulse-glow">
      <span className="text-lg">{emotion.emoji}</span>
      <span className="text-sm font-medium">{emotion.label}</span>
    </div>
  );
}
