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
    <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-40 w-[85%] max-w-[360px]">
      <button
        onClick={onCashOut}
        disabled={earnings <= 0 || lost}
        className={`
          w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2
          transition-all active:scale-[0.97] disabled:cursor-not-allowed
          ${showLost
            ? 'bg-destructive text-destructive-foreground animate-shake'
            : 'bg-primary text-primary-foreground glow-gold hover:opacity-90 disabled:opacity-40'
          }
        `}
      >
        <HandCoins className="h-4 w-4" />
        {showLost ? 'PERDEU TUDO' : `RESGATAR R$ ${earnings.toFixed(2)}`}
      </button>
    </div>
  );
}
