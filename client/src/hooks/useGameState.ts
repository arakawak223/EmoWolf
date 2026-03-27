"use client";

import { useEffect, useReducer, useCallback } from "react";
import { Socket } from "socket.io-client";
import type {
  Room,
  Role,
  GamePhase,
  ServerToClientEvents,
  ClientToServerEvents,
} from "../../../shared/src/types";

interface GameState {
  room: Room | null;
  myRole: Role | null;
  myAnswer: string | null;
  phase: GamePhase;
  phaseDeadline: number;
  result: {
    werewolfIds: string[];
    winner: "citizens" | "werewolf";
    eliminatedId: string | null;
  } | null;
  error: string | null;
}

type GameAction =
  | { type: "ROOM_STATE"; room: Room }
  | { type: "ROLE_REVEAL"; role: Role; answer: string }
  | { type: "PHASE_CHANGE"; phase: GamePhase; deadline: number }
  | {
      type: "RESULT";
      werewolfIds: string[];
      winner: "citizens" | "werewolf";
      eliminatedId: string | null;
    }
  | { type: "ERROR"; message: string }
  | { type: "CLEAR_ERROR" };

const initialState: GameState = {
  room: null,
  myRole: null,
  myAnswer: null,
  phase: "lobby",
  phaseDeadline: 0,
  result: null,
  error: null,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "ROOM_STATE":
      return { ...state, room: action.room };
    case "ROLE_REVEAL":
      return { ...state, myRole: action.role, myAnswer: action.answer };
    case "PHASE_CHANGE":
      return {
        ...state,
        phase: action.phase,
        phaseDeadline: action.deadline,
        ...(action.phase === "lobby"
          ? { myRole: null, myAnswer: null, result: null }
          : {}),
      };
    case "RESULT":
      return {
        ...state,
        result: {
          werewolfIds: action.werewolfIds,
          winner: action.winner,
          eliminatedId: action.eliminatedId,
        },
      };
    case "ERROR":
      return { ...state, error: action.message };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

export function useGameState(
  socket: Socket<ServerToClientEvents, ClientToServerEvents>
) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    socket.on("room:state", (room) => {
      dispatch({ type: "ROOM_STATE", room });
    });

    socket.on("game:roleReveal", ({ role, answer }) => {
      dispatch({ type: "ROLE_REVEAL", role, answer });
    });

    socket.on("game:phaseChange", (phase, deadline) => {
      dispatch({ type: "PHASE_CHANGE", phase, deadline });
    });

    socket.on("game:result", ({ werewolfIds, winner, eliminatedId }) => {
      dispatch({ type: "RESULT", werewolfIds, winner, eliminatedId });
    });

    socket.on("room:error", (msg) => {
      dispatch({ type: "ERROR", message: msg });
    });

    return () => {
      socket.off("room:state");
      socket.off("game:roleReveal");
      socket.off("game:phaseChange");
      socket.off("game:result");
      socket.off("room:error");
    };
  }, [socket]);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  return { ...state, clearError };
}
