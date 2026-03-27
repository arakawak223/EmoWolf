"use client";

import { useRef, useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import type {
  Player,
  ServerToClientEvents,
  ClientToServerEvents,
} from "../../../shared/src/types";
import { REACTIONS, EMOTIONS } from "../../../shared/src/constants";
import { EmotionOverlay } from "./EmotionOverlay";

interface VideoTileProps {
  player: Player;
  stream: MediaStream | null;
  isMe: boolean;
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
}

export function VideoTile({ player, stream, isMe, socket }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showReactions, setShowReactions] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<
    { id: number; emoji: string }[]
  >([]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Listen for incoming reactions
  useEffect(() => {
    const handler = (data: {
      fromId: string;
      toId: string;
      reaction: string;
    }) => {
      if (data.toId === player.id) {
        const reactionDef = REACTIONS.find((r) => r.id === data.reaction);
        if (reactionDef) {
          const id = Date.now() + Math.random();
          setFloatingReactions((prev) => [
            ...prev,
            { id, emoji: reactionDef.emoji },
          ]);
          setTimeout(() => {
            setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
          }, 1500);
        }
      }
    };

    socket.on("emotion:reaction", handler);
    return () => {
      socket.off("emotion:reaction", handler);
    };
  }, [socket, player.id]);

  const emotionDef = player.emotion
    ? EMOTIONS.find((e) => e.id === player.emotion)
    : null;

  return (
    <div
      className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video"
      onMouseEnter={() => !isMe && setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMe}
        className="w-full h-full object-cover"
        style={isMe ? { transform: "scaleX(-1)" } : undefined}
      />

      {/* No video fallback */}
      {!stream && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <span className="text-4xl">
            {player.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* Player name */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{player.name}</span>
          {isMe && <span className="text-xs text-gray-400">(あなた)</span>}
        </div>
      </div>

      {/* Emotion badge */}
      {emotionDef && <EmotionOverlay emotion={emotionDef} />}

      {/* Floating reactions */}
      {floatingReactions.map((r) => (
        <div
          key={r.id}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 text-4xl animate-float-up pointer-events-none"
        >
          {r.emoji}
        </div>
      ))}

      {/* Reaction buttons (shown on hover for other players) */}
      {showReactions && !isMe && (
        <div className="absolute top-2 right-2 flex gap-1">
          {REACTIONS.map((reaction) => (
            <button
              key={reaction.id}
              onClick={() =>
                socket.emit("emotion:react", {
                  toId: player.id,
                  reaction: reaction.id,
                })
              }
              className="w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-sm transition-colors"
              title={reaction.label}
            >
              {reaction.emoji}
            </button>
          ))}
        </div>
      )}

      {/* Dead overlay */}
      {!player.isAlive && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <span className="text-2xl">eliminated</span>
        </div>
      )}
    </div>
  );
}
