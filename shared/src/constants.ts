export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 8;

export const PHASE_DURATIONS: Record<string, number> = {
  topic: 5_000,
  roleReveal: 5_000,
  emotionDeclare: 30_000,
  freeTalk: 120_000,
  voting: 30_000,
  result: 10_000,
};

export function getWerewolfCount(playerCount: number): number {
  if (playerCount <= 5) return 1;
  return 2;
}

export const EMOTIONS = [
  { id: "wakuwaku", label: "ワクワク", emoji: "✨" },
  { id: "moyamoya", label: "モヤモヤ", emoji: "😶‍🌫️" },
  { id: "piripiri", label: "ピリピリ", emoji: "⚡" },
  { id: "honwaka", label: "ほんわか", emoji: "☺️" },
  { id: "zawa", label: "ザワザワ", emoji: "😨" },
  { id: "niko", label: "ニコニコ", emoji: "😊" },
  { id: "ira", label: "イライラ", emoji: "😤" },
  { id: "shonbori", label: "しょんぼり", emoji: "😢" },
] as const;

export const REACTIONS = [
  { id: "nattoku", label: "納得", emoji: "👍" },
  { id: "ayashii", label: "怪しい", emoji: "🤨" },
  { id: "warai", label: "笑", emoji: "😂" },
  { id: "bikkuri", label: "びっくり", emoji: "😲" },
] as const;
