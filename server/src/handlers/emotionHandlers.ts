import type { Server, Socket } from "socket.io";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "shared";
import { RoomManager } from "../state/RoomManager";

type GameIO = Server<ClientToServerEvents, ServerToClientEvents>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function registerEmotionHandlers(
  io: GameIO,
  socket: GameSocket,
  roomManager: RoomManager
): void {
  socket.on("emotion:declare", (emotion) => {
    const roomId = roomManager.getPlayerRoom(socket.id);
    if (!roomId) return;

    const player = roomManager.getPlayer(roomId, socket.id);
    if (!player) return;

    player.emotion = emotion;

    const room = roomManager.getRoom(roomId)!;
    io.to(roomId).emit("room:state", roomManager.sanitizeRoom(room));
  });

  socket.on("emotion:react", ({ toId, reaction }) => {
    const roomId = roomManager.getPlayerRoom(socket.id);
    if (!roomId) return;

    io.to(roomId).emit("emotion:reaction", {
      fromId: socket.id,
      toId,
      reaction,
    });
  });
}
