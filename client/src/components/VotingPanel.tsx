"use client";

import { useState } from "react";
import type { Player } from "../../../shared/src/types";

interface VotingPanelProps {
  players: Player[];
  myId: string;
  onVote: (targetId: string) => void;
}

export function VotingPanel({ players, myId, onVote }: VotingPanelProps) {
  const [voted, setVoted] = useState<string | null>(null);

  const alivePlayers = players.filter(
    (p) => p.isAlive && p.id !== myId
  );

  const handleVote = (targetId: string) => {
    if (voted) return;
    setVoted(targetId);
    onVote(targetId);
  };

  return (
    <div className="bg-gray-900/90 backdrop-blur-sm p-4 border-t border-gray-700">
      <p className="text-center text-sm text-gray-400 mb-3">
        {voted
          ? "投票しました。結果を待っています..."
          : "怪しいと思うプレイヤーに投票してください"}
      </p>
      <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
        {alivePlayers.map((player) => (
          <button
            key={player.id}
            onClick={() => handleVote(player.id)}
            disabled={!!voted}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              voted === player.id
                ? "bg-wolf-red scale-105"
                : voted
                ? "bg-gray-800 opacity-50"
                : "bg-gray-800 hover:bg-wolf-red hover:scale-105"
            }`}
          >
            <span className="text-lg mr-2">👆</span>
            {player.name}
          </button>
        ))}
      </div>
    </div>
  );
}
