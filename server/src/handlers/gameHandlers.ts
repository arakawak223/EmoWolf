import type { Server, Socket } from "socket.io";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "shared";
import { MIN_PLAYERS } from "shared";
import { RoomManager } from "../state/RoomManager";
import { startGame, handleVote } from "../game/GameEngine";

type GameIO = Server<ClientToServerEvents, ServerToClientEvents>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function registerGameHandlers(
  io: GameIO,
  socket: GameSocket,
  roomManager: RoomManager
): void {
  socket.on("game:start", () => {
    const roomId = roomManager.getPlayerRoom(socket.id);
    if (!roomId) return;

    const room = roomManager.getRoom(roomId);
    if (!room) return;

    const player = roomManager.getPlayer(roomId, socket.id);
    if (!player?.isHost) {
      socket.emit("room:error", "ホストのみがゲームを開始できます");
      return;
    }

    if (room.players.length < MIN_PLAYERS) {
      socket.emit(
        "room:error",
        `最低${MIN_PLAYERS}人のプレイヤーが必要です`
      );
      return;
    }

    const readyCount = room.players.filter((p) => p.isReady).length;
    if (readyCount < room.players.length) {
      socket.emit("room:error", "全員が準備完了になる必要があります");
      return;
    }

    startGame(io, roomManager, roomId);
  });

  socket.on("game:vote", (targetId) => {
    const roomId = roomManager.getPlayerRoom(socket.id);
    if (!roomId) return;

    handleVote(io, roomManager, roomId, socket.id, targetId);
  });
}
