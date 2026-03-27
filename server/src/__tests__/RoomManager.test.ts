import { describe, it, expect, beforeEach } from "vitest";
import { RoomManager } from "../state/RoomManager";
import type { Player } from "../../../shared/src/types";

function makePlayer(id: string, opts?: Partial<Player>): Player {
  return {
    id,
    peerId: "",
    name: `Player_${id}`,
    isHost: false,
    isReady: false,
    isAlive: true,
    ...opts,
  };
}

describe("RoomManager", () => {
  let rm: RoomManager;

  beforeEach(() => {
    rm = new RoomManager();
  });

  describe("createRoom", () => {
    it("returns a 6-character room ID", () => {
      const host = makePlayer("h1", { isHost: true });
      const id = rm.createRoom(host);
      expect(id).toHaveLength(6);
      expect(id).toMatch(/^[A-Z2-9]{6}$/);
    });

    it("stores the room with host and lobby phase", () => {
      const host = makePlayer("h1", { isHost: true });
      const id = rm.createRoom(host);
      const room = rm.getRoom(id);
      expect(room).not.toBeNull();
      expect(room!.players).toHaveLength(1);
      expect(room!.players[0].id).toBe("h1");
      expect(room!.phase).toBe("lobby");
      expect(room!.round).toBe(0);
    });

    it("maps player to room", () => {
      const host = makePlayer("h1", { isHost: true });
      const id = rm.createRoom(host);
      expect(rm.getPlayerRoom("h1")).toBe(id);
    });
  });

  describe("joinRoom", () => {
    let roomId: string;

    beforeEach(() => {
      roomId = rm.createRoom(makePlayer("host", { isHost: true }));
    });

    it("adds a player to the room", () => {
      const p = makePlayer("p1");
      const room = rm.joinRoom(roomId, p);
      expect(room).not.toBeNull();
      expect(room!.players).toHaveLength(2);
    });

    it("prevents duplicate joins", () => {
      const p = makePlayer("p1");
      rm.joinRoom(roomId, p);
      const room = rm.joinRoom(roomId, p);
      expect(room!.players).toHaveLength(2);
    });

    it("returns null for non-existent room", () => {
      expect(rm.joinRoom("ZZZZZZ", makePlayer("p1"))).toBeNull();
    });

    it("rejects when room is full (8 players)", () => {
      for (let i = 1; i <= 7; i++) {
        rm.joinRoom(roomId, makePlayer(`p${i}`));
      }
      expect(rm.getRoom(roomId)!.players).toHaveLength(8);
      expect(rm.joinRoom(roomId, makePlayer("p8"))).toBeNull();
    });

    it("rejects when phase is not lobby", () => {
      const room = rm.getRoom(roomId)!;
      room.phase = "voting";
      expect(rm.joinRoom(roomId, makePlayer("p1"))).toBeNull();
    });

    it("maps new player to room", () => {
      rm.joinRoom(roomId, makePlayer("p1"));
      expect(rm.getPlayerRoom("p1")).toBe(roomId);
    });
  });

  describe("removePlayer", () => {
    let roomId: string;

    beforeEach(() => {
      roomId = rm.createRoom(makePlayer("host", { isHost: true }));
      rm.joinRoom(roomId, makePlayer("p1"));
    });

    it("removes a player", () => {
      const room = rm.removePlayer(roomId, "p1");
      expect(room!.players).toHaveLength(1);
    });

    it("reassigns host when host leaves", () => {
      const room = rm.removePlayer(roomId, "host");
      expect(room!.players[0].isHost).toBe(true);
      expect(room!.players[0].id).toBe("p1");
    });

    it("returns null when room becomes empty", () => {
      rm.removePlayer(roomId, "p1");
      expect(rm.removePlayer(roomId, "host")).toBeNull();
    });

    it("clears player-to-room mapping", () => {
      rm.removePlayer(roomId, "p1");
      expect(rm.getPlayerRoom("p1")).toBeUndefined();
    });
  });

  describe("getPlayer", () => {
    it("returns the player", () => {
      const roomId = rm.createRoom(makePlayer("h1", { isHost: true, name: "Host" }));
      const p = rm.getPlayer(roomId, "h1");
      expect(p).toBeDefined();
      expect(p!.name).toBe("Host");
    });

    it("returns undefined for unknown player", () => {
      const roomId = rm.createRoom(makePlayer("h1", { isHost: true }));
      expect(rm.getPlayer(roomId, "unknown")).toBeUndefined();
    });
  });

  describe("sanitizeRoom", () => {
    it("strips role from all players", () => {
      const roomId = rm.createRoom(makePlayer("h1", { isHost: true }));
      const room = rm.getRoom(roomId)!;
      room.players[0].role = "werewolf";
      const sanitized = rm.sanitizeRoom(room);
      expect(sanitized.players[0].role).toBeUndefined();
    });
  });

  describe("cleanupEmptyRooms", () => {
    it("removes rooms with no players", () => {
      const roomId = rm.createRoom(makePlayer("h1", { isHost: true }));
      rm.removePlayer(roomId, "h1");
      // Room still exists in map but with 0 players
      // removePlayer returns null but doesn't delete from map
      rm.cleanupEmptyRooms();
      expect(rm.getRoom(roomId)).toBeNull();
    });
  });
});
