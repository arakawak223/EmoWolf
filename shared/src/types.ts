export type Role = "citizen" | "werewolf";

export type GamePhase =
  | "lobby"
  | "topic"
  | "roleReveal"
  | "emotionDeclare"
  | "freeTalk"
  | "voting"
  | "result";

export interface Player {
  id: string;
  peerId: string;
  name: string;
  role?: Role;
  emotion?: string;
  isHost: boolean;
  isReady: boolean;
  isAlive: boolean;
}

export interface Topic {
  category: string;
  majority: string;
  minority: string;
  emotionGap: string;
}

export interface Room {
  id: string;
  players: Player[];
  phase: GamePhase;
  topic?: Topic;
  phaseDeadline?: number;
  votes: Record<string, string>;
  round: number;
}

export interface ServerToClientEvents {
  "room:state": (room: Room) => void;
  "room:error": (msg: string) => void;
  "game:roleReveal": (data: { role: Role; answer: string }) => void;
  "game:phaseChange": (phase: GamePhase, deadline: number) => void;
  "game:result": (data: {
    werewolfIds: string[];
    winner: "citizens" | "werewolf";
    eliminatedId: string | null;
  }) => void;
  "emotion:reaction": (data: {
    fromId: string;
    toId: string;
    reaction: string;
  }) => void;
}

export interface ClientToServerEvents {
  "room:create": (
    playerName: string,
    callback: (roomId: string) => void
  ) => void;
  "room:join": (
    roomId: string,
    playerName: string,
    peerId: string,
    callback: (success: boolean, error?: string) => void
  ) => void;
  "room:ready": () => void;
  "room:updatePeerId": (peerId: string) => void;
  "game:start": () => void;
  "emotion:declare": (emotion: string) => void;
  "emotion:react": (data: { toId: string; reaction: string }) => void;
  "game:vote": (targetId: string) => void;
}
