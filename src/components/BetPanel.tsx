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
    <div className="bg-[#020617] rounded-t-[2.5rem] border-t-2 border-primary/20 p-6 pb-10 space-y-6 shadow-[0_-20px_50px_rgba(0,102,255,0.15)]" data-no-swipe>
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary font-black text-sm uppercase italic">R$</span>
          <input
            type="number"
            min={1}
            step={1}
            value={betAmount}
            onChange={e => onBetChange(Math.max(1, Number(e.target.value)))}
            disabled={isPlaying}
            inputMode="decimal"
            className="w-full h-[64px] bg-black/40 border-2 border-white/10 rounded-[1.25rem] pl-14 pr-4 py-4 text-white font-black text-xl focus:outline-none focus:border-primary transition-all shadow-inner"
          />
        </div>

        <div className="flex gap-2 shrink-0">
          {QUICK_BETS.map(val => (
            <button
              key={val}
              onClick={() => onBetChange(val)}
              disabled={isPlaying}
              className={`
                min-w-[56px] h-[64px] px-3 rounded-[1.25rem] font-black text-base transition-all active:scale-95 border-2
                disabled:opacity-40
                ${betAmount === val
                  ? 'bg-primary text-black border-primary shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                  : 'bg-black/40 text-zinc-400 border-white/10 hover:border-white/20'
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
        className="group w-full h-[72px] bg-primary text-black font-[1000] text-xl rounded-[1.25rem] shadow-[0_8px_40px_rgba(251,191,36,0.5)] hover:shadow-[0_8px_50px_rgba(251,191,36,0.7)] active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-4 uppercase italic tracking-widest overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
        <Gamepad2 className="h-7 w-7 fill-black" />
        <span className="font-black">{isPlaying ? 'Aguarde...' : 'JOGAR E GANHAR'}</span>
      </button>
    </div>
  );
}
