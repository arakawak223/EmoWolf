import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "../../shared/src/types";
import { RoomManager } from "./state/RoomManager";
import { registerRoomHandlers } from "./handlers/roomHandlers";
import { registerGameHandlers } from "./handlers/gameHandlers";
import { registerEmotionHandlers } from "./handlers/emotionHandlers";

const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

const app = express();
app.use(cors({ origin: CORS_ORIGIN }));

const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
});

const roomManager = new RoomManager();

io.on("connection", (socket) => {
  console.log(`Connected: ${socket.id}`);

  registerRoomHandlers(io, socket, roomManager);
  registerGameHandlers(io, socket, roomManager);
  registerEmotionHandlers(io, socket, roomManager);

  socket.on("disconnect", () => {
    console.log(`Disconnected: ${socket.id}`);
    const roomId = roomManager.getPlayerRoom(socket.id);
    if (roomId) {
      const room = roomManager.removePlayer(roomId, socket.id);
      if (room) {
        io.to(roomId).emit("room:state", roomManager.sanitizeRoom(room));
      }
    }
  });
});

// Cleanup empty rooms every 5 minutes
setInterval(() => {
  roomManager.cleanupEmptyRooms();
}, 5 * 60 * 1000);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`WWW — WakuWaku Word Wolf server running on port ${PORT}`);
});
