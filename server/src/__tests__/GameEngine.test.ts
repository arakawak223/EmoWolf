import { describe, it, expect, beforeEach, vi } from "vitest";
import { RoomManager } from "../state/RoomManager";
import { startGame, resolveVotes, handleVote, transitionTo } from "../game/GameEngine";
import type { Player } from "shared";

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

function createMockIO() {
  const emit = vi.fn();
  const to = vi.fn(() => ({ emit }));
  return { io: { to } as any, emit, to };
}

describe("GameEngine", () => {
  let rm: RoomManager;
  let roomId: string;

  beforeEach(() => {
    vi.useFakeTimers();
    rm = new RoomManager();
    roomId = rm.createRoom(makePlayer("h", { isHost: true }));
    rm.joinRoom(roomId, makePlayer("p1"));
    rm.joinRoom(roomId, makePlayer("p2"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("startGame", () => {
    it("assigns roles and picks a topic", () => {
      const { io } = createMockIO();
      startGame(io, rm, roomId);

      const room = rm.getRoom(roomId)!;
      expect(room.round).toBe(1);
      expect(room.topic).toBeDefined();
      expect(room.players.every((p) => p.isAlive)).toBe(true);

      const roles = room.players.map((p) => p.role);
      const werewolves = roles.filter((r) => r === "werewolf");
      const citizens = roles.filter((r) => r === "citizen");
      expect(werewolves).toHaveLength(1); // 3 players -> 1 werewolf
      expect(citizens).toHaveLength(2);
    });

    it("transitions to topic phase", () => {
      const { io } = createMockIO();
      startGame(io, rm, roomId);
      expect(rm.getRoom(roomId)!.phase).toBe("topic");
    });

    it("assigns 2 werewolves for 6+ players", () => {
      rm.joinRoom(roomId, makePlayer("p3"));
      rm.joinRoom(roomId, makePlayer("p4"));
      rm.joinRoom(roomId, makePlayer("p5"));

      const { io } = createMockIO();
      startGame(io, rm, roomId);

      const room = rm.getRoom(roomId)!;
      const werewolves = room.players.filter((p) => p.role === "werewolf");
      expect(werewolves).toHaveLength(2);
    });
  });

  describe("transitionTo", () => {
    it("updates phase and emits events", () => {
      const { io, to, emit } = createMockIO();
      transitionTo(io, rm, roomId, "topic");

      const room = rm.getRoom(roomId)!;
      expect(room.phase).toBe("topic");
      expect(to).toHaveBeenCalledWith(roomId);
      expect(emit).toHaveBeenCalledWith("game:phaseChange", "topic", expect.any(Number));
    });

    it("auto-transitions to next phase after duration", () => {
      const { io } = createMockIO();
      const room = rm.getRoom(roomId)!;
      room.topic = { category: "test", majority: "A", minority: "B", emotionGap: "" };
      room.players.forEach((p) => (p.role = "citizen"));

      transitionTo(io, rm, roomId, "topic");

      expect(room.phase).toBe("topic");
      vi.advanceTimersByTime(5_000);
      expect(room.phase).toBe("roleReveal");
    });

    it("sends private role reveals during roleReveal phase", () => {
      const { io, emit } = createMockIO();
      const room = rm.getRoom(roomId)!;
      room.topic = { category: "test", majority: "A", minority: "B", emotionGap: "" };
      room.players[0].role = "citizen";
      room.players[1].role = "werewolf";
      room.players[2].role = "citizen";

      transitionTo(io, rm, roomId, "roleReveal");

      const roleRevealCalls = emit.mock.calls.filter(
        (c: any[]) => c[0] === "game:roleReveal"
      );
      expect(roleRevealCalls.length).toBeGreaterThan(0);
    });

    it("resets votes when entering voting phase", () => {
      const { io } = createMockIO();
      const room = rm.getRoom(roomId)!;
      room.votes = { h: "p1" };
      transitionTo(io, rm, roomId, "voting");
      expect(room.votes).toEqual({});
    });
  });

  describe("resolveVotes", () => {
    it("eliminates the player with most votes", () => {
      const { io } = createMockIO();
      const room = rm.getRoom(roomId)!;
      room.players[0].role = "citizen";
      room.players[1].role = "werewolf";
      room.players[2].role = "citizen";
      room.votes = { h: "p1", p2: "p1" };

      resolveVotes(io, rm, roomId);

      const p1 = room.players.find((p) => p.id === "p1")!;
      expect(p1.isAlive).toBe(false);
    });

    it("reports citizens win when werewolf is eliminated", () => {
      const { io, emit } = createMockIO();
      const room = rm.getRoom(roomId)!;
      room.players[0].role = "citizen";
      room.players[1].role = "werewolf";
      room.players[2].role = "citizen";
      room.votes = { h: "p1", p2: "p1" };

      resolveVotes(io, rm, roomId);

      const resultCall = emit.mock.calls.find((c: any[]) => c[0] === "game:result");
      expect(resultCall).toBeDefined();
      expect(resultCall![1].winner).toBe("citizens");
      expect(resultCall![1].eliminatedId).toBe("p1");
    });

    it("reports werewolf wins when citizen is eliminated", () => {
      const { io, emit } = createMockIO();
      const room = rm.getRoom(roomId)!;
      room.players[0].role = "citizen";
      room.players[1].role = "werewolf";
      room.players[2].role = "citizen";
      room.votes = { h: "p2", p1: "p2" };

      resolveVotes(io, rm, roomId);

      const resultCall = emit.mock.calls.find((c: any[]) => c[0] === "game:result");
      expect(resultCall![1].winner).toBe("werewolf");
    });

    it("handles tie by picking one of the tied players", () => {
      const { io } = createMockIO();
      const room = rm.getRoom(roomId)!;
      room.players[0].role = "citizen";
      room.players[1].role = "werewolf";
      room.players[2].role = "citizen";
      room.votes = { h: "p1", p1: "p2" }; // 1 vote each

      resolveVotes(io, rm, roomId);

      const eliminated = room.players.filter((p) => !p.isAlive);
      expect(eliminated).toHaveLength(1);
      expect(["p1", "p2"]).toContain(eliminated[0].id);
    });

    it("handles no votes gracefully", () => {
      const { io, emit } = createMockIO();
      const room = rm.getRoom(roomId)!;
      room.players[0].role = "citizen";
      room.players[1].role = "werewolf";
      room.players[2].role = "citizen";
      room.votes = {};

      resolveVotes(io, rm, roomId);

      const resultCall = emit.mock.calls.find((c: any[]) => c[0] === "game:result");
      expect(resultCall![1].eliminatedId).toBeNull();
    });
  });

  describe("handleVote", () => {
    it("records a vote", () => {
      const { io } = createMockIO();
      const room = rm.getRoom(roomId)!;
      room.phase = "voting";
      room.players.forEach((p) => (p.role = "citizen"));

      handleVote(io, rm, roomId, "h", "p1");
      expect(room.votes["h"]).toBe("p1");
    });

    it("ignores vote if not in voting phase", () => {
      const { io } = createMockIO();
      const room = rm.getRoom(roomId)!;
      room.phase = "freeTalk";

      handleVote(io, rm, roomId, "h", "p1");
      expect(room.votes["h"]).toBeUndefined();
    });

    it("resolves immediately when all alive players have voted", () => {
      const { io, emit } = createMockIO();
      const room = rm.getRoom(roomId)!;
      room.phase = "voting";
      room.players[0].role = "citizen";
      room.players[1].role = "werewolf";
      room.players[2].role = "citizen";

      handleVote(io, rm, roomId, "h", "p1");
      handleVote(io, rm, roomId, "p1", "h");
      handleVote(io, rm, roomId, "p2", "p1");

      const resultCall = emit.mock.calls.find((c: any[]) => c[0] === "game:result");
      expect(resultCall).toBeDefined();
    });
  });
});
