import { Trophy, Skull } from 'lucide-react';
import { useEffect, useState } from 'react';

interface GameOverlayProps {
  type: 'won' | 'lost';
  amount: number;
  onClose: () => void;
}

export function GameOverlay({ type, amount, onClose }: GameOverlayProps) {
  const [coins, setCoins] = useState<{ id: number; left: number; delay: number }[]>([]);

  useEffect(() => {
    if (type === 'won') {
      setCoins(
        Array.from({ length: 20 }, (_, i) => ({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 1.5,
        }))
      );
    }
  }, [type]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      {type === 'won' && coins.map(c => (
        <div
          key={c.id}
          className="absolute text-2xl animate-coin-fall"
          style={{ left: `${c.left}%`, animationDelay: `${c.delay}s`, top: 0 }}
        >
          🪙
        </div>
      ))}

      <div className="glass-panel rounded-xl p-5 text-center max-w-[280px] mx-4 relative z-10">
        {type === 'won' ? (
          <>
            <Trophy className="h-10 w-10 text-primary mx-auto mb-2" />
            <h2 className="text-xl font-black text-primary text-glow-gold mb-1">
              RESGATOU!
            </h2>
            <p className="text-sm text-foreground mb-1">Você resgatou a tempo!</p>
            <p className="text-xl font-black text-secondary text-glow-blue">
              + R$ {amount.toFixed(2)}
            </p>
          </>
        ) : (
          <>
            <Skull className="h-10 w-10 text-neon-red mx-auto mb-2 animate-shake" />
            <h2 className="text-xl font-black text-neon-red mb-1">
              VOCÊ PERDEU
            </h2>
            <p className="text-sm text-muted-foreground">
              O fantasma te pegou!
            </p>
          </>
        )}

        <button
          onClick={onClose}
          className="mt-4 bg-primary text-primary-foreground font-bold px-6 py-2 rounded-xl glow-gold hover:opacity-90 transition-opacity text-sm"
        >
          {type === 'won' ? 'COLETAR' : 'TENTAR DE NOVO'}
        </button>
      </div>
    </div>
  );
}
