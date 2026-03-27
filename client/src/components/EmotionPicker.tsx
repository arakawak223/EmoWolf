"use client";

import { useState } from "react";
import { EMOTIONS } from "../../../shared/src/constants";

interface EmotionPickerProps {
  onSelect: (emotionId: string) => void;
}

export function EmotionPicker({ onSelect }: EmotionPickerProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (emotionId: string) => {
    setSelected(emotionId);
    onSelect(emotionId);
  };

  return (
    <div className="bg-gray-900/90 backdrop-blur-sm p-4 border-t border-gray-700">
      <p className="text-center text-sm text-gray-400 mb-3">
        このお題に対する感情を選んでください
      </p>
      <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
        {EMOTIONS.map((emotion) => (
          <button
            key={emotion.id}
            onClick={() => handleSelect(emotion.id)}
            className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
              selected === emotion.id
                ? "bg-wolf-purple scale-105"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            <span className="text-2xl">{emotion.emoji}</span>
            <span className="text-xs">{emotion.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
