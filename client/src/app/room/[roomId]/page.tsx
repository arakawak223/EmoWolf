"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { useGameState } from "@/hooks/useGameState";
import { useMediaStream } from "@/hooks/useMediaStream";
import { usePeer } from "@/hooks/usePeer";
import { Lobby } from "@/components/Lobby";
import { VideoGrid } from "@/components/VideoGrid";
import { TopicDisplay } from "@/components/TopicDisplay";
import { RoleReveal } from "@/components/RoleReveal";
import { EmotionPicker } from "@/components/EmotionPicker";
import { VotingPanel } from "@/components/VotingPanel";
import { ResultScreen } from "@/components/ResultScreen";
import { GamePhaseBar } from "@/components/GamePhaseBar";

export default function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const searchParams = useSearchParams();
  const nameFromUrl = searchParams.get("name");

  const { socket, isConnected } = useSocket();
  const { stream, error: mediaError, isLoading: mediaLoading } = useMediaStream();
  const gameState = useGameState(socket);
  const { peerStreams, myPeerId } = usePeer(
    stream,
    gameState.room?.players || [],
    socket.id || ""
  );

  const [joined, setJoined] = useState(false);
  const [showRoleReveal, setShowRoleReveal] = useState(false);
  const [nickname, setNickname] = useState("");
  const [playerName, setPlayerName] = useState(nameFromUrl || "");

  // Join room when connected
  useEffect(() => {
    if (!isConnected || joined || !myPeerId) return;

    // Check if we created this room (we'd already be in it)
    if (gameState.room?.players.some((p) => p.id === socket.id)) {
      // Host created the room without peerId - send it now
      socket.emit("room:updatePeerId", myPeerId);
      setJoined(true);
      return;
    }

    socket.emit("room:join", roomId, playerName, myPeerId, (success, error) => {
      if (success) {
        setJoined(true);
      } else {
        alert(error || "参加できませんでした");
      }
    });
  }, [isConnected, joined, myPeerId, roomId, playerName, socket, gameState.room]);

  // Show role reveal animation
  useEffect(() => {
    if (gameState.phase === "roleReveal" && gameState.myRole) {
      setShowRoleReveal(true);
      const timer = setTimeout(() => setShowRoleReveal(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [gameState.phase, gameState.myRole]);

  // Show nickname input if player arrived without a name (direct link)
  if (!playerName) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <h2 className="text-2xl font-bold">ルームに参加</h2>
          <p className="text-gray-400 text-sm">ルームコード: {roomId}</p>
          <input
            type="text"
            placeholder="あなたの名前"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={12}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-wolf-purple text-center text-lg"
          />
          <button
            onClick={() => {
              if (nickname.trim()) {
                setPlayerName(nickname.trim());
              }
            }}
            disabled={!nickname.trim()}
            className="w-full py-4 bg-wolf-purple hover:bg-purple-700 disabled:opacity-50 rounded-lg font-bold text-lg transition-colors"
          >
            参加する
          </button>
        </div>
      </div>
    );
  }

  if (mediaLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-wolf-purple border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">カメラ・マイクを準備中...</p>
        </div>
      </div>
    );
  }

  if (mediaError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <p className="text-wolf-red text-lg mb-2">カメラエラー</p>
          <p className="text-gray-400">{mediaError}</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">サーバーに接続中...</p>
      </div>
    );
  }

  const { room, phase, myRole, myAnswer, result, error, clearError } = gameState;
  const isHost = room?.players.find((p) => p.id === socket.id)?.isHost || false;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Error toast */}
      {error && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 bg-wolf-red px-6 py-3 rounded-lg shadow-lg z-50 cursor-pointer"
          onClick={clearError}
        >
          {error}
        </div>
      )}

      {/* Phase bar */}
      {phase !== "lobby" && (
        <GamePhaseBar
          phase={phase}
          deadline={gameState.phaseDeadline}
          roomId={roomId}
          myAnswer={myAnswer}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {phase === "lobby" && room && (
          <Lobby
            room={room}
            isHost={isHost}
            myId={socket.id || ""}
            localStream={stream}
            onReady={() => socket.emit("room:ready")}
            onStart={() => socket.emit("game:start")}
            roomId={roomId}
          />
        )}

        {phase === "topic" && room?.topic && (
          <TopicDisplay topic={room.topic} />
        )}

        {showRoleReveal && myRole && myAnswer && (
          <RoleReveal role={myRole} answer={myAnswer} />
        )}

        {(phase === "emotionDeclare" ||
          phase === "freeTalk" ||
          phase === "voting" ||
          phase === "result") && (
          <div className="flex-1 flex flex-col">
            <VideoGrid
              players={room?.players || []}
              myId={socket.id || ""}
              localStream={stream}
              peerStreams={peerStreams}
              socket={socket}
            />

            {phase === "emotionDeclare" && (
              <EmotionPicker
                onSelect={(emotion) =>
                  socket.emit("emotion:declare", emotion)
                }
              />
            )}

            {phase === "voting" && (
              <VotingPanel
                players={room?.players || []}
                myId={socket.id || ""}
                onVote={(targetId) => socket.emit("game:vote", targetId)}
              />
            )}

            {phase === "result" && result && (
              <ResultScreen
                result={result}
                players={room?.players || []}
                myId={socket.id || ""}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
