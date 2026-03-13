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
    <div className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-[400px]">
      <button
        onClick={onCashOut}
        disabled={earnings <= 0 || lost}
        className={`
          w-full h-[64px] rounded-[1.25rem] font-black text-lg flex items-center justify-center gap-3
          transition-all active:scale-[0.97] disabled:cursor-not-allowed uppercase italic tracking-wider
          ${showLost
            ? 'bg-destructive text-destructive-foreground animate-shake'
            : 'bg-primary text-black glow-gold hover:opacity-95 disabled:opacity-40'
          }
        `}
      >
        <HandCoins className={`h-6 w-6 ${showLost ? 'fill-none' : 'fill-black'}`} />
        <span className="font-black">{showLost ? 'PERDEU TUDO' : `RESGATAR R$ ${earnings.toFixed(2)}`}</span>
      </button>
    </div>
  );
}
