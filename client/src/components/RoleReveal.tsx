"use client";

interface RoleRevealProps {
  answer: string;
}

export function RoleReveal({ answer }: RoleRevealProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="animate-role-reveal text-center p-8">
        <div className="bg-gray-800 rounded-xl p-8 max-w-sm mx-auto">
          <p className="text-sm text-gray-400 mb-3">あなたのお題</p>
          <p className="text-3xl font-bold">{answer}</p>
        </div>

        <p className="text-gray-600 text-xs mt-6">
          この画面はあなただけに表示されています
        </p>
      </div>
    </div>
  );
}
