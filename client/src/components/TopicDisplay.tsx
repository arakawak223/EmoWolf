"use client";

import type { Topic } from "../../../shared/src/types";

interface TopicDisplayProps {
  topic: Topic;
}

export function TopicDisplay({ topic }: TopicDisplayProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center animate-role-reveal">
        <p className="text-sm text-wolf-purple mb-2">{topic.category}</p>
        <h2 className="text-3xl font-bold mb-6">今回のテーマ</h2>
        <div className="bg-gray-800 rounded-xl p-8 max-w-lg mx-auto">
          <div className="flex items-center justify-center gap-8 mb-4">
            <div className="text-center">
              <p className="text-xl font-bold text-wolf-blue">
                {topic.majority}
              </p>
              <p className="text-xs text-gray-400 mt-1">vs</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-wolf-red">
                {topic.minority}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-400">{topic.emotionGap}</p>
        </div>
        <p className="text-gray-500 text-sm mt-4">
          あなたに割り当てられたお題がまもなく表示されます...
        </p>
      </div>
    </div>
  );
}
