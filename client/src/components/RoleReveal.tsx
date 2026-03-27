"use client";

import type { Role } from "../../../shared/src/types";

interface RoleRevealProps {
  role: Role;
  answer: string;
}

export function RoleReveal({ role, answer }: RoleRevealProps) {
  const isWerewolf = role === "werewolf";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="animate-role-reveal text-center p-8">
        <div
          className={`text-8xl mb-6 ${
            isWerewolf ? "text-wolf-red" : "text-wolf-blue"
          }`}
        >
          {isWerewolf ? "🐺" : "👤"}
        </div>
        <h2
          className={`text-3xl font-bold mb-2 ${
            isWerewolf ? "text-wolf-red" : "text-wolf-blue"
          }`}
        >
          {isWerewolf ? "人狼" : "市民"}
        </h2>
        <p className="text-gray-400 text-sm mb-6">あなたの役割</p>

        <div className="bg-gray-800 rounded-xl p-6 max-w-sm mx-auto">
          <p className="text-sm text-gray-400 mb-2">あなたのお題:</p>
          <p className="text-2xl font-bold">{answer}</p>
        </div>

        {isWerewolf && (
          <p className="text-wolf-red text-sm mt-4">
            多数派と異なるお題です。バレないように振る舞いましょう!
          </p>
        )}

        <p className="text-gray-600 text-xs mt-6">
          この画面はあなただけに表示されています
        </p>
      </div>
    </div>
  );
}
