import type { Server } from "socket.io";
import type {
  Room,
  Player,
  GamePhase,
  ServerToClientEvents,
  ClientToServerEvents,
} from "../../../shared/src/types";
import { TOPICS } from "../../../shared/src/topics";
import { PHASE_DURATIONS, getWerewolfCount } from "../../../shared/src/constants";
import { RoomManager } from "../state/RoomManager";

type GameIO = Server<ClientToServerEvents, ServerToClientEvents>;

const phaseTimers = new Map<string, NodeJS.Timeout>();

export function startGame(
  io: GameIO,
  roomManager: RoomManager,
  roomId: string
): void {
  const room = roomManager.getRoom(roomId);
  if (!room) return;

  // Reset state
  room.round += 1;
  room.votes = {};
  room.players.forEach((p) => {
    p.isAlive = true;
    p.emotion = undefined;
    p.role = undefined;
  });

  // Pick topic
  room.topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

  // Assign roles
  assignRoles(room);

  // Begin phase sequence
  transitionTo(io, roomManager, roomId, "topic");
}

function assignRoles(room: Room): void {
  const count = getWerewolfCount(room.players.length);
  const shuffled = [...room.players].sort(() => Math.random() - 0.5);

  for (let i = 0; i < room.players.length; i++) {
    room.players[i].role = i < count ? "werewolf" : "citizen";
  }

  // Re-shuffle to randomize positions
  const roles: Array<"werewolf" | "citizen"> = shuffled.map((_, idx) => idx < count ? "werewolf" : "citizen");
  room.players.forEach((p, i) => {
    const shuffledIdx = shuffled.findIndex((sp) => sp.id === p.id);
    p.role = roles[shuffledIdx];
  });
}

export function transitionTo(
  io: GameIO,
  roomManager: RoomManager,
  roomId: string,
  phase: GamePhase
): void {
  const room = roomManager.getRoom(roomId);
  if (!room) return;

  // Clear previous timer
  const existing = phaseTimers.get(roomId);
  if (existing) clearTimeout(existing);

  room.phase = phase;
  const duration = PHASE_DURATIONS[phase];
  const deadline = duration ? Date.now() + duration : 0;
  room.phaseDeadline = deadline;

  // Emit phase change
  io.to(roomId).emit("game:phaseChange", phase, deadline);
  io.to(roomId).emit("room:state", roomManager.sanitizeRoom(room));

  // Send private role info during roleReveal
  if (phase === "roleReveal") {
    room.players.forEach((p) => {
      const answer =
        p.role === "werewolf" ? room.topic!.minority : room.topic!.majority;
      io.to(p.id).emit("game:roleReveal", {
        role: p.role!,
        answer,
      });
    });
  }

  // Reset votes when entering voting phase
  if (phase === "voting") {
    room.votes = {};
  }

  // Auto-transition based on phase
  if (duration) {
    const nextPhase = getNextPhase(phase);
    if (nextPhase) {
      const timer = setTimeout(() => {
        if (phase === "voting") {
          resolveVotes(io, roomManager, roomId);
        }
        transitionTo(io, roomManager, roomId, nextPhase);
      }, duration);
      phaseTimers.set(roomId, timer);
    }
  }
}

function getNextPhase(current: GamePhase): GamePhase | null {
  const flow: GamePhase[] = [
    "topic",
    "roleReveal",
    "emotionDeclare",
    "freeTalk",
    "voting",
    "result",
    "lobby",
  ];
  const idx = flow.indexOf(current);
  return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null;
}

export function resolveVotes(
  io: GameIO,
  roomManager: RoomManager,
  roomId: string
): void {
  const room = roomManager.getRoom(roomId);
  if (!room) return;

  const tally = new Map<string, number>();
  for (const targetId of Object.values(room.votes)) {
    tally.set(targetId, (tally.get(targetId) || 0) + 1);
  }

  let maxVotes = 0;
  let eliminated: string[] = [];
  for (const [id, count] of tally) {
    if (count > maxVotes) {
      maxVotes = count;
      eliminated = [id];
    } else if (count === maxVotes) {
      eliminated.push(id);
    }
  }

  // Tie-break: random
  const eliminatedId =
    eliminated.length > 0
      ? eliminated[Math.floor(Math.random() * eliminated.length)]
      : null;

  if (eliminatedId) {
    const player = room.players.find((p) => p.id === eliminatedId);
    if (player) player.isAlive = false;
  }

  const werewolfIds = room.players
    .filter((p) => p.role === "werewolf")
    .map((p) => p.id);

  const werewolfEliminated = eliminatedId
    ? werewolfIds.includes(eliminatedId)
    : false;
  const winner = werewolfEliminated ? "citizens" : "werewolf";

  io.to(roomId).emit("game:result", {
    werewolfIds,
    winner,
    eliminatedId,
  });
}

export function handleVote(
  io: GameIO,
  roomManager: RoomManager,
  roomId: string,
  voterId: string,
  targetId: string
): void {
  const room = roomManager.getRoom(roomId);
  if (!room || room.phase !== "voting") return;

  room.votes[voterId] = targetId;

  // Check if all alive players have voted
  const alivePlayers = room.players.filter((p) => p.isAlive);
  const allVoted = alivePlayers.every((p) => room.votes[p.id]);

  if (allVoted) {
    // Clear the phase timer and resolve immediately
    const existing = phaseTimers.get(roomId);
    if (existing) clearTimeout(existing);

    resolveVotes(io, roomManager, roomId);
    transitionTo(io, roomManager, roomId, "result");
  }
}
