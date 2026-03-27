"use client";

import type { Player } from "../../../shared/src/types";

interface ResultScreenProps {
  result: {
    werewolfIds: string[];
    winner: "citizens" | "werewolf";
    eliminatedId: string | null;
  };
  players: Player[];
  myId: string;
}

export function ResultScreen({ result, players, myId }: ResultScreenProps) {
  const eliminated = result.eliminatedId
    ? players.find((p) => p.id === result.eliminatedId)
    : null;

  const werewolves = players.filter((p) =>
    result.werewolfIds.includes(p.id)
  );

  const iWon =
    (result.winner === "citizens" && !result.werewolfIds.includes(myId)) ||
    (result.winner === "werewolf" && result.werewolfIds.includes(myId));

  return (
    <div className="bg-gray-900/90 backdrop-blur-sm p-6 border-t border-gray-700">
      <div className="text-center max-w-md mx-auto">
        {/* Winner announcement */}
        <div className="mb-4">
          <p className="text-5xl mb-2">
            {result.winner === "citizens" ? "🎉" : "🐺"}
          </p>
          <h3
            className={`text-2xl font-bold ${
              result.winner === "citizens"
                ? "text-wolf-blue"
                : "text-wolf-red"
            }`}
          >
            {result.winner === "citizens"
              ? "市民チームの勝利!"
              : "人狼の勝利!"}
          </h3>
          <p
            className={`text-lg mt-1 ${
              iWon ? "text-green-400" : "text-red-400"
            }`}
          >
            {iWon ? "あなたの勝ち!" : "あなたの負け..."}
          </p>
        </div>

        {/* Who was eliminated */}
        {eliminated && (
          <p className="text-gray-400 mb-4">
            追放されたのは: <span className="text-white font-bold">{eliminated.name}</span>
          </p>
        )}

        {/* Werewolf reveal */}
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-2">人狼だったのは...</p>
          <div className="flex gap-2 justify-center">
            {werewolves.map((w) => (
              <span
                key={w.id}
                className="bg-wolf-red/20 text-wolf-red px-4 py-2 rounded-lg font-bold"
              >
                🐺 {w.name}
              </span>
            ))}
          </div>
        </div>

        <p className="text-gray-600 text-xs mt-4">
          次のラウンドがまもなく始まります...
        </p>
      </div>
    </div>
  );
}
