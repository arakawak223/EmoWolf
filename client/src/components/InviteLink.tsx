"use client";

import { useState } from "react";

export function InviteLink({ roomId }: { roomId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/room/${roomId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2 justify-center">
      <span className="font-mono text-2xl tracking-widest text-wolf-purple">
        {roomId}
      </span>
      <button
        onClick={handleCopy}
        className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition-colors"
      >
        {copied ? "コピー済み!" : "招待リンクをコピー"}
      </button>
    </div>
  );
}
