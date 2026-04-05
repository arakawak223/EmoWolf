"use client";

interface RoleRevealProps {
  answer: string;
  onConfirm: () => void;
}

export function RoleReveal({ answer, onConfirm }: RoleRevealProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="animate-role-reveal text-center p-8">
        <div className="bg-gray-800 rounded-xl p-8 max-w-sm mx-auto">
          <p className="text-sm text-gray-400 mb-3">あなたのお題</p>
          <p className="text-3xl font-bold">{answer}</p>
        </div>

        <button
          onClick={onConfirm}
          className="mt-6 px-8 py-3 bg-wolf-purple hover:bg-purple-700 rounded-lg font-bold text-lg transition-colors"
        >
          お題を確認しました
        </button>

        <p className="text-gray-600 text-xs mt-4">
          この画面はあなただけに表示されています
        </p>
      </div>
    </div>
  );
}
