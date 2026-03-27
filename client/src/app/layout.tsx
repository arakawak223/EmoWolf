import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Emo-Wolf - 表情と感情の人狼ゲーム",
  description:
    "言葉の裏にある「本音」と「表情」を突き止めろ。シンプルなお題と直感で遊ぶ新感覚の人狼ゲーム。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-wolf-dark text-white min-h-screen">{children}</body>
    </html>
  );
}
