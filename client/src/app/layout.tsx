import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "WWW — WakuWaku Word Wolf",
  description: "新感覚の人狼ゲーム",
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
