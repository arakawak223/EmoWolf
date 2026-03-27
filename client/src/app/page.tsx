"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";

export default function Home() {
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [mode, setMode] = useState<"select" | "create" | "join">("select");
  const [error, setError] = useState("");

  const handleCreate = () => {
    if (!name.trim()) {
      setError("名前を入力してください");
      return;
    }
    socket.emit("room:create", name.trim(), (roomId) => {
      router.push(`/room/${roomId}?name=${encodeURIComponent(name.trim())}`);
    });
  };

  const handleJoin = () => {
    if (!name.trim()) {
      setError("名前を入力してください");
      return;
    }
    if (!roomCode.trim()) {
      setError("ルームコードを入力してください");
      return;
    }
    router.push(
      `/room/${roomCode.trim().toUpperCase()}?name=${encodeURIComponent(
        name.trim()
      )}`
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-2">
            <span className="text-wolf-purple">Waku</span>
            <span className="text-wolf-red">Waku</span>
            <span className="text-white"> Word </span>
            <span className="text-wolf-blue">Wolf</span>
          </h1>
          <p className="text-gray-400 text-sm">
            新感覚の人狼ゲーム
          </p>
        </div>

        {/* Connection status */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-gray-400">
            {isConnected ? "接続済み" : "接続中..."}
          </span>
        </div>

        {/* Name input */}
        <div>
          <input
            type="text"
            placeholder="あなたの名前"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            maxLength={12}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-wolf-purple text-center text-lg"
          />
        </div>

        {error && (
          <p className="text-wolf-red text-center text-sm">{error}</p>
        )}

        {mode === "select" && (
          <div className="space-y-3">
            <button
              onClick={() => setMode("create")}
              disabled={!isConnected}
              className="w-full py-4 bg-wolf-purple hover:bg-purple-700 disabled:opacity-50 rounded-lg font-bold text-lg transition-colors"
            >
              ルームを作成
            </button>
            <button
              onClick={() => setMode("join")}
              disabled={!isConnected}
              className="w-full py-4 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg font-bold text-lg transition-colors"
            >
              ルームに参加
            </button>
          </div>
        )}

        {mode === "create" && (
          <div className="space-y-3">
            <button
              onClick={handleCreate}
              disabled={!isConnected}
              className="w-full py-4 bg-wolf-purple hover:bg-purple-700 disabled:opacity-50 rounded-lg font-bold text-lg transition-colors"
            >
              作成してゲーム開始
            </button>
            <button
              onClick={() => setMode("select")}
              className="w-full py-2 text-gray-400 hover:text-white transition-colors"
            >
              戻る
            </button>
          </div>
        )}

        {mode === "join" && (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="ルームコード（6桁）"
              value={roomCode}
              onChange={(e) => {
                setRoomCode(e.target.value.toUpperCase());
                setError("");
              }}
              maxLength={6}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-wolf-purple text-center text-2xl tracking-widest font-mono"
            />
            <button
              onClick={handleJoin}
              disabled={!isConnected}
              className="w-full py-4 bg-wolf-blue hover:bg-blue-700 disabled:opacity-50 rounded-lg font-bold text-lg transition-colors"
            >
              参加する
            </button>
            <button
              onClick={() => setMode("select")}
              className="w-full py-2 text-gray-400 hover:text-white transition-colors"
            >
              戻る
            </button>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs">
          完全招待制 / 録画・録音なし / プライバシー保護
        </p>
      </div>
    </div>
  );
}
