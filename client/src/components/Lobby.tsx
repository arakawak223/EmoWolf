"use client";

import { useRef, useEffect } from "react";
import type { Room } from "../../../shared/src/types";
import { MIN_PLAYERS } from "../../../shared/src/constants";
import { InviteLink } from "./InviteLink";

interface LobbyProps {
  room: Room;
  isHost: boolean;
  myId: string;
  localStream: MediaStream | null;
  onReady: () => void;
  onStart: () => void;
  roomId: string;
}

export function Lobby({
  room,
  isHost,
  myId,
  localStream,
  onReady,
  onStart,
  roomId,
}: LobbyProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const allReady = room.players.every((p) => p.isReady);
  const enoughPlayers = room.players.length >= MIN_PLAYERS;
  const canStart = isHost && allReady && enoughPlayers;
  const me = room.players.find((p) => p.id === myId);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
      {/* Room info */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">ロビー</h2>
        <InviteLink roomId={roomId} />
      </div>

      {/* Video preview */}
      <div className="w-48 h-36 bg-gray-800 rounded-lg overflow-hidden relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover mirror"
          style={{ transform: "scaleX(-1)" }}
        />
        <div className="absolute bottom-1 left-1 bg-black/60 text-xs px-2 py-0.5 rounded">
          {me?.name || "あなた"}
        </div>
      </div>

      {/* Player list */}
      <div className="w-full max-w-sm space-y-2">
        <h3 className="text-sm text-gray-400 mb-2">
          プレイヤー ({room.players.length}/8)
        </h3>
        {room.players.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between bg-gray-800 px-4 py-3 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <span>{player.name}</span>
              {player.isHost && (
                <span className="text-xs bg-wolf-purple px-2 py-0.5 rounded">
                  ホスト
                </span>
              )}
              {player.id === myId && (
                <span className="text-xs text-gray-400">(あなた)</span>
              )}
            </div>
            <span
              className={`text-sm ${
                player.isReady ? "text-green-400" : "text-gray-500"
              }`}
            >
              {player.isReady ? "準備OK" : "待機中"}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-3 w-full max-w-sm">
        {!isHost && (
          <button
            onClick={onReady}
            className={`w-full py-3 rounded-lg font-bold transition-colors ${
              me?.isReady
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-wolf-green hover:bg-green-700"
            }`}
          >
            {me?.isReady ? "準備を取り消す" : "準備完了"}
          </button>
        )}

        {isHost && (
          <button
            onClick={onStart}
            disabled={!canStart}
            className="w-full py-3 bg-wolf-red hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold transition-colors"
          >
            {!enoughPlayers
              ? `あと${MIN_PLAYERS - room.players.length}人必要`
              : !allReady
              ? "全員の準備を待っています..."
              : "ゲーム開始!"}
          </button>
        )}
      </div>
    </div>
  );
}
