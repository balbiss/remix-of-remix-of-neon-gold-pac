import { Gamepad2 } from 'lucide-react';

interface BetPanelProps {
  betAmount: number;
  onBetChange: (val: number) => void;
  onPlay: () => void;
  disabled: boolean;
  earnings: number;
  isPlaying: boolean;
}

const QUICK_BETS = [1, 5, 10, 25];

export function BetPanel({ betAmount, onBetChange, onPlay, disabled, isPlaying }: BetPanelProps) {
  return (
    <div className="glass-panel rounded-xl p-2 space-y-1.5" data-no-swipe>
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1 min-w-0">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs">R$</span>
          <input
            type="number"
            min={0.5}
            step={0.5}
            value={betAmount}
            onChange={e => onBetChange(Math.max(0.5, Number(e.target.value)))}
            disabled={isPlaying}
            className="w-full bg-input border border-border rounded-lg pl-8 pr-2 py-2 text-foreground font-black text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-40 transition-opacity"
          />
        </div>

        <div className="flex gap-1 shrink-0">
          {QUICK_BETS.map(val => (
            <button
              key={val}
              onClick={() => onBetChange(val)}
              disabled={isPlaying}
              className={`
                min-w-[36px] py-2 rounded-lg font-bold text-xs transition-all active:scale-95
                disabled:opacity-40
                ${betAmount === val
                  ? 'bg-primary text-primary-foreground glow-gold'
                  : 'bg-muted text-foreground hover:bg-border active:bg-border'
                }
              `}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onPlay}
        disabled={disabled}
        className="w-full bg-primary text-primary-foreground font-black text-sm py-2.5 rounded-xl glow-gold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Gamepad2 className="h-4 w-4" />
        {isPlaying ? 'JOGANDO...' : 'JOGAR E GANHAR'}
      </button>
    </div>
  );
}
