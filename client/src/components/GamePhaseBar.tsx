"use client";

import { useState, useEffect } from "react";
import type { GamePhase, Role } from "../../../shared/src/types";

interface GamePhaseBarProps {
  phase: GamePhase;
  deadline: number;
  roomId: string;
  myRole: Role | null;
  myAnswer: string | null;
}

const PHASE_LABELS: Record<GamePhase, string> = {
  lobby: "ロビー",
  topic: "お題発表",
  roleReveal: "役職確認",
  emotionDeclare: "感情宣言タイム",
  freeTalk: "フリートーク",
  voting: "投票タイム",
  result: "結果発表",
};

export function GamePhaseBar({
  phase,
  deadline,
  roomId,
  myRole,
  myAnswer,
}: GamePhaseBarProps) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!deadline) return;

    const tick = () => {
      const left = Math.max(0, deadline - Date.now());
      setRemaining(Math.ceil(left / 1000));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <div className="bg-gray-900 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-wolf-purple font-bold text-sm">
          {PHASE_LABELS[phase]}
        </span>
        {myRole && (
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              myRole === "werewolf"
                ? "bg-wolf-red/20 text-wolf-red"
                : "bg-wolf-blue/20 text-wolf-blue"
            }`}
          >
            {myRole === "werewolf" ? "🐺 人狼" : "👤 市民"}
          </span>
        )}
        {myAnswer && (
          <span className="text-xs text-gray-400">
            お題: {myAnswer}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm text-gray-400">
          Room: {roomId}
        </span>
        {remaining > 0 && (
          <span
            className={`font-mono text-lg font-bold ${
              remaining <= 10 ? "text-wolf-red" : "text-white"
            }`}
          >
            {remaining}s
          </span>
        )}
      </div>
    </div>
  );
}
