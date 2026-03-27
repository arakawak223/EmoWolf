"use client";

import { useEffect, useRef, useState } from "react";

export function useMediaStream() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function init() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(mediaStream);
      } catch (err) {
        setError(
          "カメラ・マイクへのアクセスが拒否されました。ブラウザの設定を確認してください。"
        );
      } finally {
        setIsLoading(false);
      }
    }

    init();

    return () => {
      // Cleanup will be handled when component unmounts
    };
  }, []);

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  return { stream, error, isLoading, stopStream };
}
