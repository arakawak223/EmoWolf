import { io, Socket } from "socket.io-client";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "../../../shared/src/types";

function getServerUrl(): string {
  if (process.env.NEXT_PUBLIC_SERVER_URL) {
    return process.env.NEXT_PUBLIC_SERVER_URL;
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    // GitHub Codespaces: replace port in hostname
    if (host.includes("app.github.dev")) {
      return window.location.origin.replace("-3000.", "-3001.");
    }
  }
  return "http://localhost:3001";
}

const SERVER_URL = getServerUrl();

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function getSocket(): Socket<
  ServerToClientEvents,
  ClientToServerEvents
> {
  if (!socket) {
    socket = io(SERVER_URL, {
      autoConnect: false,
    });
  }
  return socket;
}
