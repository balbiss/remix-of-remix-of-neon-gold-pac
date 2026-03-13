import { useEffect, useState } from 'react';
import { HandCoins } from 'lucide-react';

interface CashOutButtonProps {
  earnings: number;
  onCashOut: () => void;
  lost: boolean;
}

export function CashOutButton({ earnings, onCashOut, lost }: CashOutButtonProps) {
  const [showLost, setShowLost] = useState(false);

  useEffect(() => {
    if (lost) {
      setShowLost(true);
      const t = setTimeout(() => setShowLost(false), 2000);
      return () => clearTimeout(t);
    }
  }, [lost]);

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-[400px]">
      <button
        onClick={onCashOut}
        disabled={earnings <= 0 || lost}
        className={`
          w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2.5
          transition-all active:scale-[0.97] disabled:cursor-not-allowed
          ${showLost
            ? 'bg-destructive text-destructive-foreground animate-shake'
            : 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-40'
          }
        `}
      >
        <HandCoins className="h-5 w-5" />
        {showLost ? 'PERDEU TUDO' : `RESGATAR R$ ${earnings.toFixed(2)}`}
      </button>
    </div>
  );
}
