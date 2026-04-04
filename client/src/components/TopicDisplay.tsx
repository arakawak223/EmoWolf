"use client";

import type { Topic } from "../../../shared/src/types";

interface TopicDisplayProps {
  topic: Topic;
}

export function TopicDisplay({ topic }: TopicDisplayProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center animate-role-reveal">
        <h2 className="text-3xl font-bold mb-6">今回のテーマ</h2>
        <div className="bg-gray-800 rounded-xl p-8 max-w-lg mx-auto">
          <p className="text-xl font-bold text-wolf-purple">
            {topic.category}
          </p>
        </div>
        <p className="text-gray-500 text-sm mt-4">
          あなたに割り当てられたお題がまもなく表示されます...
        </p>
      </div>
    </div>
  );
}
