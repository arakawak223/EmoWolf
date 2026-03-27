"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Player } from "../../../shared/src/types";

interface PeerStreams {
  [peerId: string]: MediaStream;
}

export function usePeer(
  localStream: MediaStream | null,
  players: Player[],
  myId: string
) {
  const [peerStreams, setPeerStreams] = useState<PeerStreams>({});
  const [myPeerId, setMyPeerId] = useState<string>("");
  const peerRef = useRef<any>(null);
  const connectionsRef = useRef<Map<string, any>>(new Map());
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !localStream || typeof window === "undefined")
      return;
    initialized.current = true;

    async function initPeer() {
      const { default: Peer } = await import("peerjs");
      const peer = new Peer();

      peer.on("open", (id) => {
        setMyPeerId(id);
        peerRef.current = peer;
      });

      peer.on("call", (call) => {
        call.answer(localStream!);
        call.on("stream", (remoteStream) => {
          setPeerStreams((prev) => ({
            ...prev,
            [call.peer]: remoteStream,
          }));
        });
        call.on("close", () => {
          setPeerStreams((prev) => {
            const next = { ...prev };
            delete next[call.peer];
            return next;
          });
        });
      });

      peer.on("error", (err) => {
        console.error("PeerJS error:", err);
      });
    }

    initPeer();

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
        initialized.current = false;
      }
    };
  }, [localStream]);

  // Call new peers when player list changes
  useEffect(() => {
    if (!peerRef.current || !localStream) return;

    const otherPlayers = players.filter(
      (p) => p.id !== myId && p.peerId && p.peerId !== myPeerId
    );

    for (const player of otherPlayers) {
      if (
        !connectionsRef.current.has(player.peerId) &&
        !peerStreams[player.peerId]
      ) {
        const call = peerRef.current.call(player.peerId, localStream);
        if (call) {
          connectionsRef.current.set(player.peerId, call);
          call.on("stream", (remoteStream: MediaStream) => {
            setPeerStreams((prev) => ({
              ...prev,
              [player.peerId]: remoteStream,
            }));
          });
          call.on("close", () => {
            connectionsRef.current.delete(player.peerId);
            setPeerStreams((prev) => {
              const next = { ...prev };
              delete next[player.peerId];
              return next;
            });
          });
        }
      }
    }
  }, [players, localStream, myId, myPeerId, peerStreams]);

  return { peerStreams, myPeerId };
}
