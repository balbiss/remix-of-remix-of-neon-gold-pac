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

      <div className="glass-panel rounded-2xl p-8 text-center max-w-sm mx-4 relative z-10">
        {type === 'won' ? (
          <>
            <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-black text-primary text-glow-gold mb-2">
              VOCÊ GANHOU!
            </h2>
            <p className="text-lg text-foreground mb-1">Você dobrou sua aposta!</p>
            <p className="text-3xl font-black text-secondary text-glow-blue">
              + R$ {amount.toFixed(2)}
            </p>
          </>
        ) : (
          <>
            <Skull className="h-16 w-16 text-neon-red mx-auto mb-4 animate-shake" />
            <h2 className="text-3xl font-black text-neon-red mb-2">
              VOCÊ PERDEU
            </h2>
            <p className="text-lg text-muted-foreground">
              O fantasma te pegou! Tente novamente.
            </p>
          </>
        )}

        <button
          onClick={onClose}
          className="mt-6 bg-primary text-primary-foreground font-bold px-8 py-3 rounded-xl glow-gold hover:opacity-90 transition-opacity"
        >
          {type === 'won' ? 'COLETAR' : 'TENTAR DE NOVO'}
        </button>
      </div>
    </div>
  );
}
