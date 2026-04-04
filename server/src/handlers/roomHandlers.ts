import type { Server, Socket } from "socket.io";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  Player,
} from "shared";
import { MAX_PLAYERS } from "shared";
import { RoomManager } from "../state/RoomManager";

type GameIO = Server<ClientToServerEvents, ServerToClientEvents>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function registerRoomHandlers(
  io: GameIO,
  socket: GameSocket,
  roomManager: RoomManager
): void {
  socket.on("room:create", (playerName, callback) => {
    const host: Player = {
      id: socket.id,
      peerId: "",
      name: playerName,
      isHost: true,
      isReady: true,
      isAlive: true,
    };
    const roomId = roomManager.createRoom(host);
    socket.join(roomId);
    callback(roomId);

    const room = roomManager.getRoom(roomId)!;
    io.to(roomId).emit("room:state", roomManager.sanitizeRoom(room));
  });

  socket.on("room:join", (roomId, playerName, peerId, callback) => {
    const room = roomManager.getRoom(roomId);
    if (!room) {
      callback(false, "ルームが見つかりません");
      return;
    }
    if (room.players.length >= MAX_PLAYERS) {
      callback(false, "ルームが満員です");
      return;
    }
    if (room.phase !== "lobby") {
      callback(false, "ゲームが既に開始されています");
      return;
    }

    const player: Player = {
      id: socket.id,
      peerId,
      name: playerName,
      isHost: false,
      isReady: false,
      isAlive: true,
    };

    const updated = roomManager.joinRoom(roomId, player);
    if (!updated) {
      callback(false, "参加できませんでした");
      return;
    }

    socket.join(roomId);
    callback(true);
    io.to(roomId).emit("room:state", roomManager.sanitizeRoom(updated));
  });

  socket.on("room:updatePeerId", (peerId) => {
    const roomId = roomManager.getPlayerRoom(socket.id);
    if (!roomId) return;

    const player = roomManager.getPlayer(roomId, socket.id);
    if (!player) return;

    player.peerId = peerId;

    const room = roomManager.getRoom(roomId)!;
    io.to(roomId).emit("room:state", roomManager.sanitizeRoom(room));
  });

  socket.on("room:ready", () => {
    const roomId = roomManager.getPlayerRoom(socket.id);
    if (!roomId) return;

    const player = roomManager.getPlayer(roomId, socket.id);
    if (!player) return;

    player.isReady = !player.isReady;

    const room = roomManager.getRoom(roomId)!;
    io.to(roomId).emit("room:state", roomManager.sanitizeRoom(room));
  });
}
