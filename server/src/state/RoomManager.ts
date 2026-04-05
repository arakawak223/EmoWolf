import type { Room, Player } from "shared";

export class RoomManager {
  private rooms = new Map<string, Room>();
  private playerToRoom = new Map<string, string>();

  createRoom(host: Player): string {
    const id = this.generateRoomId();
    const room: Room = {
      id,
      players: [host],
      phase: "lobby",
      votes: {},
      round: 0,
    };
    this.rooms.set(id, room);
    this.playerToRoom.set(host.id, id);
    return id;
  }

  joinRoom(roomId: string, player: Player): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    if (room.players.length >= 8) return null;
    if (room.phase !== "lobby") return null;

    // Prevent duplicate joins, but update peerId for reconnections
    const existing = room.players.find((p) => p.id === player.id);
    if (existing) {
      if (player.peerId) existing.peerId = player.peerId;
      return room;
    }

    room.players.push(player);
    this.playerToRoom.set(player.id, roomId);
    return room;
  }

  removePlayer(roomId: string, playerId: string): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.players = room.players.filter((p) => p.id !== playerId);
    this.playerToRoom.delete(playerId);

    if (room.players.length === 0) {
      return null;
    }

    // Reassign host if needed
    if (!room.players.some((p) => p.isHost)) {
      room.players[0].isHost = true;
    }

    return room;
  }

  getRoom(roomId: string): Room | null {
    return this.rooms.get(roomId) || null;
  }

  getPlayerRoom(playerId: string): string | undefined {
    return this.playerToRoom.get(playerId);
  }

  getPlayer(roomId: string, playerId: string): Player | undefined {
    const room = this.rooms.get(roomId);
    return room?.players.find((p) => p.id === playerId);
  }

  sanitizeRoom(room: Room): Room {
    return {
      ...room,
      players: room.players.map((p) => ({
        ...p,
        role: undefined, // Never send roles to clients via room state
      })),
    };
  }

  cleanupEmptyRooms(): void {
    for (const [id, room] of this.rooms) {
      if (room.players.length === 0) {
        this.rooms.delete(id);
      }
    }
  }

  private generateRoomId(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let id = "";
    for (let i = 0; i < 6; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    if (this.rooms.has(id)) return this.generateRoomId();
    return id;
  }
}
