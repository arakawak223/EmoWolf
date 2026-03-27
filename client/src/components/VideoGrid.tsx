"use client";

import { useRef, useEffect } from "react";
import type { Socket } from "socket.io-client";
import type {
  Player,
  ServerToClientEvents,
  ClientToServerEvents,
} from "../../../shared/src/types";
import { VideoTile } from "./VideoTile";

interface VideoGridProps {
  players: Player[];
  myId: string;
  localStream: MediaStream | null;
  peerStreams: Record<string, MediaStream>;
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
}

export function VideoGrid({
  players,
  myId,
  localStream,
  peerStreams,
  socket,
}: VideoGridProps) {
  const cols =
    players.length <= 4
      ? "grid-cols-2"
      : players.length <= 6
      ? "grid-cols-3"
      : "grid-cols-4";

  return (
    <div className={`flex-1 grid ${cols} gap-2 p-2`}>
      {players.map((player) => {
        const isMe = player.id === myId;
        const stream = isMe
          ? localStream
          : peerStreams[player.peerId] || null;

        return (
          <VideoTile
            key={player.id}
            player={player}
            stream={stream}
            isMe={isMe}
            socket={socket}
          />
        );
      })}
    </div>
  );
}
